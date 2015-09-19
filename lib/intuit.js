var parser = require('./parser.js').Parser;
var mongojs = require("mongojs");
var mongo = require('mongodb');
var appCredentials = require('./applicationCredentials.js');
var collections = ["storiesServed"];
var _ = require('underscore');
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
	
	var params =   { 'youtube': ['marriage', 'housing', 'kids'],
    				'ttlc': {
        				'tags': ['married', 'child'],
        				'page': 1
    				},
     				'ttblog': ['home','family']};
	var p = new parser(params);
	var feed = p.fetchContent().done(function(feed) {
		shuffle(feed);
		var count = getCategoryCount(feed,'bs.sameer1@gmail.com');
		console.log(count);
		
		response.render('myFeed', {"data":feed});
	});
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
  				
	var p = new parser();
	var feed = p.fetchTtlc(params.ttlc).done(function(feed) {
		response.send(feed);
	});
};

exports.saveClickedStories = function(count,email) {
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

var getCategoryCount = function(feed,email) {
	var house = 0;
	var married = 0;
	var children = 0;
	return db.storiesServed.findOne({'email': email}, function(err,result){
		console.log(result);
		married = result.total.married;
		house = result.total.house;
		children = result.total.house;

		_.each(feed,function(ele){
			if(ele.category == 'house') 
				house++;
			else if(ele.category == 'married')
				married++;
			else if(ele.category == 'children')
				children++;
		});
		saveTotalStories({'house': house, 'married': married, 'children': children },'bs.sameer1@gmail.com');
	});
	
}
