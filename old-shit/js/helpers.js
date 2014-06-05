var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var jade = require('jade');
var fs = require('fs');

function getAllGroups(USER_DATA, callback) {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		if (request.readyState==4 && request.status==200) {
			var obj = JSON.parse(request.responseText);
			callback(obj);
		}
	}
	// 500 is an arbitrary number
	request.open("GET","https://api.groupme.com/v3/groups?per_page=500&token="+USER_DATA.accessToken, true);
	request.send();
}

function getMembers(USER_DATA, groupId, callback) {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		if (request.readyState==4 && request.status==200) {
			var obj = JSON.parse(request.responseText); // { "response" : { "name": "abc xyz" "members" : [...], }}
			callback(obj);
		}
	}
	request.open("GET","https://api.groupme.com/v3/groups/"+groupId+"?token="+USER_DATA.accessToken, true);
	request.send();
}

function getMessages(USER_DATA, groupId, callback) {
// load a group's messages from a groupId
	var request1 = new XMLHttpRequest();
	var foundMessages = [];
	request1.onreadystatechange = function getNextPage(progressEvent_ignore, prevRequest, earliestId, totalMessages) {
		if (!prevRequest) {
			prevRequest = request1;
		}
		if (prevRequest.readyState==4 && prevRequest.status==200) {
			var obj = JSON.parse(prevRequest.responseText);
			var earliestId = earliestId ? earliestId : obj.response.messages.last_message_id;
			var request2 = new XMLHttpRequest();
			var totalMessages = totalMessages ? totalMessages : obj.response.messages.count - 1; //most recent message not included

			request2.onreadystatechange = function() {
				if (request2.readyState==4 && request2.status==200) {
					var obj = JSON.parse(request2.responseText);
					var curMessages = obj.response.messages;
					for (var i = 0; i < curMessages.length; i++) {
						foundMessages.push(curMessages[i]);
					}
					if (foundMessages.length >= totalMessages) {
						callback(foundMessages); // This passes another callback as defined, for example, in getStats()
					} else {
						console.log("Still need to scrape "+ (totalMessages - foundMessages.length) + " messages");
						earliestId = foundMessages[foundMessages.length - 1].id;
						getNextPage(null, request2, earliestId, totalMessages);
					}
				}
			}
			request2.open("GET","https://api.groupme.com/v3/groups/"+groupId+"/messages?before_id="+earliestId+"&token="+USER_DATA.accessToken, true);
			request2.send();
		}
	}
	request1.open("GET","https://api.groupme.com/v3/groups/"+groupId+"?token="+USER_DATA.accessToken, true);
	request1.send();
}

exports.getAllGroups = getAllGroups;
exports.getMembers = getMembers;
exports.getMessages = getMessages;
