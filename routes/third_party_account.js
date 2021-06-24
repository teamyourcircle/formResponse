const express = require('express');
const router=express.Router();
var async = require("async");
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const HttpStatus = require('http-status-codes');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const apiUtils = require('../util/apiUtils');
const oauth_sheet_helper = require('../util/oauth_sheet_helper');
const logger = require('../util/logger');
const check_form_author = require('../middleWareFun/check_form_author');
const integration_provider = require('../middleWareFun/integration_provider');
const errorMessages = require('../util/errorMessages');
const globalConstant = require('../util/globalConstant');
const credential_provider = require('../middleWareFun/credential_provider');

/**
 * create google sheet with form data
 * @param {*} formId
 */
router.post("/oauth/createSheets",[check_form_author,credential_provider,integration_provider], (req, res) => {
  logger.debug('inside oauth create sheet');
  var flag = false;
  var email=req.body.supportive_email;
  var responseSummary = {};
  var choiceresponseSummary = {};
  var formResponseArray=[];
  var userFormData;
  const formId = req.body.formId;
  const token = req.headers['access-token'];
  var url = apiUtils.createUrl(config.FORM_RESPONSE_BASE_URL, `/form/api/get/responses?formId=${formId}`);
  var options = {
    method: 'GET',
    headers: {
      'access-token': token,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
  fetch(url, options)
  .then(res => res.json())
  .then(formData => {
    logger.debug('connecting user with third-party app')
    formResponseArray=formData.responseArray;
    return Promise.resolve(req.oauthBody);
  })
  .then(data => {
    if(data.msg){
      logger.debug('data forbidden error');
      res.status(HttpStatus.FORBIDDEN).json(apiUtils.getResponse('Error :: '+data.msg, HttpStatus.FORBIDDEN));
    }
    logger.debug('checking pre-existing sheet')
    var responseJSON = oauth_sheet_helper.sheetUsercheck(formId, data, email, flag);
    if(responseJSON.status == HttpStatus.OK) {
      logger.debug('sheet found, exiting');
      flag=true;
      return Promise.reject(responseJSON)
    }
    if(!flag){
      logger.debug('traversing response data');
      for(var i=0;i<formResponseArray.length;i++){
          let sections = formResponseArray[i]['sections'];
          sections.map(s => {
            s.map(f =>{ 
            var key = Object.keys(f)[1];
            if(f["is_choice"]===false){
              if(responseSummary.hasOwnProperty(key))
              responseSummary[key] = [...responseSummary[key],f[key]];
              else responseSummary[key] = [f[key]];
            }else{
              if(choiceresponseSummary.hasOwnProperty(key))
              choiceresponseSummary[key] = [...choiceresponseSummary[key],f[key]];
              else choiceresponseSummary[key] = [f[key]];
            }
          })
        })
      }
      userFormData = {...responseSummary,...choiceresponseSummary};
      return Promise.resolve(userFormData);
    }
  })
  .then((sheetFormatData) => {
    logger.debug('creating sheet');
    return oauth_sheet_helper.sheetCreator(req.body, sheetFormatData, req);
  })
  .then(status => {
    if(status.status==HttpStatus.OK){
      logger.debug('sheet created successfully');
      res.status(HttpStatus.OK).json(status);
    }
    else{
      logger.debug(status);
      return Promise.reject(status);
    }
  })
  .catch(err =>{
    logger.error('sheet cannot be created');
    res.status(HttpStatus.FORBIDDEN).json({ 
      'message': 'new sheet cannot be created :: '+err,
      'error' : err
     })
  })
});

router.post('/oauth/createFolder',[credential_provider, integration_provider], (req, res) => {
  let responsePromiseFolder;
  logger.debug('inside oauth create folder');
  const { path, integration_id } = req.body;
  let message='';
  switch (integration_id){
    case globalConstant.GOOGLE_DRIVE:
      const refresh_token = req.refresh_token;
      responsePromiseFolder = apiUtils.getGoogleDriveOAuth(req.body.credentials, refresh_token, path)
      break;
    case globalConstant.DROP_BOX:
      let oauth_token='';
      logger.debug('new access token fetched');
      oauth_token = req['access_token'];
      if(oauth_token) {
        logger.debug('hit request on drop_box')
        responsePromiseFolder = apiUtils.getDropboxOAuth(oauth_token, path)
      }
      else {
        message='access token not fected';
        logger.debug(message)
        return Promise.reject(message);
      }
      break;
    default:
      message = 'no service for integration';
      logger.debug(message);
      responsePromiseFolder = Promise.reject(message);
  }
  responsePromiseFolder
  .then(response => {
    res.json(response)
  })
  .catch(err => {
    logger.error('folder cannot be created');
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
      'message': 'new folder cannot be created :: '+err
    })
  })
})

module.exports = router;