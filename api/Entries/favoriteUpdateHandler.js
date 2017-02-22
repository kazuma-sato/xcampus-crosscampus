/*
	Lambda Function for favoriteUpdateHandler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Feb 2, 2017
    Date last modified Feb 22, 2017
*/
'use strict';

console.log('Loading favoriteUpdateHandler');

exports.favoriteUpdateHandler = function(event, context, callback) {

	const fav = JSON.parse(event.key1);

	const mysql = require('mysql');
	const connection = mysql.createConnection(
		require('../xcampusdb')
	);

	if(fav.type == "add") {

		let query = connection.query(
		'INSERT INTO favourite SET ?;',
		entry,
		function (error, result) {

			if(error) throw error;
			console.log('Success! Rating added!');

			let query = connection.query(
				'INSERT INTO notification SET ?',
				{entryID: entry.id, userID: entry.author},
				function (error, result) {

					if(error) throw error;
					console.log('Success! Notification added!');
				});
			console.log('Query : ' + query);
		});
		console.log('Query : ' + query);	

	} else if(rating.type == "remove") {

		let query = connection.query(
			"DELETE FROM rating WHERE entryID=? AND userID=?",
			[rating.entryId, rating.userId],
			function (error, result) {

			if(error) throw error;
			console.log('Deleted ' + result.affectedRows + ' row(s).');
		});
		console.log('Query : ' + query);	
	}

	console.log('Query : ' + query);
	connection.end();
	callback(null, JSON.stringify(entry);
	context.succeed();
};