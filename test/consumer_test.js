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
    it('should get the consumers after adding 1 consumer',function (done) {
        nock(config.FORM_RESPONSE_BASE_URL).get('/form/api/myforms')
        .reply(HttpStatus.OK,bodyObj.myForms);
        request(server)
        .get('/form/api/get/consumers?formId='+bodyObj.consumerSchema.formId) 
        .set('access-token','token')
        .set('accept','application/json')
        .expect(HttpStatus.OK)
        .end(function (err,res) {
            should.not.exist(err);
            res.body.should.have.keys('consumerList');
            res.body.consumerList.should.be.an.Array();
            res.body.consumerList.length.should.be.eql(1);
            done();
        })
    })
    it('should update/add the consumer google-calendar as template is provided',function (done) {
        nock(config.FORM_RESPONSE_BASE_URL).get('/form/api/myforms')
        .reply(HttpStatus.OK,bodyObj.myForms);
        request(server)
        .put('/form/api/update/consumers')
        .send(bodyObj.googleCalendarConsumer)
        .set('access-token','token')
        .set('accept','application/json')
        .expect(HttpStatus.OK)
        .end(function (err,res) {
            should.not.exist(err);
            done();
        })
    })
    it('should get the consumers after adding google-calendar',function (done) {
        nock(config.FORM_RESPONSE_BASE_URL).get('/form/api/myforms')
        .reply(HttpStatus.OK,bodyObj.myForms);
        request(server)
        .get('/form/api/get/consumers?formId='+bodyObj.consumerSchema.formId) 
        .set('access-token','token')
        .set('accept','application/json')
        .expect(HttpStatus.OK)
        .end(function (err,res) {
            should.not.exist(err);
            res.body.should.have.keys('consumerList');
            res.body.consumerList.should.be.an.Array();
            res.body.consumerList.length.should.be.eql(2);
            done();
        })
    })
    it('should not update/add the consumer google-calendar as template not provided',function (done) {
        nock(config.FORM_RESPONSE_BASE_URL).get('/form/api/myforms')
        .reply(HttpStatus.OK,bodyObj.myForms);
        request(server)
        .put('/form/api/update/consumers')
        .send(bodyObj.consumerSchemaCalendar)
        .set('access-token','token')
        .set('accept','application/json')
        .expect(HttpStatus.BAD_REQUEST)
        .end(function (err,res) {
            should.not.exist(err);
            done();
        })
    })
    it('should not update/add the consumer google-calendar as start_date_time not provided',function (done) {
        nock(config.FORM_RESPONSE_BASE_URL).get('/form/api/myforms')
        .reply(HttpStatus.OK,bodyObj.myForms);
        request(server)
        .put('/form/api/update/consumers')
        .send(bodyObj.googleCalNotDateTime)
        .set('access-token','token')
        .set('accept','application/json')
        .expect(HttpStatus.BAD_REQUEST)
        .end(function (err,res) {
            should.not.exist(err);
            done();
        })
    })
    it('should not update/add the consumer when that consumer not exists',function (done) {
        nock(config.FORM_RESPONSE_BASE_URL).get('/form/api/myforms')
        .reply(HttpStatus.OK,bodyObj.myForms);
        request(server)
        .put('/form/api/update/consumers')
        .send(bodyObj.fakeConsumer)
        .set('access-token','token')
        .set('accept','application/json')
        .expect(HttpStatus.BAD_REQUEST)
        .end(function (err,res) {
            should.not.exist(err);
            done();
        })
    })
    it('should remove the consumer added above',function (done) {
        nock(config.FORM_RESPONSE_BASE_URL).get('/form/api/myforms')
        .reply(HttpStatus.OK,bodyObj.myForms);
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
    it('should get the consumers all the consumers with static info',function (done) {
        request(server)
        .get('/form/api/get/all/consumers?tags=sheet') 
        .set('access-token','token')
        .set('accept','application/json')
        .expect(HttpStatus.OK)
        .end(function (err,res) {
            should.not.exist(err);
            res.body.consumerList.should.be.an.Array();
            res.body.consumerList[0].should.have.keys('logo','queue','description','display_name','params','actions');
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
