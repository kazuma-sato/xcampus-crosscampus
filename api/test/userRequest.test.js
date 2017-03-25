/*
	Unit testing for /user Resource in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Mar 14, 2017
    Date last modified Mar 17, 2017
*/
console.log("Loading tests for /user resource for xcampus API...\n");
console.log("\tTest type: " + process.env.FILTER +
            "\tUsing " + process.env.MYSQL_DATABASE + " ON " +
            process.env.MYSQL_HOST + " AS " + process.env.MYSQL_USER);

const assert = require('chai').assert;
const mysql = require('mysql');
const http = require('http');

const userRequest = require('../Users/userRequest');
const httpEvent = require('./httpEvent');
const entry = require('./entry1');
httpEvent.stageVariables = {
    host     : process.env.MYSQL_HOST,
    user     : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DATABASE,
    port     : process.env.MYSQL_PORT
};
        //     host     : 'localhost',
        //     user     : 'root',
        //     password : 'root',
        //     database : 'crosscampus',
        //     port     : '3306'
        // }
		// 	host     : 'db.crosscampus.xcamp.us',
		// 	user     : 'root',
		// 	password : 'GBCxcamp',
		// 	database : 'crosscampus',
		// 	port     : '3306',
		// }

describe('Users / ', function() {
    beforeEach(function() {
        httpEvent.resource = "/user";
        httpEvent.queryParams = null;
        context.succeed = null;
    });
    describe('POST method with valid request', function(){
        describe('with no parameters', function(){
            it('should return a status code 400', function(done) {

                httpEvent.httpMethod = "GET";
                httpEvent.resource = "/user";
                context.succeed = function(response) {

                    console.log(JSON.stringify(response,null,2))
                    assert.equal(response.statusCode, 400,
                        'an error message is expected.');
                    done();
                }
                userRequest.handler(httpEvent, context);
            });
        });
    });
    describe('GET method with valid request', function() {
        describe('with no parameters', function() {
            it('should return an array of users objects', function(done) {

                httpEvent.httpMethod = "GET";
                httpEvent.resource = "/user";
                context.succeed = function(response) {

                    console.log(JSON.stringify(response,null,2))
                    assert.equal(response.statusCode, 200,
                        "Expecting JSON of entry requested in body of HTTP Response");
                    done();
                }
                userRequest.handler(httpEvent, context);
            });
        });
    });
    describe('{username} / ', function() {
        describe('GET method with valid request', function() {
            describe('with only a path parameter', function() {
                it('should return a single user JSON object with entries nested', function(done) {

                    httpEvent.httpMethod = "GET";
                    httpEvent.resource = "/user/{username}";
                    httpEvent.pathParameters = { username : 'testy-mctesty' }
                    context.succeed = function(response) {

                        console.log(JSON.stringify(response,null,2))
                        assert.equal(response.statusCode, 200,
                            "Expecting JSON of entry requested in body of HTTP Response");
                        done();
                    }
                    userRequest.handler(httpEvent, context);
                });
            });
        });
        describe('Entry / ', function() {
            describe('GET method with valid request', function() {
                describe('with only a path parameter', function() {
                    it.only('should return an array of entry JSON objects with all of a users entries', function(done) {

                        httpEvent.httpMethod = "GET";
                        httpEvent.resource = "/user/{username}/entry";
                        httpEvent.pathParameters = { username : 'testy-mctesty' }
                        context.succeed = function(response) {

                            response.body = JSON.parse(response.body);
                            console.log("Testing :\n\tResponse response recieved :\n" +
                                        JSON.stringify(response,null,2))
                            assert.equal(response.statusCode, 200,
                                "Expecting JSON of entry requested in body of HTTP Response");
                            done();
                        }
                        userRequest.handler(httpEvent, context);
                    });
                });
            });
        });
        describe('favourite / ', function() {
            describe('GET method with valid request', function() {
                describe('with only a path parameter', function() {
                    it('should return an array of entry JSON objects with all of a users entries', function(done) {

                        httpEvent.httpMethod = "GET";
                        httpEvent.resource = "/user/{username}/favourite";
                        httpEvent.pathParameters = { username : 'testy-mctesty' }
                        context.succeed = function(response) {

                            response.body = JSON.parse(response.body);
                            console.log("Testing :\n\tResponse response recieved :\n" +
                                        JSON.stringify(response,null,2))
                            assert.equal(response.statusCode, 200,
                                "Expecting JSON of entry requested in body of HTTP Response");
                            done();
                        }
                        userRequest.handler(httpEvent, context);
                    });
                });
            });
        });
        describe('notification / ', function() {
            describe('GET method with valid request', function() {
                describe('with only a path parameter', function() {
                    it('should return an array of entry JSON objects with all of a users entries', function(done) {

                        httpEvent.httpMethod = "GET";
                        httpEvent.resource = "/user/{username}/notification";
                        httpEvent.pathParameters = { username : 'testy-mctesty' }
                        context.succeed = function(response) {

                            response.body = JSON.parse(response.body);
                            console.log("Testing :\n\tResponse response recieved :\n" +
                                        JSON.stringify(response,null,2))
                            assert.equal(response.statusCode, 200,
                                "Expecting JSON of entry requested in body of HTTP Response");
                            done();
                        }
                        userRequest.handler(httpEvent, context);
                    });
                });
            });
        });
        describe('rating / ', function() {
            describe('GET method with valid request', function() {
                describe('with only a path parameter', function() {
                    it('should return an array of entry JSON objects with all of a users entries', function(done) {

                        httpEvent.httpMethod = "GET";
                        httpEvent.resource = "/user/{username}/rating";
                        httpEvent.pathParameters = { username : 'tester-testserson' }
                        context.succeed = function(response) {

                            response.body = JSON.parse(response.body);
                            console.log("Testing :\n\tResponse response recieved :\n" +
                                        JSON.stringify(response,null,2))
                            assert.equal(response.statusCode, 200,
                                "Expecting JSON of entry requested in body of HTTP Response");
                            done();
                        }
                        userRequest.handler(httpEvent, context);
                    });
                });
            });
        });
    });
});
