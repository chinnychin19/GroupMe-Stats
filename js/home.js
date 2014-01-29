var helpers = require('./helpers.js');

function home(ACCESS_TOKEN, callback) {
	helpers.getAllGroups(ACCESS_TOKEN, callback);
}

exports.home = home
