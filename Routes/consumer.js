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
                let info_for_consumer = await get_info_for_consumer(consumer.queueName[i],req.headers['access-token']);
                infos.push(info_for_consumer);
                res_body.infos = infos;
                res_body.queueName = consumer.queueName;
            }
            res.status(200).json(res_body);
        }
        else
            res.status(404).json({"queueName":[], "formId":parseInt(formId)});    
    })
    .catch(err =>{
        res.status(500).json({"msg":`internal error :: ${err}`})
    })

})

router.get('/get/all/consumers',(req,res)=>{
    res.json(consumers);
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
module.exports = router;

/**
 * this will return the logo
 * @param {*} queueName 
 */
const get_info_for_consumer = async (queueName,token) =>{
    var consumerInfo =  consumers.filter(c => c.queue===queueName);
    if(consumerInfo.length){
        //consumerInfo[0].emails = getSupportiveEmails(queueName,token);
        let data = await getSupportiveEmails(queueName,token);
        let integration_list = data.integartionList;
        let emails = [];
        if(integration_list){
            for(let i=0;i<integration_list.length;i++){
                let {email} = integration_list[i];
                emails.push(email);
            }
        }
        consumerInfo[0].emails = emails;
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
