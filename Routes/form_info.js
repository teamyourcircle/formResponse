
const respSchema=require('../Model/responseSchema');
const express = require('express');
const router=express.Router();
const fetch = require('node-fetch');
const helper = require('./helper');

router.get('/myforms',async (req,res)=>{
    const {key} = req.query;
    console.log(key);
    if(key==undefined){
        return res.status(401).json({"msg":"Unauthorized"})
    }
    else{
        const url = `http://localhost:8000/forms/user?key=${key}`;
        const response = await fetch(url);
        if(response.ok){
            const data = await response.json()
            return res.json({form:data.forms})
        }
        else{
            return res.status(response.status).json({"msg":"Token not recognized"})
        }
    }

})

                                              
router.delete('/forms/delete', async(req,res)=>{
    const formId = req.body.formId;
  try {
    let response = await fetch(`http://localhost:8000/forms/delete/${formId}`);
    if (response.ok) {
    let json = await response.json();
    const resultData = await respSchema.deleteMany({"formId":formId});
    res.status(200).json({status:"Deleted"});
    } else {
      res.status(response.status).json({status:response.status});
    }
    
  } catch (err) {
    console.log(err);
    res.status(500).json('Internal error');
  }
  });

//get all the responses by form_id test
router.get('/get/form/:formId', (req,res)=>{

    const formId = req.params.formId;
    fetch(`http://localhost:8000/forms/form_info/${formId}`).then(response => {
      if(response.ok){
        response.json().then(data => {
          const fields = data['template']['field']['field_label'];
          respSchema.aggregate([
            { $match: {'formId': parseInt(formId) } },
          ]).exec((err,responses) => {
            if(err===null){
            let selected_responses = [];
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
            res.status(500).json({'Status':'Internal Server Error'})
          }
          })
        })
      }else if(response.status===404){
        res.status(404).json({'Status':'Not Found Error'})
      }
    })
   
  
  })
  


//now we want that particular response info get 
router.get('/get/response/:responseId',async (req,res)=>{

    const responseId = req.params.responseId;
    try {
        var response = await respSchema.findOne({"_id": responseId});
    } catch (error) {
        var response = null;
    }
    
    
    if(response===null){
        return res.status(404).json({'Status':'Not Found Error'});
    }
    const section = response.sections;
    let fieldArray  = [];
    section.map(s => {
      s.map(f =>{
        fieldArray.push(f);
      })
    })
    res.status(200).json({"response":fieldArray});
  
  });
  
  

module.exports = router;