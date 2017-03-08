'use strict';
/*
	Unit Test for ratingPostHandler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Mar 7, 2017
    Date last modified Mar 7, 2017
*/

console.log("\nLoading test for function ratingPostHandler...\n")

let handler = require('../Ratings/ratingPostHandler');

// Test event values // 

let validRatingRequest = 
{
    key1 : JSON.stringify(
    {
        userId : 2,
        entryId : 1
    })
};
let invalidRatingRequest = {key1 : '{"id" : null}'};

// context Object and callback function simulations for AWS

let context = {
    fail : function() { console.log("Context : failure"); },
    succeed : function() { console.log("Context : success") }
};

function callback(error, value=null) {

    if (value){
        console.log("Callback : " + value);
        // Clean up
        (function() {
            const mysql = require('mysql');
            const connection = mysql.createConnection(

                //require('xcampusdb')
                // for testing
                {
                    host     : 'localhost',
                    user     : 'xcampus',
                    password : 'GBCxcamp',
                    database : 'crosscampus',
                    port     : '3306',
                    //debug    : true
                }
            );
            const entryId = JSON.parse(validRatingRequest.key1).entryId;
            const userId = JSON.parse(validRatingRequest.key1).userId;
            console.log(connection.query(
                "DELETE FROM notification WHERE entryId=?;",
                entryId,
                function(error, result) {
                    console.log(connection.query(
                        "DELETE FROM rating WHERE userId=? AND entryId=?;", 
                        [ JSON.parse(validRatingRequest.key1).userId
                        , JSON.parse(validRatingRequest.key1).entryId]).sql);
                        
                    connection.end();
                }
                ).sql);
            
        })();
    } else {
        console.log("Callback : " + JSON.stringify(error));
        if(error.code == "ER_DUP_ENTRY"){
            (function() {
                const mysql = require('mysql');
                const connection = mysql.createConnection(

                    //require('xcampusdb')
                    // for testing
                    {
                        host     : 'localhost',
                        user     : 'xcampus',
                        password : 'GBCxcamp',
                        database : 'crosscampus',
                        port     : '3306',
                        //debug    : true
                    }
                );
                const entryId = JSON.parse(validRatingRequest.key1).entryId;
                const userId = JSON.parse(validRatingRequest.key1).userId;
                console.log(connection.query(
                    "DELETE FROM notification WHERE entryId=?;",
                    entryId,
                    function(error, result) {
                        console.log(connection.query(
                            "DELETE FROM rating WHERE userId=? AND entryId=?;", 
                            [ JSON.parse(validRatingRequest.key1).userId
                            , JSON.parse(validRatingRequest.key1).entryId]).sql);
                            
                        connection.end();
                    }
                    ).sql);
                
            })();
        }
    }
};

console.log("\nTest with valid favourite submission : \nValues : \n" 
            + JSON.stringify(validRatingRequest));
handler.ratingPostHandler(validRatingRequest, context, callback);

console.log("\nTest with invalid favourite submission : \nValues  : \n"
            + JSON.stringify(invalidRatingRequest));
handler.ratingPostHandler(invalidRatingRequest, context, callback);



