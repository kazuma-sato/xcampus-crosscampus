'use strict';
/*
	Lambda Function for entryPutHandler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Feb 2, 2017
    Date last modified Mar 5, 2017
*/

console.log('Loading entryPutHandler');

// PUT method handler for entry
exports.handler = function(event, context, callback) {

	let entry = JSON.parse(event.entry);

	const mysql = require('mysql');
	const connection = mysql.createConnection({
			host     : 'db.crosscampus.xcamp.us',
			user     : 'root',
			password : 'GBCxcamp',
			database : 'crosscampus',
			port     : '3306',
		}	
	);

	console.log("Building query");

	connection.query(
		'SELECT COUNT(*) AS count FROM entry WHERE id=?;',
		entry.id,
		updateEntry
	);

	function updateEntry(error, result) {

		if(error){
			connection.end();
			callback(error);
		} else if(!result[0].count){	
			connection.end();
			callback(new Error("Error: Entry #" + entry.id + " does not exist!"));
		} else {
			console.log('Entry #' + entry.id + ' found!');
			console.log(JSON.stringify(entry))

			connection.query(
				'UPDATE entry SET ? WHERE id=?',
				[ entry, entry.id ],
				responseCallback
			)
		}
	}

	function responseCallback(error, result) {

		if(error){
			connection.end();
			callback(error);
		} else {
			let message = {
				message : "Updated " + result.changedRows + " rows!",
				values : [ entry ]
			}
			connection.end();
			callback(null, message);
		}
	}
};
