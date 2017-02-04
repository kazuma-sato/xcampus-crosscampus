'use strict';

console.log('Loading function');

// Returns JSON object with POST
exports.commentRequestHandler = function(event, context, callback) {

	let entryId = JSON.parse(event.key1).entryId;
	var comment = {}; 

	let mysql = require('mysql');
	let connection = createConnection({

		// TODO: Connection details here //
	});

	// Returns Entry data with a tree of child comments
	var query = connection.query(

		'SELECT * FROM entry WHERE id=?',
		entryId,
		function(error, result) {

			if(error) throw error;
			console.log('Entry found!');
			comment = result[0];
			connection.end();
		});
	
	callback(null, JSON.stringify(comment));
	context.succeed();
};