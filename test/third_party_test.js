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
    nock(config.AUTH_SERVICE_BASE_URL).get("/auth/api/oauth/credentials")
    .reply(HttpStatus.OK,bodyObj.credentialsBody);
    nock(config.FORM_RESPONSE_BASE_URL).get('/form/api/myforms')
    .reply(HttpStatus.OK,bodyObj.myForms);
    nock(config.AUTH_SERVICE_BASE_URL).get(`/auth/api/user/oauthApps/byIntegrationId${queryString}`)
    .reply(HttpStatus.OK,bodyObj.integartionListWithoutAdditionInfo);
    nock(config.FORM_RESPONSE_BASE_URL).get(`/form/api/get/responses?formId=${requestBody.formId}`)
    .reply(HttpStatus.OK,{'responseArray':bodyObj.formResponseArray});
    nock(config.AUTH_SERVICE_BASE_URL).get('/auth/api/user/oauthApps')
    .reply(HttpStatus.OK,bodyObj.integartionListWithoutAdditionInfo);
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
    nock(config.AUTH_SERVICE_BASE_URL).get("/auth/api/oauth/credentials")
    .reply(HttpStatus.OK,bodyObj.credentialsBody);
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
  it('should create new folder for DROPBOX', function(done){
    const reqBody={
      oauth_provider:globalConstant.DROP_BOX,
      integration_id:globalConstant.DROP_BOX,
      supportive_email:'hardik@mail.com',
    }
    nock(config.AUTH_SERVICE_BASE_URL).get("/auth/api/oauth/credentials")
    .reply(HttpStatus.OK,bodyObj.credentialsBody);
    nock(config.AUTH_SERVICE_BASE_URL,reqBody).put('/auth/api/refreshoauthAccess')
    .reply(HttpStatus.OK,bodyObj.dropboxIntegrationList);
    const stub = sinon.stub(apiUtils, "getDropboxOAuth")
    stub.resolves(bodyObj.folderIdResponse);
    request(server)
    .post('/form/api/oauth/createFolder')
    .send({ ...reqBody, path:'/test'})
    .set('access-token',token)
    .set('accept','application/json')
    .expect(HttpStatus.OK)
    .end(function(err, res) {
      should.not.exist(err);
      logger.debug('folder created for dropbox');
      res.body.should.have.keys('folder_id');
      done();
    })
  })
  it('should create new folder for GOOGLE-DRIVE', function(done){
    const reqBody={
      oauth_provider:globalConstant.GOOGLE,
      integration_id:globalConstant.GOOGLE_DRIVE,
      supportive_email:'hardik@mail.com',
    }
    nock(config.AUTH_SERVICE_BASE_URL).get("/auth/api/oauth/credentials")
    .reply(HttpStatus.OK,bodyObj.credentialsBody);
    const queryString = `?integration_id=${globalConstant.GOOGLE_DRIVE}&supportive_email=${reqBody.supportive_email}`;
    nock(config.AUTH_SERVICE_BASE_URL).get(`/auth/api/user/oauthApps/byIntegrationId${queryString}`)
    .reply(HttpStatus.OK,bodyObj.dropboxIntegrationList);
    const stub = sinon.stub(apiUtils, "getGoogleDriveOAuth")
    stub.resolves(bodyObj.folderIdResponse);
    request(server)
    .post('/form/api/oauth/createFolder')
    .send({ ...reqBody, path:'/test'})
    .set('access-token',token)
    .set('accept','application/json')
    .expect(HttpStatus.OK)
    .end(function(err, res) {
      should.not.exist(err);
      logger.debug('folder created for google drive');
      res.body.should.have.keys('folder_id');
      done();
    })
  })
  it('should not create new folder for GOOGLE-DRIVE with wrong integration_id/oauth_provider', function(done){
    const reqBody={
      oauth_provider:globalConstant.GOOGLE_DRIVE,
      integration_id:globalConstant.DROP_BOX,
      supportive_email:'hardik@mail.com',
    }
    nock(config.AUTH_SERVICE_BASE_URL).get("/auth/api/oauth/credentials")
    .reply(HttpStatus.OK,bodyObj.credentialsBody);
    const queryString = `?integration_id=${globalConstant.GOOGLE_DRIVE}&supportive_email=${reqBody.supportive_email}`;
    nock(config.AUTH_SERVICE_BASE_URL).get(`/auth/api/user/oauthApps/byIntegrationId${queryString}`)
    .reply(HttpStatus.OK,bodyObj.dropboxIntegrationList);
    const stub = sinon.stub(apiUtils, "getGoogleDriveOAuth")
    stub.resolves(bodyObj.folderIdResponse);
    request(server)
    .post('/form/api/oauth/createFolder')
    .send({ ...reqBody, path:'/test'})
    .set('access-token',token)
    .set('accept','application/json')
    .expect(HttpStatus.OK)
    .end(function(err, res) {
      should.exist(err);
      res.body.should.have.keys('statusCode','message');
      res.body.should.have.value('statusCode',HttpStatus.INTERNAL_SERVER_ERROR);
      res.body.should.have.value('message','internal server errorno oauth provider matched');
      done();
    })
  })
  it('should not create new folder for DROPBOX with wrong integration_id/oauth_provider', function(done){
    const reqBody={
      oauth_provider:globalConstant.GOOGLE_DRIVE,
      integration_id:globalConstant.DROP_BOX,
      supportive_email:'hardik@mail.com',
    }
    nock(config.AUTH_SERVICE_BASE_URL).get("/auth/api/oauth/credentials")
    .reply(HttpStatus.OK,bodyObj.credentialsBody);
    const queryString = `?integration_id=${globalConstant.GOOGLE_DRIVE}&supportive_email=${reqBody.supportive_email}`;
    nock(config.AUTH_SERVICE_BASE_URL).get(`/auth/api/user/oauthApps/byIntegrationId${queryString}`)
    .reply(HttpStatus.OK,bodyObj.dropboxIntegrationList);
    const stub = sinon.stub(apiUtils, "getGoogleDriveOAuth")
    stub.resolves(bodyObj.folderIdResponse);
    request(server)
    .post('/form/api/oauth/createFolder')
    .send({ ...reqBody, path:'/test'})
    .set('access-token',token)
    .set('accept','application/json')
    .expect(HttpStatus.OK)
    .end(function(err, res) {
      should.exist(err);
      res.body.should.have.keys('statusCode','message');
      res.body.should.have.value('statusCode',HttpStatus.INTERNAL_SERVER_ERROR);
      res.body.should.have.value('message','internal server errorno oauth provider matched');
      done();
    })
  })
})
