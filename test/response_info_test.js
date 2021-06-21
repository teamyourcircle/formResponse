/* eslint-disable no-undef */
const server = require('../index');
const request = require('supertest');
const HttpStatus = require('http-status-codes');
const nock = require('nock');
const bodyObj = require('./resources/body_obj');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const globalConstant = require('../util/globalConstant');
const logger = require('../util/logger');

describe('test the response flow get|delete',function () {
    let token = 'host token';
    let key='fake key';
    let responseID;
    before((done)=>{
        nock(config.FORM_RESPONSE_BASE_URL).get(`/form/api/get/consumers?formId=${bodyObj.consumerResponse_1.formId}`)
        .reply(HttpStatus.OK,bodyObj.consumerResponse_1);
        nock(config.FORM_SERVICE_BASE_URL).get(`/forms/form_info/${bodyObj.formResponse_1.form_id}`)
        .reply(HttpStatus.OK,bodyObj.newformTemplate);
        logger.debug('create a response');
        request(server)
        .post('/api/submit/response')
        .send(bodyObj.formResponse_1)
        .set('access-token','token')
        .set('accept','application/json')
        .expect(HttpStatus.OK)
        .end(function (err,res) {
            should.not.exist(err);
            responseID = res.body[globalConstant.UNDERSCORE_ID];
            logger.debug('response created with responseId '+responseID);
            res.body.should.have.keys('formId','responseBy','sections');
            done();
        })
    })

    it('should get the response by resposneId added above',function (done) {
        nock(config.FORM_RESPONSE_BASE_URL).get('/form/api/myforms')
        .reply(HttpStatus.OK,bodyObj.myForms);
        request(server)
        .get(`/form/api/get/response/${responseID}?formId=${bodyObj.consumerResponse_1.formId}`)
        .set('access-token',token)
        .set('accept','application/json')
        .expect(HttpStatus.OK)
        .end(function (err,res) {
            should.not.exist(err);
            res.body.should.have.keys('response');
            done();
        })
    })

    it('should get the response by resposneId added above',function (done) {
        nock(config.FORM_RESPONSE_BASE_URL).get('/form/api/myforms')
        .reply(HttpStatus.OK,bodyObj.myForms);
        request(server)
        .get(`/form/api/get/response/${responseID}?formId=${bodyObj.consumerResponse_1.formId}`)
        .set('api-key','api')
        .set('accept','application/json')
        .expect(HttpStatus.OK)
        .end(function (err,res) {
            should.not.exist(err);
            res.body.should.have.keys('response');
            done();
        })
    })
    
    it('should get the responses by formId (using access token) added above',function (done) {
        nock(config.FORM_RESPONSE_BASE_URL).get('/form/api/myforms')
        .reply(HttpStatus.OK,bodyObj.myForms);
        nock(config.FORM_SERVICE_BASE_URL).get(`/forms/form_info/${bodyObj.consumerResponse_1.formId}`)
        .reply(HttpStatus.OK,bodyObj.formTemplate);
        request(server)
        .get(`/form/api/get/responses?formId=${bodyObj.consumerResponse_1.formId}`)
        .set('access-token',token)
        .set('accept','application/json')
        .expect(HttpStatus.OK)
        .end(function (err,res) {
            should.not.exist(err);
            res.body.should.have.keys('responseArray');
            res.body['responseArray'].length.should.be.eql(1);
            done();
        })
    })

    it('should get the responses by formId (using api key)',(done)=>{
        nock(config.FORM_RESPONSE_BASE_URL).get('/form/api/myforms')
        .reply(HttpStatus.OK,bodyObj.myForms);
        nock(config.FORM_SERVICE_BASE_URL).get(`/forms/form_info/${bodyObj.consumerResponse_1.formId}`)
        .reply(HttpStatus.OK,bodyObj.formTemplate);
        request(server)
        .get(`/form/api/get/responses?formId=${bodyObj.consumerResponse_1.formId}`)
        .set('api-key',key)
        .set('accept','application/json')
        .expect(HttpStatus.OK)
        .end(function (err,res) {
            should.not.exist(err);
            res.body.should.have.keys('responseArray');
            res.body['responseArray'].length.should.be.eql(1);
            done();
        })
        
    })

    it('should delete the response by resposneId added above',function (done) {
        nock(config.FORM_RESPONSE_BASE_URL).get('/form/api/myforms')
        .reply(HttpStatus.OK,bodyObj.myForms);
        request(server)
        .delete(`/form/api/delete/response`)
        .send({
            response_id: responseID,
            formId: bodyObj.consumerResponse_1.formId
        })
        .set('access-token',token)
        .set('accept','application/json')
        .expect(HttpStatus.OK)
        .end(function (err,res) {
            should.not.exist(err);
            res.body.should.have.keys('msg','statusCode');           
            done();
        })
    })

    it('should delete the response by resposneId added above',function (done) {
        nock(config.FORM_RESPONSE_BASE_URL).get('/form/api/myforms')
        .reply(HttpStatus.OK,bodyObj.myForms);
        request(server)
        .delete(`/form/api/delete/response`)
        .send({
            response_id: responseID,
            formId: bodyObj.consumerResponse_1.formId
        })
        .set('api-key','api')
        .set('accept','application/json')
        .expect(HttpStatus.OK)
        .end(function (err,res) {
            should.not.exist(err);
            res.body.should.have.keys('msg','statusCode');           
            done();
        })
    })
})
