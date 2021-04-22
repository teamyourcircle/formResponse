const consumerSchema=require('../models/consumerSchema');
const express = require('express');
const router=express.Router();
const consumers = require('../consumers');
const fetch = require('node-fetch');
const HttpStatus = require('http-status-codes');
const check_form_author = require('../middleWareFun/check_form_author');
const logger = require('../util/logger');
const apiUtils = require('../util/apiUtils');
const globalConstant = require('../util/globalConstant');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

router.get('/get/consumers',async (req,res)=>{
    const {formId} = req.query;
    logger.debug(`fetch consumers for formId ${formId}`);
    consumerSchema.findOne({formId})
    .then(async (consumer)=>{
        if(consumer){
            logger.debug('consumer found');
            var infos = [];
            let res_body = {};
            for(let i=0;i<consumer.queueName.length;i++){
                let info_for_consumer = await get_info_for_consumer(consumer.queueName[i],req.headers['access-token'],formId);
                infos.push(info_for_consumer);
                res_body.infos = infos;
                res_body.queueName = consumer.queueName;
                res_body.formId = parseInt(formId);
            }
            if(res_body.queueName)
            return res.status(HttpStatus.OK).json(res_body);
            else
            return res.status(HttpStatus.OK).json({queueName: [], formId});
        }
        else{
            logger.error('consumer not found');
            res.status(HttpStatus.NOT_FOUND).json({"queueName":[], "formId":parseInt(formId)});  
        }  
    })
    .catch(err =>{
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiUtils.getError('not able to fetch consumers :: '+err, HttpStatus.INTERNAL_SERVER_ERROR))
    })
})

router.put('/update/consumers', check_form_author,(req,res)=>{
    const {queueName,formId } = req.body;
    logger.debug('update the consumer :: add '+queueName);
    consumerSchema.findOne({formId})
    .then(fetchedconsumer =>{
        if(fetchedconsumer==null){
            logger.debug('create a queue and push '+queueName);
            const queue = [queueName];
            const consumer = new consumerSchema({
                queueName: queue
                ,formId
            });
            consumer.save().then(consumer => {
                return res.status(HttpStatus.OK).json(apiUtils.getResponse('updated successfully',HttpStatus.OK));
            })
        }else{
            if(fetchedconsumer[globalConstant.QUEUE_SCHEMA].indexOf(queueName)==-1){
                logger.debug('push '+queueName);
                consumerSchema.updateOne({"formId": formId},{$push:{"queueName":queueName}})
                .then(consumer =>{
                return res.status(HttpStatus.OK).json(apiUtils.getResponse('updated successfully',HttpStatus.OK));
            })}else{
                logger.debug('consumer already added');
                return Promise.reject('consumer already present');
        }}
    })
    .catch(err =>{
        logger.error(`queue not updated due to ${err}`);
        res.status(HttpStatus.NOT_FOUND).json(apiUtils.getError('queue not updated :: '+err, HttpStatus.NOT_FOUND));
    })
})

router.delete('/remove/consumers', check_form_author,(req,res)=>{
    const {queueName,formId } = req.body;
    logger.debug(`remove a consumer ${queueName}`);
    consumerSchema.findOne({formId})
    .then(fetchedconsumer =>{
        if(fetchedconsumer==null){
            logger.debug('consumer schema not found');
            return res.status(HttpStatus.NOT_FOUND).json({"msg": "not found error"});
        }else{
            if(fetchedconsumer[globalConstant.QUEUE_SCHEMA].indexOf(queueName)!=-1){
                logger.debug('consumer schema found pull queue-name');
                consumerSchema.updateOne({"formId": formId},{$pull:{"queueName":queueName}})
                .then(consumer =>{
                res.status(HttpStatus.OK).json({"msg": "removed successfully"});
                })
            }else{
                logger.error('consumer already removed');
                return Promise.reject('consumer already removed');
            }
    }
    })
    .catch(err =>{
        res.status(HttpStatus.NOT_FOUND).json(apiUtils.getError('queue not updated :: '+err, HttpStatus.NOT_FOUND));
    })
})

router.get('/get/all/consumers',(req,res)=>{
    logger.debug('get all the available consumers in this app');
    const {tags} = req.query;
    if(!tags){
        logger.debug('no tags return all');
        res.json(consumers);
    }else{
        const tagsArr = tags.split(',');
        logger.debug('search with tags '+tagsArr);
        res.json(get_consumers_by_tag(tagsArr));
    }

})

module.exports = router;

/**
 * this will return the logo
 * @param {*} queueName 
 */
const get_info_for_consumer = async (queueName,token,formId) =>{
    var consumerInfo =  consumers.filter(c => c.queue===queueName);
    if(consumerInfo.length){
        //consumerInfo[0].emails = getSupportiveEmails(queueName,token);
        let data = await getSupportiveEmails(queueName,token);
        let integration_list = data.integartionList;
        let emails = [];
        let active_email = '';
        if(integration_list){
            for(let i=0;i<integration_list.length;i++){
                let {email,additional_info} = integration_list[i];
                emails.push(email);
                if(additional_info && additional_info[formId] && !additional_info[formId].deleted){
                    active_email = email;
                    additional_info_form = additional_info[formId];
                }
            }
        }
        consumerInfo[0].emails = emails;
        consumerInfo[0].active_email = active_email;
        return consumerInfo[0];
    }
    return null;
}
/**
 * 
 * @param {*} consumer 
 */
const getSupportiveEmails = (consumer,token) => {
    return fetch(apiUtils.createUrl(config.AUTH_SERVICE_BASE_URL,`/auth/api/user/oauthApps/byIntegrationId?integration_id=${consumer}`), {
            method: 'GET',
            headers: {
                'Content-Type':'application/json',
                'access-token':`${token}`    
            }
        })
        .then(res =>{return res.json()})    
}

/**
 * get consumers by tags(array)
 * @param {*} tags 
 */
const get_consumers_by_tag = (tagsArray) => {
    let selectedConsumer = [];
    for(let i=0;i<consumers.length;i++){
        let {tags} = consumers[i]; 
        for(let j=0;j<tagsArray.length;j++){
            if(contains(tagsArray[j],tags)){
                selectedConsumer.push(consumers[i]);
                break;
            }
        }
    }
    return selectedConsumer;
}
/**
 * tag represent a single tag return true if present in tags array
 * @param {*} tag 
 * @param {*} tags 
 */
const contains = (tag, tags) => {
    if(tags.indexOf(tag)===-1){
        return false;
    }
    return true;
}
