/* eslint-disable no-undef */
const server = require('../api');
const should = require('should');
const request = require('supertest');
const HttpStatus = require('http-status-codes');

describe('test the health of app', function () {
    it('check health at /health GET',function (done){
        request(server)
        .get('/form/api/health')
        .expect(HttpStatus.OK)
        // eslint-disable-next-line no-unused-vars
        .end(function(err, res) {
            should.not.exist(err);
            done();
        });
    })
})


