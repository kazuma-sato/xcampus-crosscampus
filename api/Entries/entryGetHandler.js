'use strict';
/*
	Lambda Function for entryRequestHandler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Feb 2, 2017
    Date last modified Mar 7, 2017
*/

console.log('Loading entryGetHandler');

// Returns JSON object with POST
exports.entryGetHandler = function(event, context, callback) {

	let entry = { id : JSON.parse(event.key1).id }; 

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

	console.log("Building query");

	// Returns Entry data with a tree of child comments
	connection.query(
		'SELECT * FROM entry WHERE id=?',
		entry.id,
		function(error, result) {

			if(error) {
				connection.end();
				context.fail();
				callback(error);
			} else if(!result.length) {
				connection.end();
				context.fail();
				callback(new Error("Error: Entry #" + entry.id + " was not found!"));
			} else {
				console.log('Entry found!');
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
						context.succeed();
						callback(null, JSON.stringify(entry));
						return;
					default:
						connection.end();
						context.fail();
						callback(new Error("Error: Entry #" + entry.id + " has a invalid entry type.\nResult values: "
								 			+ JSON.stringify(result)));
						return;
				}
				
				console.log("Getting comments for entry #" + entry.id);
				
				connection.query(
					'SELECT id FROM entry WHERE parentID=?',
					entry.id,
					function(error, result) {

						if(error) {
							connection.end();
							context.fail();
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
						context.succeed();
						callback(null, JSON.stringify(entry));
					}
				)
			}
		}
	);
}