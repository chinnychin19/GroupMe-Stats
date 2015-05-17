var unirest = require('unirest');
var base_url = "https://api.groupme.com/v3";

exports.getUserInfo = function getUserInfo(session, callback) {
  unirest.get(base_url+"/users/me")
  .query("token="+session.access_token)
  .end(function(res) {
    var userInfo = res.body.response;
    callback(userInfo);
  });
}

var GROUPS_PER_PAGE = 20; // TODO: implement pagination. parameter for which page to load
exports.getAllGroups = function getAllGroups(session, callback) {
  unirest.get(base_url+"/groups")
  .query("page=1&per_page="+GROUPS_PER_PAGE+"&token="+session.access_token)
  .end(function(res) {
    var groups = res.body.response;
    callback(groups);
  });
}

exports.getGroupInfo = function getGroupInfo(session, group_id, callback) {
  unirest.get(base_url+"/groups/"+group_id)
  .query("token="+session.access_token)
  .end(function(res) {
    var group = res.body.response;
    callback(group);
  });
}