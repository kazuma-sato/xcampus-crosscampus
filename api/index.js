const http = require('http');
const url = require('url');
const queryString = require('querystring');
const mysql = require('mysql');
const entryRequest = require("./Entries/entryRequest");
const userRequest = require("./Users/userRequest");

const port = process.env.NODEJS_PORT || 3000;
const mysqlConnection = {
    host     : process.env.MYSQL_HOST,
    user     : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DATABASE,
    port     : process.env.MYSQL_PORT
}


const server = http.createServer((request, response) => {

        console.log("Server Started.")

        const connection = mysql.createConnection(mysqlConnection);
        const context = {};
        const event = {
            httpMethod              : request.method,
            headers                 : request.headers,
            trailers                : request.rawTrailers,
            url                     : request.url,
            queryStringParameters   : queryString.parse(request.url.split("?")[1]),
            resource                : request.url.split("?")[0],
            body                    : ""
        }
        if(!event.http == "GET") {
            const body = [];
            request.on('data', chunk => 
                body.push(chunk)
            ).on('end', () => {
                body = Buffer.concat(body).toString();
            });
            event.body = request;
            console.log(event.body)
        }

        if(!event.requestContext){
            event.requestContext = {identity : {user: "testy-mctesty"}}
        }
        context.succeed = (contextResponse) => {
            return new Promise((resolve, reject) => {

                contextResponse.body = JSON.parse(contextResponse.body);
                console.log("Server :\n\Response sent : " +
                    JSON.stringify(contextResponse, null, 2));
                return resolve(contextResponse);

            }).then(res => 
                response.end(JSON.stringify(res))
            ).catch(error => 
                response.on('error', (  
                    error => 
                        response.end(JSON.stringify(error))
                ))
            )
        }
        event.stageVariables = mysqlConnection;
        switch(event.resource) {
            case "entry" :
                entryRequest.handler(event,context);
                break;
            case "user" :
               userRequest.handler(event,context);
               break;
            default :
                console.log(
                    response.end(JSON.stringify({
                        statusCode : 404,
                        headers: {
                            "Content-Type" : "application/json"
                        },
                        method: request.method,
                        url: request.url,
                        body: request.body
                    }))
                );
        }
    }
).listen(port);