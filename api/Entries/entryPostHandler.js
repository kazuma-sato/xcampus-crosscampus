'use strict';
/*
	Lambda Function for entryPostHandler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Feb 2, 2017
    Date last modified Feb 27, 2017
*/

console.log('Loading function');

exports.entryPostHandler = function(event, context, callback) {

	let entry = JSON.parse(event.key1);
	console.log(JSON.stringify(entry))
	const mysql = require('mysql');
	const connection = mysql.createConnection(
		
		//require('../xcampusdb')

		//For Testing :
		{
			host     : 'localhost',
			user     : 'xcampus',
			password : 'GBCxcamp',
			database : 'crosscampus',
			port     : '3306',
			//debug    : true
		}
	);

	let query = connection.query(
		'SELECT id FROM entryType WHERE name LIKE ?;',
		entry.entryType,
		function(error, result) {

			if(error) {
				callback(error);
				context.fail();
			} else if(!result.length) {
				callback(null, "{}");
				context.fail();
			} else {
				console.log('EntryType found!'+ result[0].id);
				entry.entryType = result[0].id;

				let query = connection.query(
					'INSERT INTO entry SET ?;',
					entry,
					function (error, result) {

						if(error) {
							callback(error);
							context.fail();
						} else {
							entry.id = result.insertId;
							console.log('Success! Entry added!');
							console.log('EntryID for new entry : ' + entry.id);

							if(entry.parentID) {
								connection.query(
									"SELECT author FROM entry WHERE id =?", entry.parentID,
									function(error,result) {

										if(error) {
											throw error;
										} else if(!result) {
											callback("ParentID, '" + entry.parentID + "' of entry " + entry.id + " is invalid!");
											context.fail();
										} else {
											connection.commit(
												function(error) {
													if(error){
														return connection.rollback(function() {
															throw error;
														})
													} else {
														connection.query(
															'INSERT INTO notification SET ?;',
															{ entryID: entry.id, userID: result[0].author },
															function (error, result) {

																if(error) throw error;

																callback(null, JSON.stringify(entry));
																context.succeed();
																connection.end();
															}
														);
													}
											});
											
										}
									console.log('Query : ' + query.sql);
								}
							)
						}
					}
				})
			};
		console.log("Entry type ID is : " + entry.entryType);
		console.log('Query : ' + query.sql);
	})
};