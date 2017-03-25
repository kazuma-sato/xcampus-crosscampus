'use strict';
console.log('Loading entryRequest.handler');

/*
	Lambda Function for entryRequest.handler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Feb 2, 2017
    Date last modified Mar 12, 2017
*/
const mysql = require('mysql');

exports.handler = (event, context, callback) => {

    const connection = mysql.createConnection({
            host     : context.host,
            user     : context.user,
            password : context.password,
            database : context.database,
            port     : context.port,
        }
    );
	const done = (error, responseBody) => {
        
        const response = {
            statusCode : error ? '400' : '200',
            body       : error ? error.message : JSON.stringify(responseBody),
            headers    : { 'Content-Type': 'application/json' }
        };
        console.log(JSON.stringify(response, null, 2));
        connection.end();
        context.succeed(response);
    };
    
    console.log('Received event:', JSON.stringify(event, null, 2));
    switch(event.httpMethod) {

        case 'DELETE':
            deleteHandler( {
                id        : event.pathParameters.id,
                flaggedBy : event.requestContext.user }
                , done);
            break;

        case 'GET':
            getHandler( 
                { id : event.pathParameters.id }
                , done);
            break;

        case 'PUT':
            putHandler(event, done);
            break;
        
        case 'POST':
            postHandler(event, done);

        default:
            done(new Error(`Error : Unsupported method "${event.httpMethod}"`));
    }

    function deleteHandler(entry, callback) {

        if(entry.id && entry.flaggedBy) {
            console.log("Building query");
            let query = 'UPDATE entry SET flaggedBy=(SELECT id FROM users WHERE username=?) WHERE id=?;';
            console.log(
                connection.query(query,
                    [entry.flaggedBy, entry.id],
                    callback
                ).sql
            ); 
        } else {
            callback(new Error("Error : Missing both entryID and requestContext.user. At least both values are required."));
        }
    }

    function getHandler(entry, callback) {
        
        new Promise((resolve, reject) => 
            console.log(connection.query(
                    'SELECT * FROM entry WHERE id=? AND flaggedBy IS NULL', 
                    entry.id, 
                    (error, result) => {
                        if(error) reject(error);
                        return resolve(result[0]);
                    }
            ).sql)
        ).then(entryIdToType)
        .then(entry => {
                
            return new Promise((resolve, reject) =>
                console.log(connection.query(
                        'SELECT * FROM entry WHERE parentID=? AND flaggedBy IS NULL',
                        entry.id,
                        (error, comments) => {
                            if(error) reject(error);
                            entry.comments = comments;
                            return resolve(entry);
                        }
                ).sql)
            )
        }).then(entry =>

            Promise.all(entry.comments.map(entryIdToType)
            ).then(comments => {
                entry.comments = comments;
                return entry;
            })
        ).then(entry => callback(null, entry))
        .catch(error => callback(error))
    
        function entryIdToType(entry) {
            
            return new Promise((resolve, reject) =>        
                console.log(connection.query(
                        'SELECT name FROM entryType WHERE id=?;', 
                        entry.entryType, 
                        (error, entryType) => {
                            if(error) reject(error);
                            entry.entryType = entryType[0].name;
                            return resolve(entry);
                        }
                ).sql)
            )
        }
    };

    function putHandler(event, callback) {
     
        let query = 'UPDATE entry SET ?'
                + mysql.format(' WHERE id=?;', event.pathParameters.id);
        console.log(
            connection.query(
                query, 
                event.body, 
                (error, result) => callback(error, result)
        ).sql);
    }
    function postHandler(event, callback){
        
    }
}