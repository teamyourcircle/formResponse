const express = require('express');
const respSchema=require('../models/responseSchema');
const router=express.Router();
const producer = require('../middleWareFun/producer');
const fetch = require('node-fetch');
const logger = require('../util/logger');
const HttpStatus = require('http-status-codes');
const apiUtils = require('../util/apiUtils');
const errorMessages = require('../util/errorMessages');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const verify = require('../middleWareFun/user_info_by_token');
const checkResponse=require('../middleWareFun/response_validator')

router.use(express.json());
router.post("/submit/response", verify,checkResponse,(req,res)=>{
  const {form_id,section_list} = req.body;
  logger.debug(`submitting the response of form : ${form_id}`)  
  
  console.log(section_list);
  const responseBody = {
    formId:form_id,
    responseBy: req.user.id,
    sections:section_list
    };
   
  let resp=new respSchema(responseBody);
  produce_the_message(responseBody.formId,responseBody).then(()=>{
    logger.debug('saving the response to db');
    resp.save().then((response)=>{
      logger.debug('response saved to db');
      res.json(response)
    }).catch(err=>{
      logger.error(`not able to produce message due to ${err}`);
      return new Promise.reject(err);
    })
  }).catch(err=>res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiUtils.getError('response not added :: '+err, HttpStatus.INTERNAL_SERVER_ERROR)))
})

module.exports = router;

/**
 * this will publish the response and send it to desired queue 
 * @param {*} formId 
 * @param {*} payload 
 */
const produce_the_message  = (formId,payload) =>{
    logger.debug('sending payload to consumers');
    return new Promise((resolve,reject)=>{
      try {
        fetch(apiUtils.createUrl(config.FORM_RESPONSE_BASE_URL,`/form/api/get/consumers?formId=${formId}`)
        ).then(res =>res.json()).then(data=>{
          if(data.formId){
            data.queueName.map(event=>{
              producer(event, payload)
            })
            resolve();
          }else{
            reject({message:errorMessages.NOT_FOUND})
          }
        })
      } catch (error) {
        reject(error);
      }
    })
}
