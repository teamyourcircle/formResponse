const respSchema=require('../models/responseSchema');
const consumerSchema= require('../models/consumerSchema')
const express = require('express');
const router=express.Router();
const fetch = require('node-fetch');
const verify = require('../middleWareFun/check_form_author');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const apiUtils = require('../util/apiUtils');
const HttpStatus = require('http-status-codes');
const logger = require('../util/logger');
const errorMessages = require('../util/errorMessages');
const globalConstant = require('../util/globalConstant');

router.get('/myforms', (req,res)=>{
  logger.debug('inside my forms');
  const key=req.headers[globalConstant.KEY];
  const token=req.headers[globalConstant.TOKEN];
  let url;
  if(key){
    logger.debug(`fetching forms using key`);
    url = apiUtils.createUrl(config.FORM_SERVICE_BASE_URL,`/forms/user?key=${key}`);
  }
  else if(token){
    logger.debug('fetching forms using token');
    url = apiUtils.createUrl(config.FORM_SERVICE_BASE_URL,`/forms/user?token=${token}`);
  }
  else{
    logger.error(`unauthorized :: token or key not found`);
        res.status(HttpStatus.UNAUTHORIZED).send(
        apiUtils.getError(
        'unauthorized :: token or key not found',
        HttpStatus.UNAUTHORIZED))
  }
  
  fetch(url)
  .then(res => {
    if(res.status==HttpStatus.OK){
      logger.debug('forms fetched');
      return res.json();
    }else{
      logger.error(errorMessages.FORM_NOT_FOUND);
      return Promise.reject(errorMessages.FORM_NOT_FOUND);
    }
  })
  .then(data =>{
    return res.json({form:data.forms})
  })
  .catch(err => {
    logger.error('forms not fetched of current user '+err);
    return res.status(HttpStatus.NOT_FOUND).json(apiUtils.getError('forms not fetched',HttpStatus.NOT_FOUND));
  })
})
                                         
router.delete('/forms/delete',verify,(req,res)=>{
    const formId = req.body.formId;
    fetch(apiUtils.createUrl(config.FORM_SERVICE_BASE_URL,`/forms/delete/${formId}`))
    .then(
      function(response) {
        if (response.ok) {
          response.json().then(function(data) {
            logger.debug('form template deleted of formId : '+data.id);
            respSchema.deleteMany({formId}).then(result=>{
              logger.debug('all responses deleted of formid : '+formId);
              consumerSchema.deleteOne({formId}).then(result=>{
                logger.debug('all consumers deleted of formid : '+formId);
                res.status(HttpStatus.OK).json(apiUtils.getResponse('form foot prints removed',HttpStatus.OK));
              })
            })
          });
        } else {
            logger.error(errorMessages.FORM_NOT_FOUND);
            res.status(response.status).json(apiUtils.getError(errorMessages.FORM_NOT_FOUND,response.status));
          }
      }
    )
    .catch(function(err) {
      logger.error('form foot print not deleted due to '+err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiUtils.getError('form not deleted :: '+err, HttpStatus.INTERNAL_SERVER_ERROR))
    });
});

module.exports = router;