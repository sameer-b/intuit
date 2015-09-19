var parser = require('./parser.js').Parser;

exports.showFeed = function(request, response) {
	var p = new parser();
	var feed = p.fetchContent().done(function(feed) {
		console.log(feed);
		response.render('myFeed', {"data":feed});
	});
};