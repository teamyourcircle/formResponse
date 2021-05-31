const express = require('express');
const router=express.Router();
const fetch = require('node-fetch');
const HttpStatus = require('http-status-codes');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const apiUtils = require('../util/apiUtils');
const oauth_sheet_helper = require('../util/oauth_sheet_helper');
const logger = require('../util/logger');
const check_form_author = require('../middleWareFun/check_form_author');
const errorMessages = require('../util/errorMessages');

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
    url=apiUtils.createUrl(config.AUTH_SERVICE_BASE_URL, '/auth/api/user/oauthApps');
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
      logger.debug('sheet found, exiting');
      flag=true;
      return res.status(HttpStatus.OK).json(responseJSON)
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
      let message='Sheet found Hurry!!';
      logger.debug(message);
      return res.json(200);
    }
  })
  .then(() => {
    logger.debug('creating sheet');
    return oauth_sheet_helper.sheetCreator(req.body, formResponseArray, req);
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
    logger.error('sheet cannot be created :: '+err);
    res.status(HttpStatus.FORBIDDEN).json(apiUtils.getResponse('sheet cannot be created :: '+err,HttpStatus.FORBIDDEN))
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

module.exports = router;