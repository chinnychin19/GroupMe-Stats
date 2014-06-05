var express = require('express');
var stylus = require('stylus');
var nib = require('nib');
var util = require('./js/util.js');
// var home = require('./js/home');
// var group = require('./js/group');

var USER_DATA = {};

var app = express();

function compile(str, path) {
	return stylus(str).set('filename', path).use(nib());
}

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(express.logger('dev'))
app.use(stylus.middleware({
	src: __dirname + '/public',
	compile: compile
}));


app.get("/", 
	function(req, res) {
		res.redirect("/login");
	});

app.get("/login",
	function(req, res) {
		console.log('logging in through GroupMe redirect');
		res.redirect("https://api.groupme.com/oauth/authorize?client_id=bDyv72tFtNXG6v6vBuhStVSuf3bNqNJXD6mABluLzvpJOGs6");
	});


app.get("/home",
	function(req, res) {
		console.log('home');
		USER_DATA.accessToken = req.query.access_token;
		util.getGroups(USER_DATA, function(options) {
			res.render('home', options);
		});
	});

// app.get("/group/:groupId",
// 	function(request, response) {
// 		group.getOptionsHTML(USER_DATA, request.params.groupId, function(err, data) {
// 			printData(request, response, err, data);
// 		});
// 	});

// app.get("/group/:groupId/stats", 
// 	function(request, response) {
// 		group.getStatsHTML(USER_DATA, request.params.groupId, function(err, data) {
// 			printData(request, response, err, data);
// 		});
// });

// app.get("/group/:groupId/removeAllOtherMembers", 
// 	function(request, response) {
// 		console.log("removing all members");
// 		group.removeAllOtherMembers(USER_DATA, request.params.groupId, function(err, data) {
// 			printData(request, response, err, data);
// 		});
// });	

// app.get("/group/:groupId/members", 
// 	function(request, response) {
// 		group.getMembersHTML(USER_DATA, request.params.groupId, function(err, data) {
// 			printData(request, response, err, data);
// 		});
// 	});

var port = process.env.PORT || 8080;
console.log('listening to '+port);
app.listen(port);
// setupServer(app);
