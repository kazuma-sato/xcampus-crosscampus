/*
	Unit testing for /entry Resource in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Mar 14, 2017
    Date last modified Mar 17, 2017
*/

const assert = require('chai').assert;
const mysql = require('mysql');

const entryRequest = require('../Entries/entryRequest');
const entryByIdRatingFavRequest = require('../Entries/FavouritesRatings/entryByIdRatingFavRequest');
const httpEvent = require('./httpEvent');
const entry = require('./entry1');
httpEvent.stageVariables = {
            host     : 'localhost',
            user     : 'root',
            password : 'root',
            database : 'crosscampus',
            port     : '3306'
        }
		// 	host     : 'db.crosscampus.xcamp.us',
		// 	user     : 'root',
		// 	password : 'GBCxcamp',
		// 	database : 'crosscampus',
		// 	port     : '3306',
		// }
        


describe('Entry / ', function() {
    beforeEach(function(){
        httpEvent.resource = "/entry";
        httpEvent.queryParams = null;
        context.succeed = null;
    });

    describe('GET method with valid request', function() {
        it('should return an entry object', function(done) {

            httpEvent.queryStringParameters = { id : 2 };
            httpEvent.httpMethod = "GET";
            httpEvent.resource = "/entry";
            context.succeed = response => {
                    
                    assert.equal(response.id, httpEvent.id,
                        "Expecting JSON of entry requested in body of HTTP Response");
                    done();
                }
            entryRequest.handler(
                httpEvent, context
            );
        });
    });
    describe('PUT method with valid request', function() {
        it('should return a JSON HTTP response object', function(done) {

            httpEvent.pathParameters = { id : 1 };
            httpEvent.requestContext.identity.user = "testy-mctesty"
            httpEvent.httpMethod = "PUT";
            httpEvent.resource = "/entry/{id}";
            httpEvent.body = JSON.stringify({
                description : "Unit testing FTW!"
            });
            context.succeed = response => {
                    assert.equal(1, JSON.parse(response.body).affectedRows, "1 row affected");
                    done()
                }
            entryRequest.handler(httpEvent, context);
        });
    });
    describe('POST method with valid request', function() {
        // it('should add 1 row', function(done) {
        //     httpEvent.httpMethod = "POST";
        //     httpEvent.resource = "/entry/{id}/comments";
        //     httpEvent.requestContext.identity.user = "testy-mctesty";
        //     httpEvent.pathParameters = { id : 2 };
        //     httpEvent.body = JSON.stringify({
        //         title : "Titles on comments are dumb!",
        //         description : "Unit testing FTW!"
        //     });
        //     context.succeed = response => {

        //             let body = JSON.parse(response.body);
        //             assert.equal(1, body.insertEntryResult.affectedRows, "1 Row added");
        //             done();
        //         };
        //     entryRequest.handler(httpEvent, context);
        // });
        it('should create a comment and make a notification', function(){
            httpEvent.httpMethod = "POST";
            httpEvent.resource = "/entry/{id}/comments";
            httpEvent.pathParameters = { id : 2 };
            httpEvent.requestContext.identity.user = "testy-mctesty";
            httpEvent.body = JSON.stringify({
                title : "Titles on comments are dumb!",
                description : "Unit testing FTW! WWOOOOWWWW~!!"
            });
            context.succeed = function(response) {
                assert.equal(response.statusCode, 200, "HTTP Response: 200");
                done();
            };
            entryRequest.handler(httpEvent, context);
        });
    });
    describe('Resource by ID / ', function() {
        describe('GET method with valid request', function() {
            it('should return a JSON HTTP response object', function(done) {

                httpEvent.pathParameters = { id : 2 };
                httpEvent.httpMethod = "GET";
                httpEvent.resource = "/entry/{id}";
                context.succeed = function(response){
                        assert.equal(response.statusCode, 200, "HTTP Response: 200");
                        assert.equal(
                            JSON.parse(response.body)[0].id, 
                            2,
                            "Expecting JSON of entry requested in body of HTTP Response");
                        done();
                    }
                entryRequest.handler(httpEvent,context);
            });
        });
        describe('PUT method with valid request', function() {
            it('should return a JSON HTTP response object', function(done) {
                httpEvent.pathParameters = { id : 1 };
                httpEvent.httpMethod = "PUT";
                httpEvent.body = JSON.stringify({
                    description : "Unit testing FTW!"
                });
                httpEvent.requestContext.identity.user = "testy-mctesty";
                context.succeed = response => {
                        assert.equal('200', response.statusCode, "HTTP Response: 200");
                       // assert.equal(1, JSON.parse(response.body).affectedRows, "1 row affected");
                        done();
                };
                entryRequest.handler(httpEvent, context);
            })
        });
        describe('DELETE method with valid request', function() {
            it('should return a JSON HTTP response object', function(done) {
                
                httpEvent.pathParameters = { id : 1 };
                httpEvent.httpMethod = "DELETE";
                httpEvent.requestContext.user = "testy-mctesty"
                context.succeed = response => {
                        assert.equal('200', response.statusCode, "HTTP Response: 200");
                        assert.equal(1, JSON.parse(response.body).affectedRows, "1 row affected");
                        done();
                }
                entryRequest.handler(httpEvent,context);
            })
        });
    });
    describe('Resource by Entry Type / ', function() {
        describe('GET method with valid request', function() {
            it.skip('should return a JSON HTTP response object', function(done) {
                
                httpEvent.httpMethod = "GET";
                httpEvent.resource = "/entry/ads";
                context.succeed = response => {

                        assert.equal("200", response.statusCode, "HTTP Response: 200");
                        assert.isArray(JSON.parse(response.body), "Should be an array.")
                        done();
                }
                entryRequest.handler(httpEvent, context);
            })
        })
    });
    describe('Comments / ', function() {
        describe('GET method with valid request', function() {
            it('should return a JSON HTTP response object', function(done) {

                httpEvent.pathParameters = { id : 2 };
                httpEvent.httpMethod = "GET";
                context.succeed = response => {
                        assert.equal("200", response.statusCode, "HTTP Response: 200");
                        done();
                    }
                entryRequest.handler(httpEvent, context, null);
            });
        });
        // describe('POST method with valid request', function() {
        //     it('should return a JSON HTTP response object', function(done) {
        //         httpEvent.resource = "/entry/{id}/comments";
        //         httpEvent.pathParameters = { id : 3 };
        //         httpEvent.requestContext.identity.user = "testy-mctesty"
        //         httpEvent.httpMethod = "POST";
        //         httpEvent.body = JSON.stringify({
        //             title : "Titles on comments are dumb!",
        //             description : "Unit Testing is the best!!"
        //         })
        //         context.succeed = response => {
        //                 assert.equal("200", response.statusCode, "HTTP Response: 200");
        //                 assert.equal(entry.desciption, response.body.desciption)
        //                 done();
        //         }
        //         entryRequest.handler(httpEvent, context, null);
        //     });
        // });
    });
    describe("Ratings / ", function() {
        describe('GET method with valid request', function(){
            it('should return a JSON HTTP response object', function(done){
                httpEvent.pathParameters = { id : 3 };
                httpEvent.httpMethod = "GET";
                httpEvent.resource = "/entry/{id}/rating";
                httpEvent.requestContext.identity.user = "testy-mctesty"
                context.succeed = (response) => {
                    const body = JSON.parse(response.body);

                    assert.equal(response.statusCode, 200);
                    done();
                }
                entryByIdRatingFavRequest.handler(httpEvent,context);
            });
        });
        describe('POST method with valid request', function(){
            it('should return a JSON HTTP response object', function(done){
                httpEvent.pathParameters = { id : 3 };
                httpEvent.requestContext.identity.user = "testy-mctesty"
                httpEvent.httpMethod = "POST";
                httpEvent.resource = "/entry/{id}/ratings";
                context.succeed = (response) => {

                    assert.equal(response.statusCode, 400);
                    done();
                }
                entryByIdRatingFavRequest.handler(httpEvent,context);
            });
        });
        describe('DELETE method with valid request', function(){
            it('should return a JSON HTTP response object', function(done){
                httpEvent.pathParameters = { id : 3 };
                httpEvent.requestContext.identity.user = "testy-mctesty"
                httpEvent.httpMethod = "DELETE";
                httpEvent.resource = "/entry/{id}/rating";
                context.succeed = (response) => {
                    const body = JSON.parse(response.body);
                    assert.equal(body.affectedRows, 1);
                    assert.equal(response.statusCode, 200)
                    done();
                }
                entryByIdRatingFavRequest.handler(httpEvent,context);
            });
        });
    });
    describe("Favourites / ", function() {
        describe('GET method with valid request', function(){
            it('should return a JSON HTTP response object', function(done){
                httpEvent.pathParameters = { id : 3 };
                httpEvent.httpMethod = "GET";
                httpEvent.resource = "/entry/{id}/favourites";
                httpEvent.requestContext.identity.user = "testy-mctesty"
                context.succeed = (response) => {
                    const body = JSON.parse(response.body);

                    assert.equal(response.statusCode, 200);
                    done();
                }
                entryByIdRatingFavRequest.handler(httpEvent,context);
            });
        });
        describe('POST method with valid request', function(){
            it('should return a JSON HTTP response object', function(done){
                httpEvent.pathParameters = { id : 3 };
                httpEvent.requestContext.user = "testy-mctesty"
                httpEvent.httpMethod = "POST";
                httpEvent.resource = "/entry/{id}/favourites";
                context.succeed = (response) => {

                    assert.equal(response.statusCode, 400);
                    done();
                }
                entryByIdRatingFavRequest.handler(httpEvent,context);
            });
        });
        describe('DELETE method with valid request', function(){
            it('should return a JSON HTTP response object', function(done){
                httpEvent.pathParameters = { id : 3 };
                httpEvent.requestContext.identity.user = "testy-mctesty"
                httpEvent.httpMethod = "DELETE";
                httpEvent.resource = "/entry/{id}/favourites";
                context.succeed = (response) => {
                    const body = JSON.parse(response.body);

                    assert.equal(body.affectedRows, 1);
                    assert.equal(response.statusCode, 200)
                    done();
                }
                entryByIdRatingFavRequest.handler(httpEvent,context);
            });
        });
    });
})