var parser = require('./parser.js').Parser;
var mongojs = require("mongojs");
var mongo = require('mongodb');
var appCredentials = require('./applicationCredentials.js');
var collections = ["storiesServed"];
var _ = require('underscore');
var um = require('./userManagement.js');
var qs = require('querystring');
/**
 * Get the databaseUrl from the applicationCredentials.js file.
 * @type {string}
 */
var databaseUrl = appCredentials.databaseUrl


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
        		saveClickedStories({'married': post.married, 'house': post.house, 'children': post.children},email);
        		getSuggestedFeeds(email,response,true);
    		});
  			/**
  	 		 * End of parsing form datta
  	 		 * @type {parser}
  	 		 */
 
		}

/*	var p = new parser();
	var feed = p.fetchTtlc(params.ttlc).done(function(feed) {
		response.send(feed);
	});*/
};

var saveClickedStories = function(count,email) {
	db.storiesServed.find({email: {$in: [email]}}, function(err,user){
		if(user.length > 0) {
			updateClickedStoryCount(count,email);
		}else {
			addUserClicked(count,email);
		}
	})
};

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

var addUserClicked = function(count,email) {
	db.storiesServed.save( {
		'email': email
	}, function(err,saved){
		updateClickedStoryCount(count,email);
	});
}

var saveTotalStories = function(count,email) {
	db.storiesServed.find({email: {$in: [email]}}, function(err,user){
		if(user.length > 0) {
			updateTotalStoryCount(count,email);
		}else {
			addUserTotal(count,email);
		}
	})
}

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

var addUserTotal = function(count,email) {
	db.storiesServed.save( {
		'email': email
	}, function(err,saved){
		if(saved) {
			updateTotalStoryCount(count,email);
		}	
	});
} 

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

var getPercentages = function(total, clicked) {
	var marriageClicked = clicked.married/total.married;
	var childClicked = clicked.children/total.children;
	var houseClicked = clicked.house/clicked.house;

	var total = marriageClicked + childClicked + houseClicked;

	return {
		'marriage': (marriageClicked/total),
		'children': (childClicked/total),
		'house': (houseClicked/total)


	};
}


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
					married = married.slice(0,Math.floor((percentages.married)*20));
					children = children.slice(0,Math.floor((percentages.children)*20));	
					
					var result = new Array();

					if(percentages.house > percentages.married && percentages.house > percentages.children) {
						result = result.concat(house);
						if(percentages.married > percentages.children) {
							result.concat(married,children);
						}else {
							result =result.concat(children,married);
						}
					}else if ( percentages.married > house  && percentages.married > children) {
						result.concat(married);
						if(percentages.house > percentages.children) {
							result = result.concat(house,children);
						}else {
							result = result.concat(children,house);
						}
					}else {
						result.concat(children);
						if(percentages.married > percentages.house) {
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


