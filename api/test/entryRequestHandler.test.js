/*
	Unit Test for entryRequestHandler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Feb 22, 2017
    Date last modified Feb 22, 2017
*/
'use strict';

let expect = require('chai').expect;
let lambdaTester = require('lambda-tester');
let handlerLambda = require('../Entries/entryRequestHandler');

let getRequests = ['{"key1":{"id":1}}',
                 '{"key1":{"id":2}}'];

describe('Entries', function() {
    describe('entryRequestHandler()', function() {
        it('should generate select query from JSON object from GET request' +
                ' and return JSON object of entry'), function() {
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
});
