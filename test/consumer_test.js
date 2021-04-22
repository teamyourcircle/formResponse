/* eslint-disable no-undef */
const server = require('../api');
const request = require('supertest');
const HttpStatus = require('http-status-codes');
const nock = require('nock');
const bodyObj = require('./resources/body_obj');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const globalConstant = require('../util/globalConstant');
const logger = require('../util/logger');
const apiUtils = require('../util/apiUtils');

describe('test for adding consumers',function () {
    it('should update/add the consumer',function (done) {
        nock(config.FORM_RESPONSE_BASE_URL).get('/form/api/myforms')
        .reply(HttpStatus.OK,bodyObj.myForms);
        nock(config.FORM_RESPONSE_BASE_URL).get(`/form/api/get/consumers?formId=${bodyObj.consumerSchema.formId}`)
        .reply(HttpStatus.OK,bodyObj.consumerResponse);
        request(server)
        .put('/form/api/update/consumers')
        .send(bodyObj.consumerSchema)
        .set('access-token','token')
        .set('accept','application/json')
        .expect(HttpStatus.OK)
        .end(function (err,res) {
            should.not.exist(err);
            done();
        })
    })
    it('should remove the consumer added above',function (done) {
        nock(config.FORM_RESPONSE_BASE_URL).get('/form/api/myforms')
        .reply(HttpStatus.OK,bodyObj.myForms);
        nock(config.FORM_RESPONSE_BASE_URL).get(`/form/api/get/consumers?formId=${bodyObj.consumerSchema.formId}`)
        request(server)
        .delete('/form/api/remove/consumers') 
        .send(bodyObj.consumerSchema)
        .set('access-token','token')
        .set('accept','application/json')
        .expect(HttpStatus.OK)
        .end(function (err,res) {
            should.not.exist(err);
            done();
        })
    })
    it('should get the consumers with empty queueName',function (done) {
        nock(config.FORM_RESPONSE_BASE_URL).get('/form/api/myforms')
        .reply(HttpStatus.OK,bodyObj.myForms);
        nock(config.FORM_RESPONSE_BASE_URL).get(`/form/api/get/consumers?formId=${bodyObj.consumerSchema.formId}`)
        request(server)
        .get('/form/api/get/consumers?formId='+bodyObj.consumerSchema.formId) 
        .set('access-token','token')
        .set('accept','application/json')
        .expect(HttpStatus.OK)
        .end(function (err,res) {
            should.not.exist(err);
            res.body.should.have.keys('formId','queueName');
            res.body[globalConstant.QUEUE_SCHEMA].should.be.an.Array();
            res.body[globalConstant.QUEUE_SCHEMA].length.should.be.eql(0);
            done();
        })
    })
    after(done => {
        logger.debug('clean the db');
        apiUtils.deleteConsumer(bodyObj.consumerSchema.formId)
        .then(()=>{
            done();
        })
        .catch(err => {
            logger.error(`not able to clean db due to ${err}`);
            done(err);
        })
    })
})
