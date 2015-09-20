/**
 * File: intuit.js
 * Main module for feed aggregation.
 */

var parser = require('./parser.js').Parser;
var mongojs = require("mongojs");
var mongo = require('mongodb');
var appCredentials = require('./applicationCredentials.js');
var _ = require('underscore');
var um = require('./userManagement.js');
var qs = require('querystring');
/**
 * Get the databaseUrl from the applicationCredentials.js file.
 * @type {string}
 */
var databaseUrl = appCredentials.databaseUrl
var collections = ["storiesServed"];
var db =  mongojs(databaseUrl, collections);

/**
 * Shuffles array
 * @param  {Array}
 * @return {Array}
 */
var shuffle = function(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
 }
}

/**
 * Initially shows the three sources for all the topics
 * @param  {request}
 * @param  {response}
 */
exports.showFeed = function(request, response) {
	var userCookie = request.cookies;
	if( ((typeof userCookie.ecommit_email)==='undefined') || ((typeof userCookie.ecommit_passwordHash)==='undefined') ) {
			response.render('error',{message: "Please login"} );
			return false; // user is not logged in
		}else {
			email = um.decryptCookieData(userCookie.ecommit_email);
			getSuggestedFeeds(email,response,false);	
		}
};

/**
 * Fetches more feeds based on page.
 * @param  {request}
 * @param  {response}
 */
exports.getMoreFeeds = function(request, response) {
	var params =   { 'youtube': ['marriage', 'housing', 'kids'],
    				'ttlc': {
        				'tags': ['married', 'child'],
        				'page': Number(request.params.page)
    				},
     				'ttblog': ['home','child']};
  	
	var userCookie = request.cookies;
		if( ((typeof userCookie.ecommit_email)==='undefined') || ((typeof userCookie.ecommit_passwordHash)==='undefined') ) {
			response.render('error',{message: "Please login"} );
			return false; // user is not logged in
		}else {
			email = um.decryptCookieData(userCookie.ecommit_email);
			/**
  	 		* Begin parsing form data
  	 		* @type {parser}
  	 		*/
  			var body = '';
    		request.on('data', function (data) {
        	body += data;

        	// Too much POST data, kill the connection!
        	if (body.length > 1e6)
            	request.connection.destroy();
    		});

    		request.on('end', function () {
        		var post = qs.parse(body);
        		saveClickedStories({'married': post.married, 'house': post.house, 'children': post.children},email,response);
        		// getSuggestedFeeds(email,response,true);
    		});
  			/**
  	 		 * End of parsing form datta
  	 		 * @type {parser}
  	 		 */
		}
};

/**
 * Saves the count of the number of times the user has clicked each category.
 * @param  {JSON} Count Object
 * @param  {String} Email address of the user
 */
var saveClickedStories = function(count,email,response) {
	db.storiesServed.find({email: {$in: [email]}}, function(err,user){
		if(user.length > 0) {
			var clicked = user[0].clicked;
			if (clicked !== undefined) {				
				var keys = _.keys(clicked);
				var newObj = {};
				_.each(keys, function(ele) {
					count[ele] = parseInt(count[ele]) + parseInt(clicked[ele]);
				});
			}
			updateClickedStoryCount(count,email);
		}else {
			addUserClicked(count,email);
		}
		getSuggestedFeeds(email,response,true);
	})
};

/**
 * Updates the database with the new metric count.
 * @param  {JSON} Count json
 * @param  {String} email address of the user
 */
var updateClickedStoryCount = function(count,email) {
	db.storiesServed.update(
	{'email': email }, {
			$set: {
				'clicked': count
			}
		}, function(err, result) {
			if(err)
				throw err;
		});
};

/**
 * Adds new user entry if the user has visited first time/
 * @param {JSON} Search metric
 * @param {String} Email address of the user
 */
var addUserClicked = function(count,email) {
	db.storiesServed.save( {
		'email': email
	}, function(err,saved){
		updateClickedStoryCount(count,email);
	});
}

/**
 * Save total stories servered to the user
 * @param  {JSON} Count metric
 * @param  {String} Email address of the user
 */
var saveTotalStories = function(count,email) {
	db.storiesServed.find({email: {$in: [email]}}, function(err,user){
		if(user.length > 0) {
			updateTotalStoryCount(count,email);
		}else {
			addUserTotal(count,email);
		}
	})
}

/**
 * Updates database with the metric count/
 * @param  {JSON} Count metric
 * @param  {String} Email address
 */
var updateTotalStoryCount = function(count,email) {
	db.storiesServed.update(
	{'email': email }, {
			$set: {
				'total': count
			}
		}, function(err, result) {
			if(err)
				throw err;
		});
};

