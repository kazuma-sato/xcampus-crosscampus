'use strict';
/*
	Unit Test for entryGetHandler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Feb 22, 2017
    Date last modified, Mar 9, 2017
*/

let entryGetHandler = require('../Entries/entryGetHandler');

// Test event values
let validAdRequest = {key1 : '{"id" : 2}'};
let missingRequest = {key1 : '{"id" : 10}'};
let invalidRequest = {key1 : '{"id" : null}'};
let validNoteRequest = {key1 : '{"id" : 1}'};
let validcommentRequest = {key1 : '{"id" : 3}'};


// context object and callback function to simulate Lambda Funtions
let context = {
    fail : function() { console.log("context : failure"); },
    succeed : function() { console.log("context : success") }
};

var callback = function (error, value=null){

    let comment; 

    if(value) {
        comment = value;
    } else {
        comment = error;
    }
    console.log("Callback : " + comment);
};

console.log("\nTest with valid GET request values for note: \n");
entryGetHandler.handler(validNoteRequest, context, callback);

console.log("\nTest with valid GET request values for ad: \n");
entryGetHandler.handler(validAdRequest, context, callback);

console.log("\nTest with valid GET request values for comment: \n");
entryGetHandler.handler(validcommentRequest, context, callback);

console.log("\nTest with missing request : \n");
entryGetHandler.handler(missingRequest, context, callback);

console.log("\nTest with invalid request : \n");
entryGetHandler.handler(invalidRequest, context, callback);