'use strict';
console.log('Loading commentsRequest.handler');
/*
	Lambda Function for commentsRequest in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Mar 14, 2017
    Date last modified Mar 18, 2017
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

    console.log('Received event:', JSON.stringify(event, null, 2));
    if(event.httpMethod === 'GET') {
        
        const query = "SELECT * FROM entry WHERE parentID=? AND entryType=(SELECT id FROM entryType WHERE name='comment') AND flaggedBy IS NULL;"
        console.log( 
            connection.query(
                query,
                event.pathParameters.id,
                (error, result) => done(error, result)
            ).sql
        );
    } else if(event.httpMethod === 'POST'){
            const entry = event.body;
            const author = mysql.format(
                    ", `author`=(SELECT id FROM users WHERE username=?)"
                    + ", entryType=(SELECT id FROM entryType WHERE name='comment');", 
                    event.requestContext.user)
            entry.parentID = event.pathParameters.id;

            console.log( 
                connection.query(
                    "INSERT INTO entry SET ?" + author,
                    entry,
                    (error, result) => done(error, result)
                ).sql
            );
    } else {
        done(new Error(`Error : Unsupported method "${event.httpMethod}"`));
    }
}