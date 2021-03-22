const consumerSchema=require('../Model/consumerSchema');
const express = require('express');
const router=express.Router();
const validate = require('../MiddleWareFun/validateFormAuthor');
const consumers = require('../Consumers');

router.get('/get/consumers',(req,res)=>{
    const {formId} = req.query;
    consumerSchema.findOne({formId})
    .then(consumer=>{
        if(consumer)
            res.status(200).json(consumer);
        else
            res.status(404).json({"msg":"not found error"});    
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
    consumerSchema.update({"formId": formId},{$push:{"queueName":queueName}})
    .then(consumer =>{
        res.status(200).json({"msg": "updated successfully"});
    })
    .catch(err =>{
        res.status(500).json({"msg":`internal error :: ${err}`})
    })
})

router.post('/register/consumers', validate,(req,res)=>{
    const {queueName,formId } = req.body;
    const queue = [queueName];
    const consumer = new consumerSchema({
        queueName: queue
        ,formId
    });
    consumer.save().then(consumer => {
        res.status(200).json(consumer);
    })
    .catch(err =>{
        res.status(500).json({"msg":`internal error :: ${err}`})
    })


})
module.exports = router;