'use strict';

console.log('Loading function');

exports.entryPostHandler = function(event, context, callback) {

	var entry = JSON.parse(JSON.parse(event.key1).entry);

	let mysql = require('mysql');
	let connection = createConnection({

		// TODO: Connection details here //
	});

	// Converts entryType name to id for INSERT query
	var query = connection.query(
		'SELECT id FROM entryType WHERE name LIKE ?;',
		entry.entryType,
		function (error, result) {

			if(error) throw error;
			console.log('EntryType found!');
			entry.entryType = row[0].id;
		});
	console.log("Entry type ID is : " + entryType);
	console.log('Query : ' + query);

	// Insert statement to db
	var query = connection.query(
		'INSERT INTO entry SET ?;',
		entry,
		function (error, result) {

			if(error) throw error;
			console.log('Success! Entry added!');

			// Gets the ID for the new entry
			var query = connection.query(
				'LAST_INSERT_ID();',
				function(error,result) {

					entry.id = row[0].id;
				}
			);
			console.log('Query : ' + query);
			console.log('EntryID for new entry : ' + entry.id);

			var query = connection.query(
				'INSERT INTO notification SET ?;',
				{entryID: entry.id, userID: entry.author},
				function (error, result) {

				if(error) throw error;
				console.log('Success! Notification added!');
				});
			console.log('Query : ' + query);
		});

	console.log('Query : ' + query);
	connection.end();
	callback(null, JSON.stringify(entry);
	context.succeed();
};