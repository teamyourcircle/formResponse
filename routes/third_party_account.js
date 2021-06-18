const express = require('express');
const router=express.Router();
const { google } = require('googleapis');
var async = require("async");
const path = require('path');
const fs = require('fs');
const dropboxV2Api = require('dropbox-v2-api');
const fetch = require('node-fetch');
const HttpStatus = require('http-status-codes');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const apiUtils = require('../util/apiUtils');
const oauth_sheet_helper = require('../util/oauth_sheet_helper');
const logger = require('../util/logger');
const check_form_author = require('../middleWareFun/check_form_author');
const errorMessages = require('../util/errorMessages');
const globalConstant = require('../util/globalConstant');
const credential_provider = require('../middleWareFun/credential_provider');

/**
 * create google sheet with form data
 * @param {*} formId
 */
router.post("/oauth/createSheets",check_form_author, (req, res) => {
  logger.debug('inside oauth create sheet');
  var flag = false;
  var email=req.body.supportive_email;
  var responseSummary = {};
  var choiceresponseSummary = {};
  var formResponseArray=[];
  var userFormData;
  const formId = req.body.form_id;
  const token = req.headers['access-token'];
  var url = apiUtils.createUrl(config.FORM_RESPONSE_BASE_URL, `/get/responses?formId=${formId}`);
  var options = {
    method: 'GET',
    headers: {
      'access-token': token,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
  fetch(url, options)
  .then(() => {
    logger.debug('connecting user with third-party app')
    formResponseArray=req.formData;
    url=apiUtils.createUrl(config.AUTH_SERVICE_BASE_URL, '/user/oauthApps');
    return fetch(url, options)
  })
  .then(res => res.json())
  .then(data => {
    if(data.msg){
      logger.debug('data forbidden error');
      res.status(HttpStatus.FORBIDDEN).json(apiUtils.getResponse('Error :: '+data.msg, HttpStatus.FORBIDDEN));
    }
    logger.debug('checking pre-existing sheet')
    var responseJSON = oauth_sheet_helper.sheetUsercheck(formId, data, email, flag);
    if(responseJSON.status == HttpStatus.OK) {
      logger.debug('sheet found');
      flag=true;
      return res.status(HttpStatus.OK).json(responseJSON);
    }
  })
  .then(() => {
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
      return Promise.resolve();
    }
    else{
      let message = 'Something went wrong';
      logger.error(message);
      return Promise.reject(message);
    }
  })
  .then(() => {
    logger.debug('creating sheet');
    var sheetResponse = oauth_sheet_helper.sheetCreator(req.body, formResponseArray[0]);
    if(sheetResponse.status==HttpStatus.OK){
      logger.debug('sheet created successfully');
      res.status(HttpStatus.OK).json({ sheetResponse });
    }
    else{
      logger.debug(sheetResponse.message);
      return Promise.reject(sheetResponse.message);
    }
  })
  .catch(err =>{
    logger.error('sheet cannot be created '+err);
    res.status(HttpStatus.FORBIDDEN).json(apiUtils.getResponse('sheet cannot be created '+err,HttpStatus.FORBIDDEN))
  })
})


router.put("/put/switch/:integrationId", (req, res) => {
  logger.debug('inside swictch integration');
  const token = req.headers['access-token'];
  const {switch_from,switch_to,form_id} = req.body;
  const {integrationId} = req.params;
  let delete_flag=false;
  if(switch_to && form_id){
    logger.debug('fetching access switch_to user');
    let headerData={
      method: 'PUT',
      headers: {
        'access-token': token,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'supportive_email': switch_to
      },
      body:JSON.stringify({   
      "property": form_id,
      "delete_flag": delete_flag
      })
    }
    const endpoint="auth/api/oauth/edit/account/";
    const url=config.AUTH_SERVICE_BASE_URL+endpoint+integrationId
    fetch(url,headerData)
    .then(res => res.status)
    .then(status => {
      logger.debug('check switch_to status');
      if(status==HttpStatus.OK){
        logger.debug('fetching access switch_from user');
        headerData.body["delete_flag"]=true;
        headerData.headers['supportive_email']=switch_from;
        return fetch(url,headerData)
      }
      else {
        logger.debug('delete not setted')
        return Promise.reject(errorMessages.DELETE_NOT_SET);
      }
    })
    .then(res => res.status)
    .then(status=>{
      logger.debug('check switch_from status');
      if(status==HttpStatus.OK){
        let message='access switched';
        logger.debug(message);
        res.status(HttpStatus.OK).json({message});
      }else{
        logger.debug(errorMessages.DELETE_NOT_SET);
        return Promise.reject(errorMessages.DELETE_NOT_SET);
      }
    })
    .catch(err => {
      logger.error(errorMessages.INTERNAL_SERVER_ERROR+err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiUtils.getResponse(errorMessages.INTERNAL_SERVER_ERROR+err,HttpStatus.INTERNAL_SERVER_ERROR))
    })
  }else {
    let message='unauthorized';
    logger.debug(message);
    res.status(HttpStatus.UNAUTHORIZED).json(apiUtils.getResponse(message+err,HttpStatus.UNAUTHORIZED))
  } 
});

router.post('/oauth/createFolder',credential_provider, (req, res) => {
  logger.debug('inside oauth create folder');
  const { supportive_email, path, integration_id, oauth_provider } = req.body;
  const token = req.headers['access-token'];
  let oauth_token='';
  let message='';
  switch (integration_id){
    case globalConstant.GOOGLE_DRIVE:
      logger.debug('google drive coming soon');
      const { google_client_id, google_client_secret, google_redirect_uri } = req.body.credentials;
      const oauth2Client = new google.auth.OAuth2(
        google_client_id,
        google_client_secret,
        google_redirect_uri
      );
      oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
      const drive = google.drive({
        version: 'v3',
        auth: oauth2Client,
      });

      
      break;
    case globalConstant.DROP_BOX:
      const url = `${config.AUTH_SERVICE_BASE_URL}/auth/api/refreshoauthAccess`;
      const options = {
        method: 'PUT',
        headers: {
          'access-token': token,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          oauth_provider,
          integration_id,
          supportive_email
        })
      }
      logger.debug('hit request to refresh access-token')
      fetch(url,options)
      .then(resp => resp.json())
      .then(data => {
        if(data && data["integration"] && data.integration["access_token"]) {
          logger.debug('new access token fetched');
          oauth_token = data.integration['access_token'];
        }
        if(oauth_token) {
          logger.debug('hit request on drop_box')
          return dropboxV2Api.authenticate({ token: oauth_token });
        }
        else {
          message='access token not fected';
          logger.debug(message)
          return Promise.reject(message);
        }
      })
      .then(dropbox => {
        dropbox({
          resource: 'files/create_folder',
           parameters: {
            "path": path,
            "autorename": false
          }
        }, (err, result, response) => {
          if (err) {
            message = `folder not created :: Error : ${err}`;
            logger.debug(message);
            return Promise.reject(message); 
          }
          logger.debug('folder created with id :: '+result.metadata.id);
          return res.json({ 'folder_info': result.metadata});
        });
      })
      .catch(err => {
        logger.error(errorMessages.INTERNAL_SERVER_ERROR+err);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiUtils.getResponse(errorMessages.INTERNAL_SERVER_ERROR+err,HttpStatus.INTERNAL_SERVER_ERROR))
      })
      break;
    default:
      message = 'invalid integration found';
      logger.debug(message);
      return Promise.reject(message)
  }
})

module.exports = router;