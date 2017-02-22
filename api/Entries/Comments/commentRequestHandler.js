'use strict';

console.log('Loading commentRequestHandler');

// For return a single comment JSON object by ID
exports.commentRequestHandler = function(event, context, callback) {

	const id = JSON.parse(event.key1).entryId;
	let comment; 

	const mysql = require('mysql');
	const connection = mysql.createConnection(
		require('../xcampusdb')
	);

	console.log("Building query : ");

	// Returns Entry data with a tree of child comments
	let query = connection.query(

		'SELECT * FROM entry WHERE id=?',
		id,
		function(error, result) {

			if(error) throw error;
			console.log('Comment found!');
			comment = result[0];
			connection.end();
		});
	console.log("Query : " + query);
	console.log();
	callback(null, JSON.stringify(comment));
	context.succeed();
};
console.log();