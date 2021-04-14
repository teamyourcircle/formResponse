const respSchema=require('../models/responseSchema');
const consumerSchema= require('../models/consumerSchema')
const express = require('express');
const router=express.Router();
const fetch = require('node-fetch');
const helper = require('../util/apiUtils').check_for_required_labels;
router.delete("/delete/response",[dashHit], async (req, res) => {
    const formId = req.body.form_id;
    const responseId = req.body.response_id
    const token = req.headers['access-token'];
    if(req.formData.length){
      req.formData.forEach(async e => {
        if(e.form_id == formId) {
          await respSchema.findOneAndDelete({"_id":responseId}, (err, data) => {
            if(err || data == null)
              return res.status(404).json({"msg":"Response not found"});
            else
              return res.status(200).json({status:"Deleted", "Deleted_response": data});
          })
        }
      });
    }
    else
      return res.status(response.status).json({"msg":"Form not found"});
  });
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

/*curl -X PUT -H "Content-Type: application/json" -d '{"data":[{ "is_choice":true,"skills":{"c":1,"python":1,"ruby":0} }]}' http://localhost:5003/api/response/5f80c8321d4dcf2434a9a0c5
*/
router.put("/response/:responseId", async (req, res) => {
  const responseId = req.params.responseId; 
  const response = await respSchema.update({"_id": responseId},{$push:{"sections":req.body.data}});
  res.json({"status":"Added"});
})

//get all the responses by form_id test
router.get('/get/responses/:formId', (req,res)=>{

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
  