const consumerSchema=require('../Model/consumerSchema');
const express = require('express');
const router=express.Router();
const validate = require('../MiddleWareFun/validateFormAuthor');
const consumers = require('../Consumers');

router.get('/get/consumers',(req,res)=>{
    const {formId} = req.query;
    consumerSchema.findOne({formId})
    .then(consumer=>{
        if(consumer){
            let infos = [];
            let res_body = {};
            consumer.queueName.map(c=>{
                infos.push(get_info_for_consumer(c));
            })
            res_body.infos = infos;
            res_body.queueName = consumer.queueName;
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
const get_info_for_consumer = (queueName) =>{
    let consumerInfo =  consumers.filter(c => c.queue===queueName);
    if(consumerInfo.length){
        return consumerInfo[0];
    }
    return null;
}
