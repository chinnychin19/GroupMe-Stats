var express = require('express');
var https = require('https');
var http = require('http');
var pem = require('pem');
var home = require('./js/home');
var group = require('./js/group');

var USER_DATA = {};
function start() {
	var app = express();

	app.get("/", 
		function(request, response) {
			request.send("hello world!");
		});

	app.get("/login",
		function(request, response) {
			console.log('logging in through GroupMe redirect');
			response.redirect("https://api.groupme.com/oauth/authorize?client_id=bDyv72tFtNXG6v6vBuhStVSuf3bNqNJXD6mABluLzvpJOGs6");
		});


	app.get("/home",
		function(request, response) {
			console.log('home');
			USER_DATA.accessToken = request.query.access_token;
			home.home(USER_DATA, function(err, data) {
				printData(request, response, err, data);
			});
		});

	app.get("/group/:groupId",
		function(request, response) {
			group.getOptionsHTML(USER_DATA, request.params.groupId, function(err, data) {
				printData(request, response, err, data);
			});
		});

	app.get("/group/:groupId/stats", 
		function(request, response) {
			group.getStatsHTML(USER_DATA, request.params.groupId, function(err, data) {
				printData(request, response, err, data);
			});
	});

	app.get("/group/:groupId/removeAllOtherMembers", 
		function(request, response) {
			console.log("removing all members");
			group.removeAllOtherMembers(USER_DATA, request.params.groupId, function(err, data) {
				printData(request, response, err, data);
			});
	});	

	app.get("/group/:groupId/members", 
		function(request, response) {
			group.getMembersHTML(USER_DATA, request.params.groupId, function(err, data) {
				printData(request, response, err, data);
			});
		});

	console.log('listening to 8080');
	app.listen(8080);
	// setupServer(app);
}

function printData(request, response, err, data) {
	if (err) throw err;
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write(data);
	response.end();		
}

// function setupServer(app) {
// 	pem.createCertificate({
// 		days:1, 
// 		selfSigned:true
// 	}, function(err, keys) {
// 		https.createServer({
// 			key: keys.serviceKey, 
// 			cert: keys.certificate
// 		}, app).listen(443);
// 	});
// }

start();
exports.start = start;
