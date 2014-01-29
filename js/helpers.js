var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var jade = require('jade');
var fs = require('fs');

function getAllGroups(ACCESS_TOKEN, callback) {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		if (request.readyState==4 && request.status==200) {
			fs.readFile('./views/allGroups.jade', function(err, data) {
				var obj = JSON.parse(request.responseText);
				var fn = jade.compile(data);
				var output = fn(obj);
				callback(null, output);
			});
		}
	}
	request.open("GET","https://api.groupme.com/v3/groups?per_page=100&token="+ACCESS_TOKEN, true);
	request.send();
}

function getAllMessages(ACCESS_TOKEN, groupId, callback) {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		if (request.readyState==4 && request.status==200) {
			console.log(request.responseText);
			// fs.readFile('./views/allGroups.jade', function(err, data) {
			// 	var obj = JSON.parse(request.responseText);
			// 	var fn = jade.compile(data);
			// 	var output = fn(obj);
			// 	callback(null, output);
			// });
		}
	}
	request.open("GET","https://api.groupme.com/v3/groups/"+groupId+"/messages/?per_page=100&token="+ACCESS_TOKEN, true);
	request.send();
}

exports.getAllGroups = getAllGroups;
exports.getAllMessages = getAllMessages;
