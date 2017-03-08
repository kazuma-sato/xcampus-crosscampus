'use strict';
/*
	Lambda Function for ratingPostHandler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Feb 2, 2017
    Date last modified Mar 7, 2017
*/

console.log('Loading ratingPostHandler');

exports.ratingPostHandler = function(event, context, callback) {

	const fav = JSON.parse(event.key1);

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
	console.log(connection.query(
		'INSERT INTO rating SET ?;',
		fav,
		selectAuthorCallback
	).sql);

	function selectAuthorCallback(error, result) {

		if(error) {
			connection.end();
			context.fail();
			callback(error);
		} else {
		console.log('Success! Rating added!');
			console.log(connection.query(
				"SELECT author FROM entry WHERE id=?;", 
				fav.entryId,
				insertNotificationCallback
			).sql);
		}
	}

	function insertNotificationCallback(error,result) {

		if(error) {
			connection.end();
			context.fail();
			callback(error);			
		} else if(!result) {
			connection.end();
			context.fail();
			callback(new Error("Error: Author could not be found for entry #" + fav.entryId));
		} else {

			// TODO: Reconstruct notification table to include 3rd column.
			//       Lack of data to notify notification recipient about rating

			fav.author = result[0].author;
			console.log(connection.query(
				'INSERT INTO notification SET ?;',
				{ entryId: fav.entryId, userId: result[0].author },
				backToSender
			).sql);
		}
	}

	function backToSender(error, result) {

		if(error) {
			connection.end();
			context.fail();
			callback(error);
		} else {
			console.log("Notification to user #" 
						+ fav.author + " for rating " 
						+ fav.entryId + " added.");
			connection.end();
			context.succeed();
			callback(null, JSON.stringify(fav));
		}
	}
};