'use strict';
/*
	Lambda Function for entryPostHandler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Feb 2, 2017
    Date last modified Mar 12, 2017
*/

console.log('\nLoading function entryPostHandler...\n');

exports.handler = function(event, context, callback) {

    console.log(JSON.stringify(event,null,2))

	let entry = event;
	
	const mysql = require('mysql');
	const connection = mysql.createConnection({
			host     : 'db.crosscampus.xcamp.us',
			user     : 'root',
			password : 'GBCxcamp',
			database : 'crosscampus',
			port     : '3306',
		}
	);
	
	const done = (error, response) => {
        
        connection.end();
        
        if(error){
            console.log(error.message);
            callback(error);
        } else {
            console.log(JSON.stringify(response, null, 2));
            callback(null, response);
        } 
    };

	console.log(
	    connection.query(
    		'SELECT id FROM entryType WHERE name LIKE ?;',
    		entry.entryType,
    		insertEntryCallback
    	).sql
    );

	function insertEntryCallback(error, result) {

		if(error) {
			done(error);
		} else if(!result.length) {
			done(new Error("Error: Entry type is invalid!!"));
		} else {
			entry.entryType = result[0].id;
			console.log(
			    connection.query(
    				'INSERT INTO entry SET ?;',
    				entry,
    				selectAuthorCallback
    			).sql
    		);
		}
	}

	function selectAuthorCallback(error, result) {

		if(error) {
			done(error);
		} else {
			entry.id = result.insertId;
			if(entry.parentID) {
			    console.log(
    				connection.query(
    					"SELECT author FROM entry WHERE id =?", 
    					entry.parentID,
    					insertNotificationCallback
    				).sql
    			);
			} else {
				done(null, entry);
			}
		}
	}

	function insertNotificationCallback(error,result) {

		if(error) {
			done(error);			
		} else if(!result) {
			done(new Error("Error: ParentID, '" + entry.parentID + "', of entry " + entry.id + " is invalid!"));
		} else {
			entry.parentEntryAuthor = result[0].author;
			console.log(
			    connection.query(
    				'INSERT INTO notification(entryID, userID, actionID)' + 
    				'SELECT ?,?,id FROM actionType WHERE name=?',
    				[ entry.id, entry.parentEntryAuthor, "commented" ],
    				(error, result) => error ? done(error) : done(null, entry)
    			).sql
    		);
		}
	}
};