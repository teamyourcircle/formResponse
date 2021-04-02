const consumerSchema=require('../Model/consumerSchema');
const express = require('express');
const router=express.Router();
const validate = require('../MiddleWareFun/validateFormAuthor');
const consumers = require('../Consumers');
const fetch = require('node-fetch');

router.get('/get/consumers',async (req,res)=>{
    const {formId} = req.query;
    consumerSchema.findOne({formId})
    .then(async (consumer)=>{
        if(consumer){
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
            return res.status(200).json(res_body);
            else
            return res.status(200).json({queueName: [], formId});
        }
        else
            res.status(404).json({"queueName":[], "formId":parseInt(formId)});    
    })
    .catch(err =>{
        res.status(500).json({"msg":`internal error :: ${err}`})
    })
})

router.put('/update/consumers', validate,(req,res)=>{
    const {queueName,formId } = req.body;
    consumerSchema.findOne({formId})
    .then(fetchedconsumer =>{
        if(fetchedconsumer==null){
            const queue = [queueName];
            const consumer = new consumerSchema({
                queueName: queue
                ,formId
            });
            consumer.save().then(consumer => {
                return res.status(200).json({"msg": "updated successfully"});
            })
        }else{
            consumerSchema.update({"formId": formId},{$push:{"queueName":queueName}})
            .then(consumer =>{
            res.status(200).json({"msg": "updated successfully"});
        })
    }
        
    })
    .catch(err =>{
        res.status(500).json({"err":`internal error :: ${err}`})
    })
})

router.delete('/remove/consumers', validate,(req,res)=>{
    const {queueName,formId } = req.body;
    consumerSchema.findOne({formId})
    .then(fetchedconsumer =>{
        if(fetchedconsumer==null){
            return res.status(404).json({"msg": "not found error"});
        }else{
            consumerSchema.update({"formId": formId},{$pull:{"queueName":queueName}})
            .then(consumer =>{
            res.status(200).json({"msg": "removed successfully"});
        })
    }
        
    })
    .catch(err =>{
        res.status(500).json({"err":`internal error :: ${err}`})
    })
})

router.get('/get/all/consumers',(req,res)=>{
    const {tags} = req.query;
    if(!tags){
        res.json(consumers);
    }else{
        const tagsArr = tags.split(',');
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
    return fetch(`http://localhost:5000/auth/api/user/oauthApps/byIntegrationId?integration_id=${consumer}`, {
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
