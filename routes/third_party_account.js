const express = require('express');
const router=express.Router();
const fetch = require('node-fetch');
const HttpStatus = require('http-status-codes');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const apiUtils = require('../util/apiUtils');
const oauth_sheet_helper = require('../oauth_sheet_helper');
const Switcher = require('../middleWareFun/switcher');
const logger = require('../util/logger');
const check_form_author = require('../middleWareFun/check_form_author');

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


router.put("/put/switch/:integrationId", [Switcher], (req, res) => {
  return res.status(200).json({'msg':"switched"});
})
