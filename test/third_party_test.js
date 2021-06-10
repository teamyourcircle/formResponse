const express = require('express');
const server = require('../index');
const router = express.Router();
const fetch = require('node-fetch');
const request = require('supertest');
const HttpStatus = require('http-status-codes');
const env = process.env.NODE_ENV || 'test';
const config = require('../config/config')[env];
const sinon = require('sinon');
const apiUtils = require('../util/apiUtils');
const globalConstant = require('../util/globalConstant');
const logger = require('../util/logger');
const bodyObj = require('./resources/body_obj');
const nock = require('nock');
const oauth_sheet_helper = require('../util/oauth_sheet_helper');


describe('test for third party create sheet', (done) => {
  afterEach(function () {
    sinon.restore();
  });
  logger.debug('testing third party for already created sheet');
  let token = 'access-token';
  let requestBody = bodyObj.createSheetBody
  let status=HttpStatus.NOT_FOUND;
  const queryString = `?integration_id=${globalConstant.INTEGRATION_ID}&supportive_email=${requestBody.supportive_email}`;
  logger.debug('intermediate api requests nocked');
  it('should create new sheet', function(done) {
    nock(config.FORM_RESPONSE_BASE_URL).get('/form/api/myforms')
    .reply(HttpStatus.OK,bodyObj.myForms);
    nock(config.AUTH_SERVICE_BASE_URL).get(`/auth/api/user/oauthApps/byIntegrationId${queryString}`)
    .reply(HttpStatus.OK,bodyObj.integrationList);
    nock(config.FORM_RESPONSE_BASE_URL).get(`/form/api/get/responses?formId=${requestBody.formId}`)
    .reply(HttpStatus.OK,{'responseArray':bodyObj.formResponseArray});
    nock(config.AUTH_SERVICE_BASE_URL).get('/auth/api/user/oauthApps')
    .reply(HttpStatus.OK,bodyObj.integrationList);
    status=HttpStatus.OK;
    var stub2 = sinon.stub(oauth_sheet_helper,"sheetCreator");
    stub2.withArgs(requestBody,bodyObj.formResponseArray,{});
    stub2.returns({status,'data':bodyObj.googleSheetResponse})
    request(server)
    .post('/form/api/oauth/createSheets')
    .send(requestBody)
    .set('access-token',token)
    .set('accept','application/json')
    .expect(HttpStatus.OK)
    .end(function(err, res) {
      should.not.exist(err)
      res.body.should.have.keys('data','status');
      res.body.should.have.value('data',bodyObj.googleSheetResponse);
      done();
    })
  });
  it('should already created sheet', function(done) {
    status=HttpStatus.OK;
    nock(config.FORM_RESPONSE_BASE_URL).get('/form/api/myforms')
    .reply(HttpStatus.OK,bodyObj.myForms);
    nock(config.AUTH_SERVICE_BASE_URL).get(`/auth/api/user/oauthApps/byIntegrationId${queryString}`)
    .reply(HttpStatus.OK,bodyObj.integrationList);
    nock(config.FORM_RESPONSE_BASE_URL).get(`/form/api/get/responses?formId=${requestBody.formId}`)
    .reply(HttpStatus.OK,{'responseArray':bodyObj.formResponseArray});
    nock(config.AUTH_SERVICE_BASE_URL).get('/auth/api/user/oauthApps')
    .reply(HttpStatus.OK,bodyObj.integrationList);
    request(server)
    .post('/form/api/oauth/createSheets')
    .send(requestBody)
    .set('access-token',token)
    .set('accept','application/json')
    .expect(HttpStatus.OK)
    .end(function(err, res) {
      logger.debug('sheet already found');
      should.exists(err)
      res.body.should.have.keys('message','error');
      done();
    })
  });
})
