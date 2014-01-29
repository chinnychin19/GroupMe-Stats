var express = require('express');
var https = require('https');
var pem = require('pem');
var url = require('url');
var home = require('./js/home');
var group = require('./js/group');

var ACCESS_TOKEN = '';
function start() {
	var app = express();

	app.get("/login",
		function(request, response) {
			console.log('logging in through GroupMe redirect');
			response.redirect("https://api.groupme.com/oauth/authorize?client_id=bDyv72tFtNXG6v6vBuhStVSuf3bNqNJXD6mABluLzvpJOGs6");
		});


	app.get("/home",
		function(request, response) {
			ACCESS_TOKEN = request.query.access_token;
			home.home(ACCESS_TOKEN, function(err, data) {
				printData(request, response, err, data);
			});
		});

	app.get("/group/:groupId/members?", 
		function(request, response) {
			group.showMembers(ACCESS_TOKEN, request.params.groupId, function(err, data) {
				printData(request, response, err, data);
			});
		});

	app.get("/group/:groupId/stats", 
		function(request, response) {
			group.loadMessages(ACCESS_TOKEN, request.params.groupId, function(err, data) {
				printData(request, response, err, data);
			});
	});

	setupServer(app);
}

function printData(request, response, err, data) {
	if (err) throw err;
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write(data);
	response.end();		
}

function setupServer(app) {
	pem.createCertificate({
		days:1, 
		selfSigned:true
	}, function(err, keys) {
		https.createServer({
			key: keys.serviceKey, 
			cert: keys.certificate
		}, app).listen(443);
	});
}

start();
exports.start = start;
