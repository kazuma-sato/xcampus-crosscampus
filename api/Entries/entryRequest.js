'use strict';
console.log('Loading entryRequest.handler');
/*
	Lambda Function for entryRequest.handler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Mar 17, 2017
    Date last modified Mar 20, 2017
*/
const mysql = require('mysql');

exports.handler = (event, context) => {

    const connection = mysql.createConnection( event.stageVariables);
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
        if(resources[2] == "comment"){
            request.entry.parentId = event.pathParameters.id;
            request.entry.entryType = resources[2];
        } else {
            request.entry.id = event.pathParameters.id;
        }
    }
    if(resources[1]){
        if (resources[1] != "{id}" 
                && resources[1] != "recent"){
            request.entry.entryType = resources[1];
        }
    }

    console.log('Processed event to request : \n' + JSON.stringify(request,null,2));

    switch(request.httpMethod) {

        case 'DELETE':
            deleteHandler(request.entry, request.username, done);
            break;

        case 'GET':
            getHandler(request.entry, request, done);
            break;

        case 'PUT':
            putHandler(request.entry, request.username);
            break;
        
        case 'POST':
            postHandler();
            break;
        default:
            done(new Error(`Error : Unsupported method "${event.httpMethod}"`));
        }

    function deleteHandler(entry, username, callback) {

        if(entry.id && username) {
            let query = 'UPDATE entry SET flaggedBy=(SELECT id FROM users WHERE username=?) WHERE id=?;';
            console.log(
                connection.query(query,
                    [username, entry.id],
                    callback
                ).sql
            ); 
        } else {
            callback(new Error("Error : Missing both entryID and requestContext.user. Both values are required."));
        }
    }

    function getHandler(entry,queryParams, done) {

        let query = "SELECT users.username, entry.*, COUNT(rating.userID) AS rating FROM entry "
                  + "LEFT JOIN rating ON entry.ID=rating.entryID " 
                  + "LEFT JOIN users ON entry.author=users.id WHERE "
        if(entry.id){
            query = mysql.format(query + "entry.id=? AND ", entry.id);
        } else {
            Object.keys(entry).forEach(key => {
                if(key === "entryType"){
                    query += "entry.entryType=(SELECT id FROM entryType WHERE name=?) AND ";
                    query = mysql.format(query, entry.entryType);
                } else {
                    query += "entry.??=? AND ";
                    query = mysql.format(query, [key, entry[key]]);
                }
            })
        }
        query += "entry.flaggedBy IS NULL ";
        query += "GROUP BY entry.id "
        query += queryParams.recent ? "ORDER BY entry.dateCreated ASC " : "";
        if(queryParams.limit) {
            query += "LIMIT ";
            query += (queryParams.limit.length == 1) ? "? " : "?,? ";
            query = mysql.format(query, queryParams.limit);
        }
        new Promise((resolve, reject) => 
            console.log(
                connection.query(
                    query, null, (error, result) => {  
                        console.log(result)      
                        if(error) reject(error);
                        if(!result.length) reject(new Error("Error : No entries found!"));
                        let entries = result.map(row => {
                            let entry = {};
                            Object.keys(row).forEach(column => {

                                if(row[column]) entry[column] = row[column];
                            });
                            return entry;
                        });
                        return resolve(entries);
                    }
                )
            .sql)
        ).then(entries => {
            
            return Promise.all(entries.map(entry => {        
                return new Promise((resolve, reject) => 

                    console.log(connection.query(
                            'SELECT id FROM entry WHERE parentID=?',
                            entry.id,
                            (error, comments) => {
                                
                                if(error) reject(error);
                                comments = comments.map(comment => { return comment.id })
                                if(comments.length) entry.comments = comments;
                                return resolve(entry);
                            }
                    ).sql)
                );
            }));
        }).then(entries => done(null, entries))
        .catch(error => done(error))
    }
    function putHandler(entry, username) {

        if(!username) {
            done(new Error("Error : You must be logged to edit an entry!"));
        }
        new Promise((resolve,reject) => 

            console.log(
                connection.query(
                    "SELECT (SELECT id FROM users WHERE username=?)="+
                    "(SELECT author FROM entry WHERE id=?) AS isValid",
                    [username, entry.id],
                    (error, result) => {

                        if(error) reject(error);
                        if(result) {
                            if(result[0].isValid) {
                                return resolve(entry);
                            } else {
                                reject(new Error("Error : The requested user cannot edit this entry!"));
                            }
                        } else {
                            reject(new Error("Error : Cannot find an ID# for this user"));
                        }
                    }
                ).sql
            )
        ).then(entry => {

           return new Promise((resolve,reject) => 

                console.log(
                    connection.query(
                        'UPDATE entry SET ? WHERE id=?',
                        [ entry, entry.id ],
                        (error,result) => {
                        
                            if(error) reject(error);
                            return resolve(result);
                        }
                    ).sql
                )			
            )
        }).then(result => done(null,result)
        ).catch(error => done(error));
    }

    function postHandler() {

        const entry = request.entry;

        if(!entry.parentId) {
            if(entry.entryType == "comment"){
                done(new Error("Error : Comments require a parentID."));
            }
        } else {
            entry.entryType = "comment";
        }

       new Promise((resolve, reject) =>
            
            console.log(
                connection.query(
                    'SELECT * FROM entryType WHERE name=?;',
                    entry.entryType,
                    (error, result) => {
                        if(error) return reject(error);
                        request.entryType = result[0];
                        request.entry.entryType = result[0].id;
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

                if(request.entryType.name == "comment") {
                    console.log(
                        connection.query(
                            'INSERT INTO notification(entryID, userID, actionID)' + 
                            'VALUES (?,(SELECT author FROM entry WHERE id=?),(SELECT id FROM actionType WHERE name=?))',
                            [ request.insertEntryResult.insertId, 
                              request.entry.parentId, 
                              "commented" ],
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
        }).then(response => done(null, response)
        ).catch(error => done(error))
    }
}
