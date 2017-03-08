'use strict';
/*
	Lambda Function for entryRequestHandler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Feb 2, 2017
    Date last modified Mar 5, 2017
*/

console.log('Loading entryPutHandler');

// Returns JSON object with POST
exports.entryPutHandler = function(event, context, callback) {

	const entry = JSON.parse(event.key1);

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
		}	);

	console.log("Building query");

	connection.query(
		'SELECT COUNT(*) AS count FROM entry WHERE id=?;',
		entry.id,
		function(error, result) {

			if(error){
				connection.end();
				context.fail();
				callback(error);
			} else if(!result[0].count){	
				connection.end();
				context.fail();
				callback(new Error("Error: Entry #" + entry.id + " does not exist!"));
			} else {
				console.log('Entry #' + entry.id + ' found!');

				// TODO: Create a way to filter out unwanted values

				// entry.author = undefined;
				// entry.parentId = undefined;
				// entry.dateCreated = undefined;
				// entry.dateModified = undefined;

				console.log(JSON.stringify(entry))

				connection.query(
					'UPDATE entry SET ? WHERE id=?',
					[entry, entry.id],
					function(error, result) {
						if(error){
							connection.end();
							context.fail();
							callback(error);
						} else {
							let message = {
								message : "Updated " + result.changedRows + " rows!",
								values : entry
							}
							connection.end();
							context.succeed();
							callback(null, JSON.stringify(message));
						}
					}
				)
			}
		}
	);
};