/**
 * Adds new user entry to the database when the use does not have history.
 * @param {JSON} Count metric
 * @param {Email} Email address of the user
 */
var addUserTotal = function(count,email) {
	db.storiesServed.save( {
		'email': email
	}, function(err,saved){
		if(saved) {
			updateTotalStoryCount(count,email);
		}	
	});
} 

/**
 * Updates count of each category.
 * @param  {feed} Raw/unbiased feed
 * @param  {email} Email address
 */
var saveCategoryCount = function(feed,email) {
	var house = 0;
	var married = 0;
	var children = 0;
	db.storiesServed.findOne({'email': email}, function(err,result){
		if(result!=null) {
			married = result.total.married;
			house = result.total.house;
			children = result.total.house;
		}
		_.each(feed,function(ele){
			if(ele.category == 'house') 
				house++;
			else if(ele.category == 'married')
				married++;
			else if(ele.category == 'children')
				children++;
		});
		saveTotalStories({'house': house, 'married': married, 'children': children },email);
	});
	
}

/**
 * Calculates percentage share of each category based on users preferences.
 * @param  {JSON} Total articles serverd to the user
 * @param  {JSON} Aricles clicked by the user.
 */
var getPercentages = function(total, clicked) {
	var marriageClicked = clicked.married/total.married;
	var childClicked = clicked.children/total.children;
	var houseClicked = clicked.house/total.house;

	var total = marriageClicked + childClicked + houseClicked;

	var marriage = marriageClicked/total;
	var children = childClicked/total;
	var house = houseClicked/total;

	//thresholding to avoid flooding results of one category onle
	if ( marriage > 0.8 ) {
		marriage = 0.8;
		children = 0.1;
		house = 0.1;
	} else if ( children > 0.8 ) {
		marriage = 0.1;
		children = 0.8;
		house = 0.1;
	} else if ( house > 0.8 ) {
		marriage = 0.1;
		children = 0.1;
		house = 0.8;
	}

	return {
		'marriage': marriage,
		'children': children,
		'house': house
	};
}

/**
 * This function contains logic for the recommender system.
 * Based on users clicked and total articles served it provides similar articles
 * @param  {String} Email address
 * @param  {response} HTTP response object
 * @param  {Boolean} True for JSON format else false for html
 */
var getSuggestedFeeds = function(email,response,serveJSON) {
	var params =   { 'youtube': ['marriage', 'housing', 'kids'],
    				'ttlc': {
        				'tags': ['married', 'child'],
        				'page': Math.floor(Math.random() * 10) + 1  
    				},
     				'ttblog': ['home','family']};
    var p = new parser(params);
	db.storiesServed.findOne({'email':email},function(err,result){
		if(result == undefined || result.clicked == undefined ) {	
			var feed = p.fetchContent().done(function(feed){
				shuffle(feed);
				feed = feed.slice(0,20);
				saveCategoryCount(feed,email);
				response.render('myFeed', {"data": feed});
			});
		}else {
				var percentages = getPercentages(result.total,result.clicked);
				var house = new Array();
				var married = new Array();
				var children = new Array();
				var feed = p.fetchContent().done(function(feed){
					_.each(feed,function(ele){
						if(ele.category == 'house') {
							house.push(ele);
						}else if(ele.category == 'married') {
							married.push(ele);
						}else if(ele.category == 'children') {
							children.push(ele);
						}
					});

					shuffle(house);
					shuffle(married);
					shuffle(children);

					house = house.slice(0,Math.floor((percentages.house)*20));
					married = married.slice(0,Math.floor((percentages.marriage)*20));
					children = children.slice(0,Math.floor((percentages.children)*20));	
					
					var result = new Array();					
					if(percentages.house > percentages.marriage && percentages.house > percentages.children) {						
						result = result.concat(house);
						if(percentages.marriage > percentages.children) {
							result = result.concat(married,children);
						}else {
							result =result.concat(children,married);
						}
					}else if ( percentages.marriage > house  && percentages.marriage > children) {
						result = result.concat(married);
						if(percentages.house > percentages.children) {
							result = result.concat(house,children);
						}else {
							result = result.concat(children,house);
						}
					}else {
						result = result.concat(children);
						if(percentages.marriage > percentages.house) {
							 result = result.concat(married,house);
						}else {
							 result = result.concat(house,married);
						}
					}
					saveCategoryCount(result,email);
					if(!serveJSON) {
						response.render('myFeed',{'data': result});
					}
					else {
						response.send(result);
					}
				});
			}
	});
}


