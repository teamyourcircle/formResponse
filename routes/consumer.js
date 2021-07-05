const consumerSchema=require('../models/consumerSchema');
const express = require('express');
const router=express.Router();
const consumers = require('../consumers');
const consumerList = require('../consumers');
const fetch = require('node-fetch');
const HttpStatus = require('http-status-codes');
const check_form_author = require('../middleWareFun/check_form_author');
const logger = require('../util/logger');
const apiUtils = require('../util/apiUtils');
const globalConstant = require('../util/globalConstant');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const {helper_module}=require('@teamyourcircle/form-validator')
const {verifyTemplate} = helper_module;
router.get('/get/consumers',async (req,res)=>{
    const {formId,email_view} = req.query;
    logger.debug(`fetch consumers for formId ${formId}`);
    consumerSchema.findOne({formId})
    .then(async (consumer)=>{
        if(consumer){
            logger.debug('consumer found');
            var infos = [];
            if(email_view==="true"){
                for(let i=0;i<consumer[globalConstant.QUEUE_SCHEMA].length;i++){
                    let template = consumer[globalConstant.QUEUE_SCHEMA][i].template;
                    let info_for_consumer = await get_info_for_consumer(consumer[globalConstant.QUEUE_SCHEMA][i].queueName,req.headers['access-token'],formId);
                    info_for_consumer.template = template;
                    infos.push(info_for_consumer);
                }
            }else{
                infos = consumer[globalConstant.QUEUE_SCHEMA];
            }
            return res.status(HttpStatus.OK).json({consumerList: infos});
        }
        else{
            logger.error('consumer not found');
            res.status(HttpStatus.NOT_FOUND).json(apiUtils.getError('no consumer found for formId: '+formId,HttpStatus.NOT_FOUND)); 
        }  
    })
    .catch(err =>{
        logger.error(err);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiUtils.getError('not able to fetch consumers :: '+err, HttpStatus.INTERNAL_SERVER_ERROR))
    })
})

router.put('/update/consumers', check_form_author,(req,res)=>{
    const {queueName,formId,template} = req.body;
    logger.debug('update the consumer :: add '+queueName);
    validateConsumerBody(queueName,template)
    .then(()=>{
        return getQuery(queueName,template,formId);
    })
    .then((queryForQueueUpdate) =>{
        let {query,set} = queryForQueueUpdate;
        return consumerSchema.updateOne(query,set, {upsert:true}); 
    })
    .then(updateConsumer => {
        return consumerSchema.findOne({formId});
    })
    .then(consumer => {
        res.json(consumer);
    })
    .catch(err =>{
        logger.error(`queue not updated due to ${err}`);
        res.status(HttpStatus.BAD_REQUEST).json(apiUtils.getError('queue not updated :: '+err, HttpStatus.BAD_REQUEST));
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
            if(is_queue_present(fetchedconsumer[globalConstant.QUEUE_SCHEMA],queueName)!=-1){
                logger.debug('consumer schema found pull queue-name');
                consumerSchema.updateOne({"formId": formId},{$pull:{[globalConstant.QUEUE_SCHEMA]:{[globalConstant.QUEUE_NAME]: queueName}}})
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
        res.json({consumerList});
    }else{
        const tagsArr = tags.split(',');
        logger.debug('search with tags '+tagsArr);
        res.json({consumerList:get_consumers_by_tag(tagsArr)});
    }

})

module.exports = router;

/**
 * this will return the logo
 * @param {*} queueName 
 */
const get_info_for_consumer = async (queueName,token,formId) =>{
    logger.debug('inside get info for consumer');
    let consumerInfo =  consumers.filter(c => c.queue===queueName);
    let {tags,actions,display_name,params,logo,description,authRequired} = consumerInfo[0];
    if(consumerInfo.length){
        //consumerInfo[0].emails = getSupportiveEmails(queueName,token);
        let data = await getSupportiveEmails(queueName,token);
        let integration_list = data.integrationList;
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
        return {queueName,emails, active_email,static_info:{tags,actions,display_name,params,logo,description,authRequired}};
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
    for(let i=0;i<consumerList.length;i++){
        let {tags} = consumerList[i]; 
        for(let j=0;j<tagsArray.length;j++){
            if(contains(tagsArray[j],tags)){
                selectedConsumer.push(consumerList[i]);
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
/**
 * 
 * @param {*} array 
 * @param {*} element 
 */
const is_queue_present = (array,element) => {
    return array.filter(a => a.queueName==element).length ? (1) : (-1);
}
/**
 * validate the consumer body
 * @param {*} queueName 
 * @param {*} template 
 */
const validateConsumerBody = (queueName,template) =>{
    let consumer_details = consumers.filter(c => c.queue===queueName);
    if(consumer_details.length){
        let {params} = consumer_details[0];
        if(!template){
            template = {};
        }
        return verifyTemplate(params,template);
    }else{
        return Promise.reject(`consumer with queue_name ${queueName} not exists`);
    }
}

/**
 * return query and set property
 * @param {*} queueName 
 * @param {*} template 
 * @param {*} formId 
 */
const getQuery = (queueName,template,formId) =>{
    let query,set;
    return new Promise((resolve,reject)=>{
        consumerSchema.findOne({formId})
        .then(fetchedconsumer => {
            if(fetchedconsumer){
                if(is_queue_present(fetchedconsumer[globalConstant.QUEUE_SCHEMA],queueName)==-1){
                    set = {$push:{[globalConstant.QUEUE_SCHEMA]:{queueName,template}}}
                    query = {formId};
                    resolve({query,set});
                }else{
                    logger.debug('already present in a queue');
                    let key = globalConstant.QUEUE_SCHEMA+".$.template";
                    let q_key = globalConstant.QUEUE_SCHEMA+".queueName";
                    query = {formId,[q_key]:queueName};
                    set = {$set:{ [key] : template }};
                    resolve({query,set});
                }
            }else{
                logger.debug('adding first element in an array');
                query = {formId};
                set = {$push:{[globalConstant.QUEUE_SCHEMA]:{queueName,template}}, formId};
                resolve({query,set});
            }
        })
        .catch(err => {
            reject(err);
        })
    })
}