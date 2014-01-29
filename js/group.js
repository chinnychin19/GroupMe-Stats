var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var jade = require('jade');
var fs = require('fs');

function loadMembers(ACCESS_TOKEN, groupId, callback) {
	console.log("loading group: "+groupId+".");
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		if (request.readyState==4 && request.status==200) {
			fs.readFile('./views/groupMembers.jade', function(err, data) {
				var obj = JSON.parse(request.responseText);
				var fn = jade.compile(data);
				var output = fn(obj);
				callback(null, output);
			});
		}
	}
	request.open("GET","https://api.groupme.com/v3/groups/"+groupId+"?token="+ACCESS_TOKEN, true);
	request.send();
}

function loadMessages(ACCESS_TOKEN, groupId, callback) {
// load a group's messages from a groupId
	var request1 = new XMLHttpRequest();
	var foundMessages = [];
	request1.onreadystatechange = function getNextPage(progressEvent_ignore, prevRequest, earliestId, totalMessages) {
		if (!prevRequest) {
			prevRequest = request1;
		}
		if (prevRequest.readyState==4 && prevRequest.status==200) {
			console.log("next request received");
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
						generateStats(foundMessages, callback); // Pass the compiled list of messages to a function that analyzes it
					} else {
						console.log("Still need to scrape "+ (totalMessages - foundMessages.length) + " messages");
						earliestId = foundMessages[foundMessages.length - 1].id;
						getNextPage(null, request2, earliestId, totalMessages);
					}
				}
			}
			request2.open("GET","https://api.groupme.com/v3/groups/"+groupId+"/messages?before_id="+earliestId+"&token="+ACCESS_TOKEN, true);
			request2.send();
		}
	}
	request1.open("GET","https://api.groupme.com/v3/groups/"+groupId+"?token="+ACCESS_TOKEN, true);
	request1.send();
}

function generateStats(messages, callback) {
	// messageCount, likesReceived, likesGiven, names, selfLikes
	function addMember(user_id, members) {
		members[user_id] = {
			messageCount : 0,
			likesReceived : 0,
			likesGiven : 0,
			names : [],
			selfLikes : 0
		};
	}
	var members = {};
	for (var i = 0; i < messages.length; i++) {
		var message = messages[i];
		var user_id = message.user_id;
		var name = message.name;
		var likes = message.favorited_by;
		if (!(user_id in members)) {
			addMember(user_id, members);
		}
		if (members[user_id].names.indexOf(name) < 0) {
			members[user_id].names.push(name);
		}
		members[user_id].messageCount++;
		members[user_id].likesReceived += likes.length;
		for (var j = 0; j < likes.length; likes++) {
			var likerId = likes[j];
			if (user_id == likerId) {
				members[user_id].selfLikes++;
			} else {
				if (!(likerId in members)) {
					addMember(likerId, members);
				}
				members[likerId].likesGiven++;
			}
		}
	}

	//Finally calculate ratio
	for (var user_id in members) {
		members[user_id].ratio = members[user_id].likesReceived / members[user_id].messageCount;
	}

	fs.readFile('./views/stats.jade', function(err, data) {
		var fn = jade.compile(data);
		var output = fn({members : members});
		callback(null, output);
	});
}

exports.loadMembers = loadMembers;
exports.loadMessages = loadMessages;
