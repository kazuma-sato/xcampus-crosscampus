'use strict';
/*
	Lambda Function for entryRequestHandler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Feb 2, 2017
    Date last modified Feb 22, 2017
*/

console.log('Loading entryRequestHandler');

// Returns JSON object with POST
exports.entryRequestHandler = function(event, context, callback) {

	let id = JSON.parse(event.key1).id; 

	const mysql = require('mysql');
	const async = require('async');

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
	let query = connection.query(

		'SELECT * FROM entry WHERE id=?',
		id,
		function(error, result) {
			
			let entry;

			if(error) {
				callback(error);
				context.fail();
			} else if(!result.length) {
				callback(null, "{}");
				context.fail();
			} else {
				console.log('Entry found!');
				entry = result[0];
				console.log("Getting comments for entry #" + result[0].id);
				//entry.comments = getCommentsArray(entry.id, connection);
				entry.comments = getCommentsArray(entry.id, connection);
				console.log("invoking callback!")
				callback(null, JSON.stringify(entry));
				context.succeed();
				connection.end();
			}
		});
	console.log("Query : " + query.sql);
	

	// recursive function returns multi-dimentional 
	// array of entryIDs for comments tree 
	function getCommentsArray(id, connection) {

		let comments = [];
		
		console.log("\nBuilding query");
		let query = connection.query(
			'SELECT id FROM entry WHERE parentID=?',
			id,
			function(error, result) {
				
				if(error) {
					callback(error);
					context.fail();
				} else if(result.length) {
					for(let i = 0; i < result.length; i++){
						getCommentsArray(result[i].id, connection);
						comments.push(result[i].id);
					}
				} else {
					console.log('No comments found for #' + id);
				};
			}
		);
		console.log("Comments tree for entry #" + id);
		console.log(comments);
		return comments;
	};
};