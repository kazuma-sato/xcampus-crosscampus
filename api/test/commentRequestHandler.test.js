'use strict';
/*
	Unit Test for commentRequestHandler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Feb 2, 2017
    Date last modified Feb 22, 2017
*/

let handler = require('../Entries/Comments/commentRequestHandler');
let validRequest = {key1 : '{"id" : 3}'};
let missingRequest = {key1 : '{"id" : 10}'};
let invalidRequest = {key1 : '{"id" : null}'};
let context = {
    fail : function(){ console.log("context : failure"); },
    succeed : function() { console.log("context : success") }
};

var callback = function (error, value=null){

    var comment; 

    if (value){
        comment = value;
    } else {
        comment = error;
    }
    console.log("Callback : " + comment);
};

console.log("\nTest with valid request : \n");
handler.commentRequestHandler(validRequest, context, callback);

console.log("\nTest with missing request : \n");
handler.commentRequestHandler(missingRequest, context, callback);

console.log("\nTest with invalid request : \n");
handler.commentRequestHandler(invalidRequest, context, callback);