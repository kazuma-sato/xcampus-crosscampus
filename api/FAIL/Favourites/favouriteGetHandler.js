'use strict';
/*
	Lambda Function for favouriteGetHandler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Feb 2, 2017
    Date last modified Mar 13, 2017
*/

console.log('Loading favouriteGetHandler');


// HTTP Request GET Method for favourites
// entryID & userID are both optional query 
// params. No params returns all.
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
	
    let query = 'SELECT * FROM favourite';
    const param = []

    if(event.queryParams.entryID !== undefined) {
        query += " WHERE entryID=?";
        param.push(entryID);
        if(event.queryParams.userID !== undefined) {
            query += " &";
        }
    }
    if(event.queryParams.userID !== undefined) {
        query += " WHERE userID=?";
        param.push(userID);
    }

	connection.query(
		query,
		param,
		(error, result) => {

			if(error){
				connection.end();
				callback(error);
			} else {
				console.log("Result : " 
                        + JSON.stringify(result));
				callback(null, result);
			}
		}
	);
};