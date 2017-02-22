/*
	Lambda Function for accountRegistrationHandler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Feb 2, 2017
    Date last modified Feb 22, 2017
*/
'use strict';

const AWS = require('aws-sdk');

console.log('Loading accountRegistrationHandler');
// get reference to S3 client 
let s3 = new AWS.S3();

exports.accountRegistrationHandler = function(event, context, callback) {

	const reg = JSON.parse(event.key1);
	const mysql = require('mysql');

	const connection = mysql.createConnection(
		require('../xcampusdb')
	);

	console.log("Checking for email and username availablity");

	if (!checkAvailablity("email", reg.email)){

		connection.end();
		callback("An account with " + reg.email + " already exists!");
		context.fail();

	} else if (!checkAvailablity("username" + reg.username)){

		connection.end();
		callback("The username, " + reg.username + " already exits!");
		context.fail();
	}

	// Insert statement to db
	let query = connection.query(
		'INSERT INTO users SET ?;',
		reg,
		function (error, result) {

			if(error) throw error;
			console.log('Success! User added!');
			reg.id = result.insertId;

			console.log('Query : ' + query);
			console.log('ID for new user : ' + entry.id);
		});
	console.log('Query : ' + query);
	connection.end();
	
	// S3 Bucket creation should go here //

	callback(null, JSON.stringify(reg);
	context.succeed();

	// For checking email and username availablity. Returns bool.
	const checkAvailablity = function(key, value){

		let isAvailable;

		console.log("Building query:");
		const query = connection.query(
		'SELECT COUNT(*) AS count FROM WHERE ?? LIKE ?;',
		[key, value],
		function(error, result) {

			if(error) throw error;
			isAvailable = result[0].count == 0
		});
		console.log("Query : " + query);
		console.error(
			"The " + value + (isAvailable?"is":"is not") + "an available " + key);
		return isAvailable;
	}
};