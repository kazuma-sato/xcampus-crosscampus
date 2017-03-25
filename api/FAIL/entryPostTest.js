'use strict';
console.log('Loading entryRequest.handler');
/*
	Lambda Function for entryRequest.handler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Mar 17, 2017
    Date last modified Mar 17, 2017
*/
const mysql = require('mysql');

exports.handler = (event, context) => {

    const connection = mysql.createConnection( {
            host     : context.host,
            user     : context.user,
            password : context.password,
            database : context.database,
            port     : context.port
        }
    );
	const done = (error, responseBody) => {
        
        const response = {
            statusCode : error ? '400' : '200',
            body       : error ? error.message : JSON.stringify(responseBody, null, 2),
            headers    : { 'Content-Type': 'application/json' }
        };
        console.log(response);
        connection.end();
        context.succeed(response);
    };
    const parseRequest = function(eventParam, request){
        Object.keys(eventParam).map(key => {

            if(key.toLowerCase() == "limit") {
                request.limit = eventParam[key].split(",");
            } else {
                request.entry[key] = eventParam[key]       
            } 
        });
        return request;
    }
    let request = { 
        username : event.requestContext.identity.user,
        entry : {} }
    const resources = event.resource.split("/")
            .filter(Boolean).map(resource => {
                    resource = resource.endsWith('s') 
                            ? resource.substring(0,resource.length - 1) 
                            : resource;
                    return resource.toLowerCase();
    });

    console.log('Received event:', JSON.stringify(event, null, 2));

    request.httpMethod = event.httpMethod;
    if(event.queryStringParameters) {
        request = parseRequest(event.queryStringParameters, request);
    }
    if(event.body) {
        request = parseRequest(JSON.parse(event.body), request);
    }
    if(event.pathParameters) {
        if(resources[2] == "comment"){
            request.entry.parentId = event.pathParameters.id;
            request.entry.entryType = resources[2];
        } else {
            request.entry.id = event.pathParameters.id;
        }
    }
    if(resources.includes("recent")){
        request.recent = true;
    }
    if(resources[1]){
        if (resources[1] != "{id}" 
                && resources[1] != "recent"){
            request.entry.entryType = resources[1];
        }
    }

    console.log('Processed event to request : \n' + JSON.stringify(request,null,2));

    const entry = request.entry;

    if(!entry.parentId) {
        if(entry.entryType == "comment"){
            callback(new Error("Error : Comments require a parentID."));
        }
    } else {
        entry.entryType = "comment"
    }

    new Promise((resolve, reject) =>
        
        console.log(
            connection.query(
                'SELECT * FROM entryType WHERE name=?;',
                entry.entryType,
                (error, result) => {
                    if(error) return reject(error);
                    request.entryType = result[0];
                    request.entry.entryType = resolve[0].id;
                    resolve(request);
                }
            ).sql
        )
    ).then(request => {

        return new Promise((resolve, reject) => 
            
            console.log(
                connection.query(
                    "INSERT INTO entry SET ?, `author`=" +
                    "(SELECT id FROM users WHERE username=?);", 
                    [request.entry, request.username],
                    (error,result) => {
                        if(error) return reject(error);
                        request.insertEntryResult = result;
                        resolve(request);
                    }
                ).sql
            )
        )
    }).then(request => {

        return new Promise((resolve,reject) => {

            if(entry.entryType == "comment") {
                console.log(
                    connection.query(
                        'INSERT INTO notification(entryID, userID, actionID)' + 
                        '?,(SELECT author FROM entry WHERE id=?),(SELECT id FROM actionType WHERE name=?',
                        [ request.entry.insertEntryResult.insertId, 
                            request.entry.parentId, "commented" ],
                        (error, result) => {

                            if(error) return reject(error);
                            request.insertNotificationResults = result;
                            resolve(request);
                        }
                    ).sql
                )
            } else {
                resolve(request); 
            }
        })
    }).then(response => callback(null, response)
    ).catch(error => callback(error))
}
