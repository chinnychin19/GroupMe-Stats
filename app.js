var express = require('express')
  , stylus = require('stylus')
  , nib = require('nib')
  , fs = require('fs');

var app = express()

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
// app.use(express.logger('dev'))
app.use(stylus.middleware(
  { src: __dirname + '/public'
  , compile: compile
  }
))
app.use(express.static(__dirname + '/public'))


/*
    THE ABOVE IS ALL COOKIE CUTTER
*/

var sorter = require('./my_modules/sortMembers.js');
var membersList = JSON.parse(fs.readFileSync('./my_modules/maxwellMembersList.json').toString());

app.get('/', function (req, res) {
  res.send("<html>Trying visiting <a href='https://gmstats.herokuapp.com/maxwellstats/leaders'>Maxwell Stats</a></html>");
});

//TODO: the sorting should be happening on the front end
// GET /maxwellstats/leaders?q=<field to be sorted by>
app.get('/maxwellstats/leaders', function(req, res) {
  var field = req.query.q ? req.query.q : "ratio"; // sort by ratio by default
  console.log("sorting by "+field);
  sorter.sortBy(membersList, field);
  var object = { "membersList" : membersList};
  res.render('leaders', object);
});


var port = process.env.PORT || 3000;
app.listen(port);
