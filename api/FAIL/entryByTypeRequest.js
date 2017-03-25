'use strict';
console.log('Loading entryByTypeRequest.handler');
/*
	Lambda Function for entryByTypeRequest.handler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Mar 17, 2017
    Date last modified Mar 17, 2017
*/
const mysql = require('mysql');

exports.handler = (event, context, callback) => {

    console.log('Received event :', JSON.stringify(event, null, 2));

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

    let query = "SELECT * FROM entry WHERE ";
    const resources = event.resource.split("/").filter(Boolean);
    if(resources[0] == "entry") resources.shift();
    if(event.queryParams) {
        Object.keys(event.queryParams).map(key => {
            if(event.queryParams[key] 
                    && key.toLowerCase() != "limit") {
                query += "??=? AND ";
                query = mysql.format(query, [key, event.queryParams[key]]);
            }
        });
    }
    resources.forEach(resource => {
        if(resource != "recent" && isNaN(resource)) {
            if(resource.endsWith("s")) {
                resource = resource.substring(0,resource.length-1);
            }
            query += "entryType=(SELECT id FROM entryType WHERE name=?) ";
            query = mysql.format(query, resource);
        }
    })    
    query += "AND flaggedBy IS NULL ";
    
    query += resources.includes("recent") ? "ORDER BY dateCreated ASC " : "";
    if(event.queryParams) {
        if(event.queryParams.limit) {
            query = mysql.format(
                query + "LIMIT " + (event.queryStringParameters.limit.includes(",") ? "?,? " : "? "),
                event.queryStringParameters.limit
            );
        }
    } else {
        query += "LIMIT 100;"
    }
    new Promise((resolve, reject) => 

        console.log(
            connection.query(
                query,  
                (error, entries) => {
                
                    if(error) reject(error);
                    if(!entries.length)
                        reject(new Error("Error : No entries found!"));
                    return resolve(entries);
                }
            ).sql
        )
    ).then(entries => {
        
        return Promise.all(entries.map(entry => {
            
            return new Promise((resolve, reject) => 

                console.log(
                    connection.query(
                        'SELECT id FROM entry WHERE parentID=?',
                        entry.id,
                        (error, comments) => {

                            if(error) reject(error);
                            entry.comments = comments.map(comment => { return comment.id });
                            return resolve(entry);
                        }
                    ).sql
                )
            )
        }));
    }).then(entries => done(null, entries))
    .catch(error => done(error))
}