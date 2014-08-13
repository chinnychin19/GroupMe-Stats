var MongoClient = require('mongodb').MongoClient
  , unirest = require('unirest');

var MONGO_CONNECT_URI = require('../config.js').mongo_connect_uri;
var MONGO_COLLECTION_NAME = "Groups";


exports.isGroupInDB = function isGroupInDB(session, group_id, callback_true, callback_false) {
  // TODO: check if group_id is in the db. call the correct callback
}

exports.isGroupProcessing = function isGroupProcessing(session, group_id, callback_true, callback_false) {
  // TODO: check if the matching group is marked as processing. call the correct callback
}

exports.getStats = function getStats(session, group_id, callback) {
  // TODO: implement
}

exports.addGroupToDB = function addGroupToDB(session, group_id, callback) {
  // TODO: chain these calls:
  // 1. add empty data entry to the database for this group_id, mark as processing
  // 2. launch the scrape
}

// TODO: Assumption is that this group already exists in the 
function launchScrape(session, group_id) {
  unirest.get("http://gmstats-scraper.herokuapp.com/groups/scrape/"+group_id)
  .query("access_token="+session.access_token)
  .end(function(res) {
    console.log("successfully scraped group "+group_id);
  });
}