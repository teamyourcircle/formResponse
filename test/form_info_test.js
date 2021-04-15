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
const apiUtils = require('../util/apiUtils');

describe('test for forms related information',function () {
    let token = 'access-token';
    nock(config.FORM_SERVICE_BASE_URL).get(`/forms/user?token=${token}`)
    .reply(HttpStatus.OK,bodyObj.myFormsListFormService);
    it('should get myforms list',function (done) {
        request(server)
        .get('/form/api/myforms')
        .set('access-token',token)
        .set('accept','application/json')
        .expect(HttpStatus.OK)
        .end(function (err,res) {
            should.not.exist(err);
            res.body.should.have.keys('form');
            res.body['form'].length.should.be.eql(1);
            res.body['form'][0].should.have.keys('form_title','form_id','init','end');
            done();
        })
    })
})

describe('test for delete forms footprint',function (done) {
    let token = 'access-token';
    let body = {
        formId: 20
    }
    before((done)=>{
        logger.debug('create consumers and responses for formId : '+body.formId);
        nock(config.FORM_RESPONSE_BASE_URL).get('/form/api/myforms')
        .reply(HttpStatus.OK,bodyObj.myForms);
        nock(config.AUTH_SERVICE_BASE_URL).get('/auth/api/dashboard')
        .reply(HttpStatus.OK,bodyObj.userInfo);
        nock(config.FORM_RESPONSE_BASE_URL).get(`/form/api/get/consumers?formId=${body.formId}`)
        .reply(HttpStatus.OK,bodyObj.newconsumerResponse);
        request(server)
        .put('/form/api/update/consumers')
        .send(bodyObj.newconsumerSchema)
        .set('access-token',token)
        .set('accept','application/json')
        .expect(HttpStatus.OK)
        .end(function (err,res) {
            should.not.exist(err);
            logger.debug('consumers created');
            request(server)
            .post('/api/response')
            .send(bodyObj.newformResponse)
            .set('access-token','token')
            .set('accept','application/json')
            .expect(HttpStatus.OK)
            .end(function (err,res) {
                should.not.exist(err);
                logger.debug('response created');
                res.body.should.have.keys('formId','responseBy','sections');
                done();
            })
        })
    })
    it('should delete consumers+responses of deleted form',function (done) {
        nock(config.AUTH_SERVICE_BASE_URL).get('/auth/api/dashboard')
        .reply(HttpStatus.OK,bodyObj.userInfo);
        nock(config.FORM_SERVICE_BASE_URL).get(`/forms/delete/${body.formId}`)
        .reply(HttpStatus.OK,bodyObj.formTemplatedeleteRes);
        request(server)
        .delete('/form/api/forms/delete')
        .send(body)
        .set('access-token',token)
        .set('accept','application/json')
        .expect(HttpStatus.OK)
        .end(function (err,res) {
            should.not.exist(err);
            res.body.should.have.keys('msg','statusCode');
            done();
        })
    })
    
})