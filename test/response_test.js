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
const { log } = require('winston');

describe('test the submission of response', function () {
    let responseID ;
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
            should.not.exist(err);
            responseID = res.body[globalConstant.UNDERSCORE_ID];
            res.body.should.have.keys('formId','responseBy','sections');
            done();
        })
    })
    after((done)=>{
        apiUtils.deleteResponse(responseID)
        .then(()=>{
            logger.debug('done with cleaning process');
            done();
        })
        .catch(err => {
            logger.err(`not able to clean db due to ${err}`);
            done(err);
        })
    })
})