'use strict';

console.log('Loading function');

exports.ratingUpdateHandler = function(event, context, callback) {

	var rating = JSON.parse(event.key1);

	let mysql = require('mysql');
	let connection = createConnection({

		// TODO: Connection details here //
	});

	if(rating.type == "add") {

		var query = connection.query(
		'INSERT INTO rating SET ?;',
		entry,
		function (error, result) {

			if(error) throw error;
			console.log('Success! Rating added!');

			var query = connection.query(
				'INSERT INTO notification SET ?',
				{entryID: entry.id, userID: entry.author},
				function (error, result) {

					if(error) throw error;
					console.log('Success! Notification added!');
				});
			console.log('Query : ' + query);
		});
		console.log('Query : ' + query);

	} else if(rating.type == "remove") {

		var query = connection.query(
			"DELETE FROM rating WHERE entryID=? AND userID=?",
			[rating.entryId, rating.userId],
			function (error, result) {

				if(error) throw error;
				console.log('Deleted ' + result.affectedRows + ' row(s).');
		});
		console.log('Query : ' + query);	
	}

	console.log('Query : ' + query);
	connection.end();
	callback(null, JSON.stringify(entry);
	context.succeed();
};