
const respSchema=require('../Model/responseSchema');
const express = require('express');
const router=express.Router();
const fetch = require('node-fetch');
const helper = require('./helper');
const dashHit = require('../MiddleWareFun/dashboardHit');
const dataXT = require('../MiddleWareFun/formDataExtracter');
const GSheet = require('../MiddleWareFun/googleSheetMaker');

router.get('/myforms',async (req,res)=>{
    const {key} = req.query;
    const token = req.headers['access-token'];
    // console.log("My key --", key);
    if(key==undefined && token == undefined){
        return res.status(401).json({"msg":"Unauthorized"})
    }
    else{
      if( key == undefined  ) {
        const url = `http://localhost:8000/forms/user?token=${token}`;
        const response = await fetch(url);
        if(response.ok){
            const data = await response.json()
            return res.json({form:data.forms})
        }
        else{
            return res.status(response.status).json({"msg":"Token not recognized"})
        }
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

/*curl -X PUT -H "Content-Type: application/json" -d '{"data":[{ "is_choice":true,"skills":{"c":1,"python":1,"ruby":0} }]}' http://localhost:5003/api/response/5f80c8321d4dcf2434a9a0c5
*/
router.put("/response/:responseId", async (req, res) => {
  const responseId = req.params.responseId; 
  const response = await respSchema.update({"_id": responseId},{$push:{"sections":req.body.data}});
  res.json({"status":"Added"});
})


// google sheet post route
router.post("/oauth/createSheets",[dashHit, dataXT, GSheet], async (req, res) => {
  return res.status(200).json({"responses": req.my_formData});
})
  

module.exports = router;