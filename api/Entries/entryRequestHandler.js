/*
	Lambda Function for entryRequestHandler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Feb 2, 2017
    Date last modified Feb 22, 2017
*/
'use strict';

console.log('Loading entryRequestHandler');

// Returns JSON object with POST
exports.entryRequestHandler = function(event, context, callback) {

	let entry = JSON.parse(event.key1); 

	const mysql = require('mysql');
	const connection = mysql.createConnection(
		require('xcampusdb')
	);

	console.log("Building query");

	// Returns Entry data with a tree of child comments
	let query = connection.query(

		'SELECT * FROM entry WHERE id=?',
		entry.id,
		function(error, result) {

			if(error) throw error;

			if(!result){
				connection.end();
				console.error("Entry #" + entry.id + " requested but does not exist!");
				callback("Entry #" + entry.id + " does not exist!");
				context.fail();
			} else {
				console.log('Entry found!');
				entry = result[0];
				console.log("Getting comments for entry #" + entry.id);
				entry.comments = getComments(entry.id);
			}

			// recursive function returns multi-dimentional 
			// array of entryIDs for comments tree 
			let getComments = function(id) {

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

				return comments;
			}
			connection.end();
		});
	console.log("Query : " + query);
	callback(null, JSON.stringify(entry));
	context.succeed();
};
