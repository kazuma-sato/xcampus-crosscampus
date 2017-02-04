'use strict';

console.log('Loading function');

// Returns JSON object with POST
exports.entryRequestHandler = function(event, context, callback) {

	let entryId = JSON.parse(event.key1).entryId;
	var entry = {id : entryId}; 

	let mysql = require('mysql');
	let connection = createConnection({

		// TODO: Connection details here //
	});

	// Returns Entry data with a tree of child comments
	var query = connection.query(

		'SELECT * FROM entry WHERE id=?',
		entry.entryId,
		function(error, result) {

			if(error) throw error;
			console.log('Entry found!');

			entry = result[0];
			entry.comments = getComments(entryId);

			// recursive function returns multi-dimentional 
			// array of entryIDs for comments tree 
			getComments function(id) {

				var comments = [];
				var query = connection.query(
					'SELECT id FROM entry WHERE parentID=?',
					id,
					function(error, result) {

						if(error) throw error;
						console.log('Entry #' + id + " has " + result.length + " comments.");

						for(var i = 0; i < result.length; i++){

							comments.push(result[i].id);
							getComments(result[i].id);
						}
					});
				return comments;
			}
			connection.end();
		});

	callback(null, JSON.stringify(entry));
	context.succeed();
};