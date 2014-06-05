var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var jade = require('jade');

function getGroups(USER_DATA, callback) {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		if (request.readyState==4 && request.status==200) {
			var obj = JSON.parse(request.responseText);
			var groups = obj.response;
			callback({"groups" : groups});
		}
	}
	// 500 is an arbitrary number
	request.open("GET","https://api.groupme.com/v3/groups?per_page=500&token="+USER_DATA.accessToken, true);
	request.send();
}

exports.getGroups = getGroups;