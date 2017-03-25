'use strict';
/*
	Lambda Function for entryPutHandler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Feb 2, 2017
    Date last modified Mar 5, 2017
*/

console.log('Loading entryPutHandler');

const mysql = require('mysql');

// PUT method handler for entry
exports.handler = function(entry, context, callback) {

	const connection = mysql.createConnection( {
            host     : context.host,
            user     : context.user,
            password : context.password,
            database : context.database,
            port     : context.port
        }
	)
	console.log(
		connection.query(
			'SELECT COUNT(*) AS count FROM entry WHERE id=?;',
			entry.id,
			updateEntry
		).sql
	);

	function updateEntry(error, result) {

		if(error){
			connection.end();
			callback(error);
		} else if(!result[0].count){	
			connection.end();
			callback(new Error("Error: Entry #" + entry.id + " does not exist!"));
		} else {
			console.log(
				connection.query(
					'UPDATE entry SET ? WHERE id=?',
					[ entry, entry.id ],
					(error,results) => 
						callback(error,results)
				).sql
			)
		}
	}
}
