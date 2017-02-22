/*
	Lambda Function for entryPostHandler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Feb 2, 2017
    Date last modified Feb 22, 2017
*/

'use strict';

console.log('Loading function');

exports.entryPostHandler = function(event, context, callback) {

	let entry = JSON.parse(event.key1);

	const mysql = require('mysql');
	const connection = mysql.createConnection(
		require('../xcampusdb')
	);

	// Converts entryType name to id for INSERT query
	let query = connection.query(
		'SELECT id FROM entryType WHERE name LIKE ?;',
		entry.entryType,
		function (error, result) {

			if(error) throw error;
			console.log('EntryType found!');
			entry.entryType = result[0].id;
		});
	console.log("Entry type ID is : " + entry.entryType);
	console.log('Query : ' + query);

	// Insert statement to db
	let query = connection.query(
		'INSERT INTO entry SET ?;',
		entry,
		function (error, result) {

			if(error) throw error;
			entry.id = result.insertId;
			console.log('Success! Entry added!');
			console.log('Query : ' + query);
			console.log('EntryID for new entry : ' + entry.id);

			let query = connection.query(
				'INSERT INTO notification SET ?;',
				{entryID: entry.id, userID: entry.author},
				function (error, result) {

				if(error) throw error;
				console.log('Success! Notification added!');
				});
			console.log('Query : ' + query);
		});

	console.log('Query : ' + query);
	connection.end();
	callback(null, JSON.stringify(entry);
	context.succeed();
};