const respSchema=require('../models/responseSchema');
const express = require('express');
const router=express.Router();
const fetch = require('node-fetch');
const helper = require('../util/apiUtils').check_for_required_labels;
const verify = require('../middleWareFun/check_form_author');
const globalConstant = require('../util/globalConstant');
const logger = require('../util/logger');
const apiUtils = require('../util/apiUtils');
const HttpStatus = require('http-status-codes');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

router.delete("/delete/response",verify,(req, res) => {
  const responseId = req.body.response_id;
  const {formId} = req.body;
  logger.debug(`deleting response with responseId : ${responseId}`);
  respSchema.deleteOne({[globalConstant.UNDERSCORE_ID]:responseId,formId})
  .then(response =>{
    if(response.n){
      logger.debug('response deleted successfully');
      res.json(apiUtils.getResponse('response deleted successfully',HttpStatus.OK));
    }else{
      logger.error('response not found');
      return Promise.reject('response not found');
    }
  })
  .catch(err => {
    logger.error('response not deleted due to '+err);
    res.json(apiUtils.getResponse('response not deleted due to '+err,HttpStatus.OK));
  })
});

router.get('/get/response/:responseId',verify, (req,res)=>{
  logger.debug('inside get responses');
  const responseId = req.params.responseId;
  const formId = req.query.formId;
  respSchema.findOne({[globalConstant.UNDERSCORE_ID]:responseId,formId})
  .then(response =>{
    logger.debug('responses found');
    const section = response.sections;
    let fieldArray  = [];
    section.map(s => {
      s.map(f =>{
        fieldArray.push(f);
      })
    })
    res.status(HttpStatus.OK).json({"response":fieldArray});
  })
  .catch(err =>{
    logger.error('response not found '+err);
    res.status(HttpStatus.NOT_FOUND).json(apiUtils.getResponse('response not found '+err,HttpStatus.NOT_FOUND))
  })
  
});

router.get('/get/responses', verify,(req,res)=>{
    const formId = req.query.formId;
    logger.debug(`getting responses of formId : ${formId}`);
    fetch(apiUtils.createUrl(config.FORM_SERVICE_BASE_URL,`/forms/form_info/${formId}`)).then(response => {
      if(response.ok){
        logger.debug('form info fetched');
        response.json().then(data => {
          const fields = data['template']['field']['field_label'];
          respSchema.aggregate([
            { $match: {'formId': parseInt(formId) } },
          ]).exec((err,responses) => {
            if(err===null){
            let selected_responses = [];
            logger.error('filter responses')
            responses.map(response => {
              let labels = [];
              response.sections.map(section => {
                section.map(field => {
                  labels.push(Object.keys(field)[1]);
                })
              })
              if(helper(fields,labels)){
                selected_responses.push(response);
              }
            })  
            res.json({"responseArray":selected_responses});
          }
          else{
            logger.error(`filteration not done due to ${err}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiUtils.getError('not able to fetch responses :: '+err, HttpStatus.INTERNAL_SERVER_ERROR))
          }
          })
        })
      }else{
        res.status(HttpStatus.NOT_FOUND).json(apiUtils.getResponse('form template not found',HttpStatus.NOT_FOUND))
      }
    })
  })
  
module.exports = router;