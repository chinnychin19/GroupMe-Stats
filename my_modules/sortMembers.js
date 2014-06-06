var fieldNames = require('./fieldNames.js');

function sortBy(members, field) {
	var poss = fieldNames.ALL_FIELDS;
	if (poss.indexOf(field) < 0) {
		throw new Error("'"+field+"' is not a supported field. The supported fields are: "+poss.join(', '));
	}
	members.sort(function(a,b) {
		// Sorts all fields in descending order except name
		if (a[field] < b[field] && field != fieldNames.NAME) {
			return 1;
		}
		if (a[field] > b[field] && field != fieldNames.NAME) {
			return -1;
		}

		// In case of tie, default tie break is alphabetical order of name a-z
		if (a.name < b.name) {
			return -1;
		}
		if (a.name > b.name) {
			return 1;
		}
		return 0;
	});
}

exports.sortBy = sortBy;
