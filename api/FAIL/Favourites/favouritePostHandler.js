'use strict';
/*
	Lambda Function for favouritePostHandler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Feb 2, 2017
    Date last modified Mar 13, 2017
*/

console.log('Loading favouritePostHandlerPostHandler');

exports.handler = function(event, context, callback) {

	const fav = JSON.parse(event.favourite);

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
		'INSERT INTO favourite SET ?;',
		fav,
		function (error, result) {

			if(error){
				connection.end();
				context.fail();
				callback(error);
			} else {
				console.log('Success! Favourite added!');
				connection.end();
				context.succeed();
				callback(null, JSON.stringify(fav));
			}
		}
	);
};