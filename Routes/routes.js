const express = require('express');
const mongoose = require('mongoose');
// const {MongoClient} = require('mongodb');
const { v4:uuidv4 } = require('uuid');
const respSchema=require('../Model/responseSchema');

// let resp={};

const router=express.Router();
router.use(express.json());
// console.log("Routes here");

router.put("/meet/:meetId", (req, res) => {
    console.log("Hey!!");
    res.send(req.body);
    
})
router.post("/meet", async (req,res)=>{

    let resp=new respSchema({
        formId:req.body.form_id,
        responseId:uuidv4(),
        responseBy:req.body.responseBy,
        sections:req.body.section_list
    });
    console.log(resp);
    // res.send(resp);

    //saving to mongoDB
    const idSave = await resp.save();
    console.log("SavedId",idSave);
    res.send(idSave);
});
// const app = express();

module.exports = router;