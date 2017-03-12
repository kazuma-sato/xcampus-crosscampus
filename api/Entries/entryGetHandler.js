'use strict';
/*
	Lambda Function for entryRequestHandler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Feb 2, 2017
    Date last modified Mar 11, 2017
*/

console.log('Loading entryGetHandler');

// Returns JSON object of requested entry.
exports.handler = (event, context, callback) => {

	let entry = { id : event.queryParams.id }; 

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

	// Returns Entry data with a tree of child comments
	connection.query(
		'SELECT * FROM entry WHERE id=?',
		entry.id,
		findComments
	);

	function findComments(error, result) {

			if(error) {
				connection.end();
				callback(error);
			} else if(!result.length) {
				connection.end();
				callback(new Error("Error: Entry #" + entry.id + " was not found!"));
			} else {
				console.log('Entry found!\n' + JSON.stringify(result));
				entry = result[0];
				switch(entry.entryType){
					case 1:
						entry.entryType = "note";
						break;
					case 2: 
						entry.entryType = "ad";
						break;
					case 3:
						entry.entryType = "comment";
						connection.end();
						callback(null, JSON.stringify(entry));
						return;
					default:
						connection.end();
						callback(new Error("Error: Entry #" + entry.id + " has a invalid entry type.\nResult values: "
								 			+ JSON.stringify(result)));
						return;
				}
				
				console.log("Getting comments for entry #" + entry.id);
				
				connection.query(
					'SELECT id FROM entry WHERE parentID=?',
					entry.id,
					callbackWithComments
				)
			}
		}
	function callbackWithComments(error, result) {

		if(error) {
			connection.end();
			callback(error);
		} else if(!result.length) {
			entry.comments = null;
		} else {
			entry.comments = [];
			result.forEach(function(element) {
				entry.comments.push(element.id)
			});
		}
		connection.end();
		callback(null, entry);
	}
}