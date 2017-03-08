'use strict';
/*
	Unit Test for favouritePostHandler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Mar 7, 2017
    Date last modified Mar 7, 2017
*/

console.log("\nLoading test for function favouritePostHandler...\n")

let handler = require('../Favourites/favouritePostHandler');

// Test event values // 

let validFavRequest = 
{
    key1 : JSON.stringify(
    {
        userId : 2,
        entryId : 1
    })
};
let invalidFavRequest = {key1 : '{"id" : null}'};

// context Object and callback function simulations for AWS

let context = {
    fail : function() { console.log("Context : failure"); },
    succeed : function() { console.log("Context : success") }
};

function callback(error, value=null) {

    if (value){
        console.log("Callback : " + value);
    } else {
        console.log("Callback : " + JSON.stringify(error));
    }
};

console.log("\nTest with valid favourite submission : \nValues : \n" 
            + JSON.stringify(validFavRequest));
handler.favouritePostHandler(validFavRequest, context, callback);

console.log("\nTest with invalid favourite submission : \nValues  : \n"
            + JSON.stringify(invalidFavRequest));
handler.favouritePostHandler(invalidFavRequest, context, callback);


// Clean up

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
console.log(
    connection.query(
        "DELETE FROM favourite WHERE userId=? AND entryId=?", 
        [ JSON.parse(validFavRequest.key1).userId
        , JSON.parse(validFavRequest.key1).entryId]).sql
    );
connection.end();
