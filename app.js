var express = require('express');
var cookieParser = require('cookie-parser');
var um = require('./lib/userManagement.js');
var intuit = require('./lib/intuit.js');
var path = require('path');
var app = express();
app.use(cookieParser());


app.use(express.static(path.join(__dirname, 'public')));

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.get('/register', function (request, response) {
	response.render('register');
});

app.post('/addUser', function (request, response) {
	um.handleAddUser(request, response);
});

app.get('/login', function (request, response) {
	response.render('login');
});

app.get('/logout' , function ( request , response ) {
	um.logUserOut(request.cookies , response );
});

app.post('/authUser', function (request, response) {
	um.handleLogin(request, response);
});

app.get('/myFeed', function (request, response) {
	var userCookie = request.cookies;
	if( ((typeof userCookie.ecommit_email)==='undefined') || ((typeof userCookie.ecommit_passwordHash)==='undefined') ) {
		response.render('error',{message: "Please login to leave a review!"} );
		return false; // user is not logged in
	}else {
		intuit.showFeed(request, response);
	}
});
var server = app.listen(3000, function () {
  console.log('Starting eCommIt! ');
});