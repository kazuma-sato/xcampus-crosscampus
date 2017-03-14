'use strict';
/*
	Lambda Function for ratingRequest.handler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Mar 14, 2017
    Date last modified: Mar 14, 2017
*/

console.log('Loading ratingRequest.handler');

const mysql = require('mysql');

exports.handler = (event, context, callback) => {
    
    console.log('Received event:', JSON.stringify(event, null, 2));

	const connection = mysql.createConnection({
			host     : 'db.crosscampus.xcamp.us',
			user     : 'root',
			password : 'GBCxcamp',
			database : 'crosscampus',
			port     : '3306',
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

    switch (event.httpMethod) {

        case 'DELETE':
            const headers = 
            deleteHandler(
                JSON.parse(event.body), 
                done);
            break;

        case 'GET':
            getHandler(event.queryStringParameters, done);
            break;

        case 'POST':
            console.log(
                connection.query(
                    'INSERT INTO rating SET ?;',
                    JSON.parse(event.body),
                    (error, result) => error ? done(error) : done(null, result)
                ).sql
            );
            break;
            
        default:
            done(new Error(`Error : Unsupported method "${event.httpMethod}"`));
    }

    function deleteHandler(rating, done) {
        
        if(!rating) {
            done(new Error("Error : Missing both entryID and userID. At least 1 value is required."));
        } else {
            let query = 'DELETE FROM rating WHERE';
            const param = [];

            if(rating.entryID !== undefined) {
                query += " entryID=?";
                param.push(rating.entryID);
                if(rating.userID !== undefined) {
                    query += " AND";
                }
            }
            if(rating.userID !== undefined) {
                query += " userID=?";
                param.push(rating.userID);
            }
            if(param.length) {
                console.log(
                    connection.query(
                        query,
                        param,
                        (error, result) => error ? done(error) : done(null, result)
                    ).sql
                );
            }
        }
    }

    function getHandler(rating, done) {
        
        let query = 'SELECT * FROM rating';
        
        if(!rating) {
            console.log(
                connection.query(
                    query,
                    (error, result) => error ? done(error) : done(null, result)
                ).sql
            );
        } else {
            const param = [];
            
            query += " WHERE"
    
            if(rating.entryID !== undefined) {
                query += " entryID=?";
                param.push(rating.entryID);
                if(rating.userID !== undefined) {
                    query += " AND";
                }
            }
            if(rating.userID !== undefined) {
                query += " userID=?";
                param.push(rating.userID);
            }
            console.log( 
                connection.query(
                    query,
                    param,
                    (error, result) => { 
                        error ? done(error) : done(null, result);
                    }
                ).sql
            );
        } 
    }
};