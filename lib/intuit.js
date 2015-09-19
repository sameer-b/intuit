var parser = require('./parser.js').Parser;

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