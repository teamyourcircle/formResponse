/* eslint-disable no-undef */
const server = require('../api');
const request = require('supertest');
const HttpStatus = require('http-status-codes');
const nock = require('nock');
const bodyObj = require('./resources/body_obj');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

describe('test the submission of response', function () {
    nock(config.AUTH_SERVICE_BASE_URL).get('/auth/api/dashboard')
    .reply(HttpStatus.OK,bodyObj.userInfo);
    it('should successfully submit the response', function(done){
        request(server)
        .post('/api/response')
        .send(bodyObj.formResponse)
        .set('access-token','token')
        .set('accept','application/json')
        .expect(HttpStatus.OK)
        .end(function (err,res) {
            res.body.should.have.keys('formId','responseBy','sections');
            done();
        })
    })
})