var parser = require('./parser.js').Parser;

exports.showFeed = function(request, response) {
	
	var params =   { 'youtube': ['marriage', 'housing', 'kids'],
    				'ttlc': {
        				'tags': ['married', 'child'],
        				'page': 1
    				},
     				'ttblog': ['home','family']};
	var p = new parser(params);
	var feed = p.fetchContent().done(function(feed) {
		response.render('myFeed', {"data":feed});
	});
};

exports.getMoreFeeds = function(request, response) {
	var params =   { 'youtube': ['marriage', 'housing', 'kids'],
    				'ttlc': {
        				'tags': ['married', 'child'],
        				'page': 2
    				},
     				'ttblog': ['home','child']};
  				
	var p = new parser();
	var feed = p.fetchTtlc(params.ttlc).done(function(feed) {
		response.send(feed);
	});
};