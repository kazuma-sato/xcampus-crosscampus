'use strict';
/*
	Unit Test for entryPostHandler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Feb 27, 2017
    Date last modified Feb 27, 2017
*/
let handler = require('../Entries/entryPostHandler');

// For reverting changes
const mysql = require('mysql');
const connection = mysql.createConnection(
		
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

// Test values 
let validNotePost = 
{
    key1 : JSON.stringify(
    {
        author : 1,
        title : "Test",
        entryType : "Note",
        description : "This is just a test"
    })
}
let validCommentPost = 
{
    key1 : JSON.stringify(
    {
        author : 2,
        title : "",
        parentID : 1,
        entryType : "Comment",
        description : "This is awesome!"
    })
};
let invalidPost = {key1 : '{"id" : null}'};

let context = {
    fail : function() { console.log("context : failure"); },
    succeed : function() { console.log("context : success") }
};

var callback = function (error, value=null){

    let comment; 

    if (value){
        comment = value;
    } else {
        comment = error;
    }
    console.log("Callback : " + comment);
};

console.log("\nTest with valid note submission: \n");
handler.entryPostHandler(validNotePost, context, callback);

console.log("\nTest with valid comment submission : \n");
handler.entryPostHandler(validCommentPost, context, callback);
/*
console.log("\nTest with invalid request : \n");
handler.entryRequestHandler(invalidRequest, context, callback);
*/

// Clean-up

connection.query(
    "DELETE FROM notification WHERE entryID =  " + 
    "(SELECT id FROM entry WHERE author = 2 AND parentID = 1 AND entryType = 'Comment' " +
    "AND description = 'This is awesome!') " + 
    "AND userID = (SELECT author FROM entry WHERE id=1)",
    function(error,results) {

        if(error) throw error;
        console.log("TEST: Deleted " + results.affectedRows + " from notification.");
    }
);

connection.query(
    "DELETE FROM entry " + 
    "WHERE dateCreated >= DATE_SUB(NOW() , INTERVAL 10 MINUTE)",
    function(error, results) {

        if(error) throw error;
            console.log("TEST: Deleted " + results.affectedRows + " from entry.");
    }
);
