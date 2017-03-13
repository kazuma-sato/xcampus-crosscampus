'use strict';
/*
	Lambda Function for entryPostHandler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Feb 2, 2017
    Date last modified Mar 12, 2017
*/

console.log('\nLoading function entryPostHandler...\n');

exports.handler = function(event, context, callback) {

	let entry = event.entry;
	const mysql = require('mysql');
	const connection = mysql.createConnection({
			host     : 'db.crosscampus.xcamp.us',
			user     : 'root',
			password : 'GBCxcamp',
			database : 'crosscampus',
			port     : '3306',
		}
	);

	connection.query(
		'SELECT id FROM entryType WHERE name LIKE ?;',
		entry.entryType,
		insertEntryCallback
	);

	function insertEntryCallback(error, result) {

		if(error) {
			connection.end();
			callback(error);
		} else if(!result.length) {
			connection.end();
			callback(new Error("Error: Entry type is invalid!!"));
		} else {
			console.log("Entry type ID is : " + entry.entryType);
			entry.entryType = result[0].id;
			connection.query(
				'INSERT INTO entry SET ?;',
				entry,
				selectAuthorCallback
			);
		}
	}

	function selectAuthorCallback(error, result) {

		if(error) {
			connection.end();
			callback(error);
		} else {
			entry.id = result.insertId;
			console.log('Success! Entry added!');
			console.log('EntryID for new entry : ' + entry.id);
			if(entry.parentID) {
				connection.query(
					"SELECT author FROM entry WHERE id =?", 
					entry.parentID,
					insertNotificationCallback
				);
			} else {
				connection.end();
				callback(null, entry);
			}
		}
	}

	function insertNotificationCallback(error,result) {

		if(error) {
			connection.end();
			callback(error);			
		} else if(!result) {
			connection.end();
			callback(new Error("Error: ParentID, '" + entry.parentID + "', of entry " + entry.id + " is invalid!"));
		} else {
			entry.parentEntryAuthor = result[0].author;
			connection.query(
				'INSERT INTO notification SET ?;',
				{ entryID: entry.id, userID: entry.parentEntryAuthor },
				backToSender
			);
		}
	}

	function backToSender(error, result) {

		if(error) {
			connection.end();
			callback(error);
		} else {
			console.log("Notification to user #" 
						+ entry.parentEntryAuthor + " for comment " 
						+ entry.id + " added.");
			connection.end();
			context.succeed();
			callback(null, entry);
		}
	}
};