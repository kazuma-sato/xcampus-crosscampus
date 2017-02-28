'use strict';
/*
	Unit Test for entryRequestHandler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Feb 22, 2017
    Date last modified Feb 22, 2017
*/

let handler = require('../Entries/entryRequestHandler');
let validRequest = {key1 : '{"id" : 2}'};
let missingRequest = {key1 : '{"id" : 10}'};
let invalidRequest = {key1 : '{"id" : null}'};
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

console.log("\nTest with valid request : \n");
handler.entryRequestHandler(validRequest, context, callback);
/*
console.log("\nTest with missing request : \n");
handler.entryRequestHandler(missingRequest, context, callback);

console.log("\nTest with invalid request : \n");
handler.entryRequestHandler(invalidRequest, context, callback);
*/