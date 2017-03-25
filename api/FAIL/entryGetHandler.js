'use strict';
/*
	Lambda Function for entryRequestHandler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Feb 2, 2017
    Date last modified Mar 12, 2017
*/

console.log('Loading entryGetHandler');

const mysql = require('mysql');

// Returns JSON object of requested entry.
exports.handler = (event, context, callback) => {

	console.log('Received event : ', JSON.stringify(event, null, 2));
	
	const connection = mysql.createConnection( {
            host     : context.host,
            user     : context.user,
            password : context.password,
            database : context.database,
            port     : context.port
        }
	);
	
	const done = (error, response) => {
        
        connection.end();
        if(error) {
            console.log(JSON.stringify(error));
            callback(error);
        } else {
            console.log(JSON.stringify(response, null, 2));
            callback(null, response);
        } 
    };

	

	new Promise((resolve, reject) => {

		let query = 'SELECT * FROM entry ';
		
		if(Object.keys(event.queryParams).length) {
			const params = Object.keys(event.queryParams);
			query += 'WHERE ';
			params.forEach(param => {
				query += "??=? AND";
				query = mysql.format(query, [param, event.queryParams[param]]);
			});
			query = query.substring(0,query.length-3);
		}

		console.log(
			connection.query(query, (error, entries) => {
				
				if(error) reject(error);
				return resolve(entries);
			}).sql
		)
	}).then(entries => {

		return new Promise((resolve, reject) => {
			
			console.log(
				connection.query(
					'SELECT * FROM entryType;',
					(error, entryTypes) => {

						if(error) reject(error);
						entries.forEach(entry => {
							
							entryTypes.forEach(entryType => {
								if(entry.entryType === entryType.id) {
									entry.entryType = entryType.name;
								}
							});
						});
						return resolve(entries);
					}
				).sql
			)
		})
	}).then(entries => {

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
			);
		}));
	}).then(entries => done(null, entries))
	.catch(error => done(error));
};