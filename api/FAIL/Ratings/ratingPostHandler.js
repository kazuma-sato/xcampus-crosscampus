'use strict';
/*
	Lambda Function for ratingPostHandler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Feb 2, 2017
    Date last modified Mar 13, 2017
*/

console.log('Loading favouritePostHandlerPostHandler');

exports.handler = function(event, context, callback) {

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
		'INSERT INTO rating SET ?;',
		event.rating,
		function (error, result) {

			if(error){
				connection.end();
				callback(error);
			} else {
				console.log('Success! Favourite added!');
				connection.end();
				callback(null, result);
			}
		}
	);
};