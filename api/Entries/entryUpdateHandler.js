'use strict';

console.log('Loading entryRequestHandler();');

// Returns JSON object with POST
exports.entryUpdateHandler = function(event, context, callback) {

	const entry = JSON.parse(event.key1); 

	const mysql = require('mysql');
	const connection = mysql.createConnection(
		require('../xcampusdb')
	);

	console.log("Building query");

	// Returns Entry data with a tree of child comments
	let query = connection.query(
		'SELECT COUNT(*) AS count FROM entry WHERE id=?;',
		entry.entryId,
		function(error, result) {

			if(error) throw error;
			
			if(result[0].count){		
				connection.end();
				console.error("Entry #" + entry.id + " requested but does not exist!");
				callback("Entry #" + entry.id + " does not exist!");
				context.fail();
			} else {
				console.log('Entry found!');

				// TODO: FINISH THIS SHIT
				// This function is just a copy I was gonna use
				// to build the function.
				getComments function(id) {

					let comments = [];
					let query = connection.query(
						'SELECT id FROM entry WHERE parentID=?',
						id,
						function(error, result) {

							if(error) throw error;
							console.log('Entry #' + id + " has " + result.length + " comments.");

							for(let i = 0; i < result.length; i++){
								comments.push(result[i].id);
								getComments(result[i].id);
							}
						});
					console.log("Query : " + query);
					console.log("Comments tree for entry #" + entry.id);
					console.log(comments);
					console.log();
					return comments;
				}
			}
			console.log();
			connection.end();
		});
	console.log("Query : " + query);
	console.log();
	callback(null, JSON.stringify(entry));
	context.succeed();
};
console.log();