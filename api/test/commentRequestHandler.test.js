/*
	Unit Test for commentRequestHandler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Feb 2, 2017
    Date last modified Feb 22, 2017
*/
'use strict';

let expect = require('chai').expect;
let lambdaTester = require('lambda-tester');
let handlerLambda = require('../Entries/Comments/commentRequestHandler');

let getRequests = ['{"key1":{"entryId":4}}',
                 '{"key1":{"entryId":3}}'];

describe('Entries', function() {
    describe('Comments', function() {
        describe('commentRequestHandler()', function() {
            it('should generate select query from JSON object from GET request' +
                    ' and return JSON object of comment entry'), function() {
                getRequests.forEach(function(getRequest) {
                    it('successful query result for ' + JSON.parse(getRequest).key1.entryId), 
                        function(done) {
                            lambdaTester(handlerLambda.commentRequestHandler)
                            .event(getRequest)
                            .expectSucceed(function(result){
                                expect(result.valid).to.be.true;
                            })
                            .verify(done);
                        }
                })
            }
        })
    })
});
