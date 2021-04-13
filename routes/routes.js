const express = require('express');
const respSchema=require('../models/responseSchema');
const router=express.Router();
const producer = require('../middleWareFun/producer');
const fetch = require('node-fetch');

router.use(express.json());
router.post("/response", (req,res)=>{   
  const responseBody = {
    formId:req.body.form_id,
    responseBy:req.body.responseBy,
    sections:req.body.section_list
    };
  let resp=new respSchema(responseBody);
  produce_the_message(responseBody.formId,responseBody).then(()=>{
    resp.save().then((response)=>{
      res.json(response)
    }).catch(err=>{
      res.status(500).json({"msg": `internal error :: ${err}`})
    })
  }).catch(err=>res.status(500).json({"msg": `internal error :: ${err}`}))
})

module.exports = router;


const produce_the_message  = (formId,payload) =>{
    return new Promise((resolve,reject)=>{
      try {
        fetch(`http://localhost:5002/form/api/get/consumers?formId=${formId}`
        ).then(res =>res.json()).then(data=>{
          if(data.formId){
            data.queueName.map(event=>{
              producer(event, payload)
            })
            resolve();
          }else{
            reject({message:"not found"})
          }
        })
      } catch (error) {
        reject(error);
      }
    })

}
