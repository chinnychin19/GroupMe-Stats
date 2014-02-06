var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var helpers = require('./helpers.js');
var jade = require('jade');
var fs = require('fs');

//TODO: populate USER_DATA
function home(USER_DATA, callback) {
	// First populate USER_DATA, then present groups
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		if (request.readyState==4 && request.status==200) {
			var obj = JSON.parse(request.responseText);
			USER_DATA.user_id = obj.response.user_id;
			USER_DATA.name = obj.response.name;
			USER_DATA.image_url = obj.response.image_url;
			// console.log(obj.response);

			getAllGroupsHTML(USER_DATA, callback);
		}
	}
	request.open("GET","https://api.groupme.com/v3/users/me?per_page=100&token="+USER_DATA.accessToken, true);
	request.send();
}

function getAllGroupsHTML(USER_DATA, callback) {
	helpers.getAllGroups(USER_DATA, function(groups) {
		groups.userName = USER_DATA.name;
		fs.readFile('./views/allGroups.jade', function(err, data) {
			var fn = jade.compile(data);
			var output = fn(groups);
			callback(null, output);
		});
	});
}

exports.home = home
