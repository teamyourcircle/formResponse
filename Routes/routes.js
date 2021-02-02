const express = require('express');
const respSchema=require('../Model/responseSchema');
const router=express.Router();

router.use(express.json());
router.post("/response", async (req,res)=>{   
  let resp=new respSchema({
  formId:req.body.form_id,
  responseBy:req.body.responseBy,
  sections:req.body.section_list
  });
  const idSave = await resp.save();
  res.send(idSave);
});

module.exports = router;

