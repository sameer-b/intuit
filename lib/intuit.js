

exports.showFeed = function(request, response) {
	
	var feed = [
	{
		"title": "How to save your money",
		"Description": "Save your money today!",
		"date": "20 Decemver 2014",
		"url": "www.google.com",
		"thumbnail": "http://img.youtube.com/vi/<insert-youtube-video-id-here>/0.jpg"
	},
	{
		"title": "How to save your money",
		"Description": "Save your money today!",
		"date": "20 Decemver 2014",
		"url": "www.google.com",
		"thumbnail": "http://img.youtube.com/vi/<insert-youtube-video-id-here>/0.jpg"
	},
	{
		"title": "How to save your money",
		"Description": "Save your money today!",
		"date": "20 Decemver 2014",
		"url": "www.google.com",
		"thumbnail": "http://img.youtube.com/vi/<insert-youtube-video-id-here>/0.jpg"
	}];
	response.render('myFeed', {"data":feed});
}