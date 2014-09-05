var express = require('express')
  , stylus = require('stylus')
  , nib = require('nib')
  , session = require('express-session')
  , groupme = require('./my_modules/groupme.js')
  , mongo = require('./my_modules/mongo.js')
  , config = require('./config.js');

var app = express()

function compileStylus(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')

app.use(stylus.middleware(
  { src: __dirname + '/public'
  , compile: compileStylus
  }
))

app.use(express.static(__dirname + '/public'))

app.use(session({
  secret: config.session_secret,
  saveUninitialized: true,
  resave: true
  })
);


/*
    THE ABOVE IS ALL COOKIE CUTTER
*/

// pre-login
app.get('/', function (req, res) {
  // redirect to groupme login
  res.redirect("https://api.groupme.com/oauth/authorize?client_id="+config.client_id);
});

// post-login (loggedin)
app.get('/logged-in', function (req, res) {
  // TODO:
  // 1) store access token
  // 2) Get user info
  // 3) Store user info
  // 4) Redirect to groups page
  req.session.access_token = req.query.access_token;
  groupme.getUserInfo(req.session, function(userInfo) {
    req.session.userInfo = userInfo;
    res.redirect('/groups');    
  });
});

// groups
app.get('/groups', function (req, res) {
  // TODO: list all groups with number of members and image in a grid layout
  groupme.getAllGroups(req.session, function(groups) {
    var object = { "groups" : groups};
    res.render('all_groups', object);
  });
});

// specific group's stats
app.get('/groups/stats/:group_id', function (req, res) {
  // TODO: present a page with sortable stats
  var session = req.session;
  var group_id = req.params.group_id;
  mongo.isGroupInDB(session, group_id, 
    function() { // if group is found in DB
      mongo.isGroupProcessing(session, group_id, 
        function() { // if group is processing
          mongo.getStats(session, group_id, function(stats) {
            res.send("still processing...\n\n"+JSON.stringify(stats));
            // TODO: render jade file with processing true
          });
        }, 
        function() { // if group is done processing
          mongo.getStats(session, group_id, function(stats) {
            res.send(JSON.stringify(stats));
            // TODO: render jade file with processing false
          });
        });
    },
    function() { // if group is NOT found in DB
      mongo.addGroupToDB(session, group_id, function() {
        // re-enter this logic gate with the group added to the DB
        res.redirect('/groups/stats/'+group_id);
      });
    });
});

// specific group's top messages
app.get('/groups/top-messages/:group_id', function (req, res) {
  // TODO: present a page with top messages, in order
  // Messages should include sender name, timestamp, number of likes, and photo
  res.send("TODO: implement");
});


var port = process.env.PORT || 3000;
app.listen(port);
