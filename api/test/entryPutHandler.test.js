'use strict';
/*
	Lambda Function for entryPutHandler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Mar 5, 2017
    Date last modified Mar 5, 2017
*/

console.log("\nLoading test for function entryPutHandler...\n")

let entryPutHandler = require('../Entries/entryPutHandler');
let entryPostHandler = require('../Entries/entryPostHandler');


// Test event values // 
let notePost = 
{
    key1 : JSON.stringify(
    {
        author : 1,
        title : "Test",
        entryType : "Note",
        description : "This note needs to be updated!"
    })
};
let commentPost = 
{
    key1 : JSON.stringify(
    {
        author : 2,
        title : "",
        parentID : 1,
        entryType : "Comment",
        description : "This comment needs to be edited!"
    })
};

// context Object and callback function simulations for AWS
let context = {
    fail : function() { console.log("Context : failure"); },
    succeed : function() { console.log("Context : success") }
};

function testResultCallback(error, value=null) {

    if (value){
        console.log("Callback : " + value);
    } else {
        console.log("Callback : " + error);
    }
};

function handlerTestCallback(error, value=null) {

    if (value){
        value = JSON.parse(value);
        value = 
        {
            key1 : JSON.stringify(
                {
                    id : value.id,
                    description : "This is entry was edited!",
                })
        };
        console.log("Values used to update : " + JSON.stringify(value));
        entryPutHandler.entryPutHandler(
                value, context, testResultCallback);
    } else {
        console.log("Test Value Callback : " + error);
    }
}

console.log("Adding test data to update for testing...\n\n" + 
            "Values used : \n" + JSON.stringify(notePost));
entryPostHandler.entryPostHandler(notePost, context, handlerTestCallback);

console.log("Values used : \n" + JSON.stringify(commentPost));
entryPostHandler.entryPostHandler(commentPost, context, handlerTestCallback);

