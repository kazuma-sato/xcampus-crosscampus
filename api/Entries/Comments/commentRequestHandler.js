'use strict';
/*
	Lambda Function for commentRequestHandler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Feb 2, 2017
    Date last modified Feb 22, 2017
*/

console.log('Loading commentRequestHandler');

// For return a single comment JSON object by ID
exports.commentRequestHandler = function(event, context, callback) {

	let id = JSON.parse(event.key1).id;

	const mysql = require('mysql');
	const connection = mysql.createConnection(
		//require('xcampusdb')
		// for testing
		{
			host     : 'localhost',
			user     : 'xcampus',
			password : 'GBCxcamp',
			database : 'crosscampus',
			port     : '3306',
			//debug    : true
		}
	);

	console.log("Building query : ");

	// Returns Entry data with a tree of child comments
	let query = connection.query(
		'SELECT * FROM entry WHERE id=?;',
		id,
		function(error, result) {

			if(error) {
				callback(error);
				context.fail();
			} else if(!result.length) {
				callback(null, "{}");
				context.fail();
			} else {
				console.log('Comment found!');
				callback(null, JSON.stringify(result[0]));
				context.succeed();
			}
			connection.end();
		});
	console.log(query.sql);
};
