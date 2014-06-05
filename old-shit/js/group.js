var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var jade = require('jade');
var fs = require('fs');
var helpers = require('./helpers.js');

function getOptionsHTML(USER_DATA, groupId, callback) {
	fs.readFile('./views/groupOptions.jade', function(err, data) {
		var obj = {"group" : {"id" : groupId}};
		var fn = jade.compile(data);
		var output = fn(obj);
		callback(null, output);
	});
}

function getMembersHTML(USER_DATA, groupId, callback) {
	helpers.getMembers(USER_DATA, groupId, function(members) {
		fs.readFile('./views/groupMembers.jade', function(err, data) {
			var fn = jade.compile(data);
			var output = fn(members);
			callback(null, output);
		});
	});
}

function getStatsHTML(USER_DATA, groupId, callback) {
	console.log("stats request received")
	helpers.getMessages(USER_DATA, groupId, function(messages) {
		calculateStats(messages, callback);
	});
}

function removeAllOtherMembers(USER_DATA, groupId, callback) {
	helpers.getMembers(USER_DATA, groupId, function(obj) {
		var members = obj.response.members;
		console.log(members);
		for (var i in members) {
			var request = new XMLHttpRequest();
			var userId = members[i].id;
			if (userId == USER_DATA.user_id) { //Delete every EXCEPT self
				continue;
			}
			request.open("POST","https://api.groupme.com/v3/groups/"+groupId+"/members/"+userId+"/remove?token="+USER_DATA.accessToken, true);
			request.send();
		}

		callback(null, "All members were removed. You're also probably an ass hole.");
	});
}



function calculateStats(messages, callback) {
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

exports.getOptionsHTML = getOptionsHTML;
exports.getMembersHTML = getMembersHTML;
exports.getStatsHTML = getStatsHTML;
exports.removeAllOtherMembers = removeAllOtherMembers;
