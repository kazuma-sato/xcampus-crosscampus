'use strict';
/*
	Lambda Function for recentEntriesRequest.handler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Mar 14, 2017
    Date last modified Mar 13, 2017
*/

console.log('Loading recentEntriesRequest.handler');

const mysql = require('mysql');

exports.handler = (event, context, callback) => {
    
    console.log('Received event:', JSON.stringify(event, null, 2));

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

    let query = 'SELECT * FROM entry WHERE';

    new Promise((resolve, reject) => {
        if(event.queryStringParameters.entryType) {
            console.log(
                connection.query(
                    "SELECT id FROM entryType WHERE name=?)" + ("OR name=? ".repeat(entryTypes.length-1)) + ");",
                    (error,result) => {
                        if(error) return reject(error);
                        if(!result.length) return reject(new Error("Error: Invalid entryType."));
                        let entryTypeClause = " entryType = " 
                                + result.forEach(row => { 
                                    return row.id + " OR entryType = ";
                                });
                        resolve(
                            entryTypeClause
                                .substring(0,entryTypeClause.length-15)
                        );   
                    }
                ).sql
            );
        } else {
            return resolve(" ");
        }
    }).then(entryTypeQueryString => {

            return new Promise((resolve, reject) => {

                query += entryTypeQueryString + "LIMIT ";
                if(event.queryStringParameters.limit) {
                    query = mysql.format(
                        query + (event.queryStringParameters.limit.includes(",") ? "?,? " : "? "),
                        event.queryStringParameters.limit
                    );
                } else {
                    query += "20 ";
                }
                query += "ORDER BY dateCreated ASC"
                console.log(
                    connection.query(query,
                        (error,result) => {

                            if(error) return reject(error);
                            resolve(result);
                        }
                    ).sql
                );
            })
    }).then(
        entries => done(null, entries)
    ).catch(
        error => done(error)
    )
};