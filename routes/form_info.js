
const respSchema=require('../models/responseSchema');
const consumerSchema= require('../models/consumerSchema')
const express = require('express');
const router=express.Router();
const fetch = require('node-fetch');
const helper = require('../util/apiUtils').check_for_required_labels;
const dashHit = require('../middleWareFun/dashboardHit');
const dataXT = require('../middleWareFun/formDataExtracter');
const GSheet = require('../middleWareFun/googleSheetMaker');
const Switcher = require('../middleWareFun/switcher');

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

                                              
router.delete('/forms/delete',dashHit,(req,res)=>{
    const formId = req.body.formId;
 
  fetch(`http://localhost:8000/forms/delete/${formId}`)
  .then(
    function(response) {
      if (response.ok) {
        response.json().then(function(data) {
          respSchema.deleteMany({"formId":formId}).then(result=>{
            consumerSchema.deleteOne({"formId":formId}).then(result=>{
              res.status(200).json({status:"Deleted"});
            })
          })
        });
      } else {
          res.status(response.status).json({msg:"not found"});
        }
    }
  )
  .catch(function(err) {
    res.status(500).json({msg:"internal server error"});
  });
  });



module.exports = router;