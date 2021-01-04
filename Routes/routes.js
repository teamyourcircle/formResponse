const { response } = require('express');
const express = require('express');
const mongoose = require('mongoose');
const fetch = require('node-fetch');
const helper = require('./helper');

const respSchema=require('../Model/responseSchema');

const router=express.Router();
router.use(express.json());




/*curl -X PUT -H "Content-Type: application/json" -d '{"data":[{ "is_choice":true,"skills":{"c":1,"python":1,"ruby":0} }]}' http://localhost:5003/api/response/5f80c8321d4dcf2434a9a0c5
*/
router.put("/response/:responseId", async (req, res) => {
       
  const responseId = req.params.responseId; 
  const response = await respSchema.update({"_id": responseId},{$push:{"sections":req.body.data}});
  res.json({"status":"Added"});
})

//authorized only with token
router.post("/response", async (req,res)=>{
    
  let resp=new respSchema({
  formId:req.body.form_id,
  responseBy:req.body.responseBy,
  sections:req.body.section_list
  });

  //saving to mongoDB
  const idSave = await resp.save();
  res.send(idSave);
});

module.exports = router;