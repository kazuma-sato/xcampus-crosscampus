'use strict';
/*
	Unit Test for entryPostHandler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Feb 27, 2017
    Date last modified Mar 7, 2017
*/

console.log("\nLoading test for function entryPostHandler...\n")

let entryPostHandler = require('../Entries/entryPostHandler');

// Test event values // 

let validNotePost = 
{
    key1 : JSON.stringify(
    {
        author : 1,
        title : "Test",
        entryType : "Note",
        description : "This is just a note test"
    })
};
let validAdPost = 
{
    key1 : JSON.stringify(
    {
        author : 3,
        title : "Test",
        entryType : "Ad",
        description : "This is just an ad test"
    })
};
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
let invalidEntry = {key1 : '{"id" : null}'};

// context Object and callback function simulations for AWS

let context = {
    fail : function() { console.log("Context : failure"); },
    succeed : function() { console.log("Context : success") }
};

console.log(validNotePost.key1)

function callback(error, value=null) {

    if (value){
        console.log("Callback : " + value);
    } else {
        console.log("Callback : " + JSON.stringify(error));
    }
};

console.log("\nTest with valid note submission : \nValues : \n" 
            + JSON.stringify(validNotePost));
entryPostHandler.handler(validNotePost, context, callback);

// console.log("\nTest with valid ad submission : \nValues  : \n"
//             + JSON.stringify(validAdPost));
// entryPostHandler.handler(validAdPost, context, callback);

// console.log("\nTest with valid comment submission : \nValues  : \n"
//             + JSON.stringify(validCommentPost));
// entryPostHandler.handler(validCommentPost, context, callback);

// console.log("\nTest with invalid request : \nValues : \n"
//             + JSON.stringify(invalidEntry));
// entryPostHandler.handler(invalidEntry, context, callback);

// Clean-up

// TODO :  (not nessary: revert changes Tests make or
//          just clean the test so it uses mocha properly)

// For reverting changes
// const mysql = require('mysql');
// const connection = mysql.createConnection(
		
//         //For Testing :
// 		{
// 			host     : 'localhost',
// 			user     : 'xcampus',
// 			password : 'GBCxcamp',
// 			database : 'crosscampus',
// 			port     : '3306',
// 			//debug    : true
// 		}
// 	);
 
// connection.query(
//     "DELETE FROM notification WHERE entryID =  " + 
//     "(SELECT id FROM entry WHERE author = 2 AND parentID = 1 AND entryType = 'Comment' " +
//     "AND description = 'This is awesome!') " + 
//     "AND userID = (SELECT author FROM entry WHERE id=1)",
//     function(error,results) {

//         if(error) throw error;
//         console.log("TEST: Deleted " + results.affectedRows + " from notification.");
//         connection.query(
//             "DELETE FROM entry " + 
//             "WHERE dateCreated >= DATE_SUB(NOW() , INTERVAL 10 MINUTE)",
//             function(error, results) {

//                 if(error) throw error;
//                     console.log("TEST: Deleted " + results.affectedRows + " from entry.");
//             }
//         );
//     }
// );