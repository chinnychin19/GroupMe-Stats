var MongoClient = require('mongodb').MongoClient
  , groupme = require('./groupme.js')
  , unirest = require('unirest');

var MONGO_CONNECT_URI = process.env.GMSTATS_MONGO_CONNECT_URI;
var MONGO_COLLECTION_NAME = "Groups";


exports.isGroupInDB = function isGroupInDB(session, group_id, callback_true, callback_false) {
  MongoClient.connect(MONGO_CONNECT_URI, function (err, db) {
    if (err) {
      console.log(err);
      return;
    }
    var collection = db.collection(MONGO_COLLECTION_NAME);
    collection.find({"id" : group_id}).toArray(function(err, items) {
      if (items.length == 1) {
        callback_true();
      } else if (items.length == 0) {
        callback_false();
      } else {
        throw new Error("Error! More than one instance of same group in DB! Group id: "+group_id);
      }
    });
  });
}

exports.isGroupProcessing = function isGroupProcessing(session, group_id, callback_true, callback_false) {
  MongoClient.connect(MONGO_CONNECT_URI, function (err, db) {
    if (err) {
      console.log(err);
      return;
    }
    var collection = db.collection(MONGO_COLLECTION_NAME);
    collection.find({"id" : group_id, "is_processing":true}).toArray(function(err, items) {
      if (items.length == 1) {
        callback_true();
      } else if (items.length == 0) {
        callback_false();
      } else {
        throw new Error("Error! More than one instance of same group in DB! Group id: "+group_id);
      }
    });
  });
}

exports.getStats = function getStats(session, group_id, callback) { // callback(stats)
  MongoClient.connect(MONGO_CONNECT_URI, function (err, db) {
    if (err) {
      console.log(err);
      return;
    }
    var collection = db.collection(MONGO_COLLECTION_NAME);
    collection.find({"id" : group_id}).toArray(function(err, items) {
      if (items.length == 1) {
        var stats = items[0].stats;
        callback(stats);
      } else {
        throw new Error("Error! Expected one entry for group "+group_id+". Found "+items.length+" entries.");
      }
    });
  });
}

exports.addGroupToDB = function addGroupToDB(session, group_id, callback) {
  groupme.getGroupInfo(session, group_id, function(group) { // get the group info
    group.is_processing = true; // mark the group as processing
    group.stats = { // initialize stats as empty
      "member_stats" : [],
      "top_messages" : []
    };

    MongoClient.connect(MONGO_CONNECT_URI, function(err, db) {
      if (err) {
        console.log(err);
        return;
      }
      var collection = db.collection(MONGO_COLLECTION_NAME);
      collection.insert(group, {"safe":true}, function(err, object) { // add the group to the DB
        callback();
        launchScrape(session, group_id); // launch the scrape. when complete, it will mark processing as false
      });
    });
  });
}

// Assumption is that this group already exists in the DB
function launchScrape(session, group_id) {
  var a = unirest.get("http://gmstats-scraper.herokuapp.com/groups/scrape/"+group_id)
  .query("access_token="+session.access_token)
  .end(function(res) {
    console.log("successfully scraped group "+group_id);
  });
}