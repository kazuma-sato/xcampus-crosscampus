'use strict';
console.log('Loading entryByIdRatingFavRequest.handler');
/*
	Lambda Function for entryByIdRatingFavRequest.handler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Mar 18, 2017
    Date last modified Mar 18, 2017
*/
const mysql = require('mysql');

exports.handler = (event, context) => {

    const connection = mysql.createConnection(event.stageVariables);
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
    const parseRequest = (eventParam, request) => {
        
        Object.keys(eventParam).map(key => {

            if(key.toLowerCase() == "limit") {
                request.limit = eventParam[key].split(",").map(
                    limit => {
                        return parseInt(limit);
                    });
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
                    if(resource.toLowerCase() == "recent"){
                        request.recent = true;
                    }
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
        request.entry.id = event.pathParameters.id;
    }
    if(resources[2]){
        if (resources[2] != "comments" 
                && resources[2] != "recent") {
            request.type = resources[2];
        }
    }

    console.log('Processed event to request : \n' + JSON.stringify(request,null,2));

    switch(request.httpMethod) {

        case 'DELETE':
            deleteHandler(request, done);
            break;

        case 'GET':
            getHandler(request, done);
            break;
        
        case 'POST':
            postHandler(request, done);
            break;

        default:
            done(new Error(`Error : Unsupported method "${event.httpMethod}"`));
        }

    function deleteHandler(request, callback) {

        if(request.username && request.entry.id) {
            let query = "DELETE FROM ?? WHERE entryID=? AND userID=" +
                        "(SELECT id FROM users WHERE username=?);";

            console.log(
                connection.query(query,
                    [request.type, request.entry.id, request.username],
                    callback
                ).sql
            ); 
        } else {
            done(new Error("Error : Missing both entryID and requestContext.user. Both values are required."));
        }
    }

    function getHandler(request, callback) {

        if(request.type == "rating"){ 
            let query = "SELECT userID FROM rating WHERE entryID=? AND "
                    + "(SELECT flaggedBy FROM entry WHERE id=? AND flaggedBy IS NULL);"
            console.log(
                connection.query(query, 
                    [request.entry.id,  request.entry.id],
                    callback
                ).sql
            );
        } else if (request.type == "favourite"){
            let query = "SELECT users.username, favourite.entryID FROM favourite " + 
                        "LEFT JOIN users ON favourite.userID=users.id " +
                        "WHERE favourite.entryID=? AND " + 
                        "userID=(SELECT id FROM users WHERE username=?) AND " +
                        "(SELECT flaggedBy FROM entry WHERE id=? AND flaggedBy IS NULL);"
            console.log(
                connection.query(query, 
                    [request.entry.id,  request.username, request.entry.id],
                    callback
                ).sql
            );
        }
    }

    function postHandler(request, callback) {

        if(!request.username || ! request.entry.id) {
            callback(new Error("Error : Missing UserID, EntryID or both. Both is required for "+request.type));
        } else {
            let query = "INSERT INTO ?? (entryID, userID) " + 
                        "VALUES (?, (SELECT id FROM users WHERE username=?))";

            new Promise((resolve, reject) => 
                        
                console.log(
                    connection.query(query, 
                        [request.type, request.entry.id, request.username],
                        (error,result) => {

                            if(error) return reject(error);
                            request.insertEntryResult = result;
                            resolve(request);
                        }
                    ).sql
                )
            ).then(request => {

                return new Promise((resolve,reject) => {

                    if(request.type == "rating") {
                        console.log(
                            connection.query(
                                'INSERT INTO notification(entryID, userID, actionID)' + 
                                'VALUES (?,(SELECT id FROM users WHERE username=?),(SELECT id FROM actionType WHERE name=?))',
                                [ request.entry.id, 
                                request.username, 
                                "rated" ],
                                (error, result) => {

                                    if(error) return reject(error);
                                    request.insertNotificationResults = result;
                                    resolve(request);
                                }
                            ).sql
                        )
                    } else { resolve(request); }
                })
            }).then(response => done(null, response)
            ).catch(error => done(error))
        }
    }
}
