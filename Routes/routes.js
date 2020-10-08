const express = require('express');
const mongoose = require('mongoose');
// const {MongoClient} = require('mongodb');
const uuidv4=require('uuid');
const respSchema=require('../Model/responseSchema');

let resp={};

const router=express.Router();
router.use(express.json());
// console.log("Routes here");

router.get("/meet/:meetId", (req, res, next) => {
    console.log("Hey!!");
    res.send(req.body.json());
    next();
})
router.post("/meet", async (req,res)=>{

    resp=new respSchema({
        formId:req.body.formId,
        responseId:req.body.uuidv4.v4(),
        responseBy:req.body.responseBy,
        sections:req.body.sections
    });

    const idSave = await resp.save();
    res.json(idSave);
});
// const app = express();

module.exports = router;