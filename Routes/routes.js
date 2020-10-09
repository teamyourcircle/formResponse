const express = require('express');
const mongoose = require('mongoose');
// const {MongoClient} = require('mongodb');

const respSchema=require('../Model/responseSchema');

const router=express.Router();
router.use(express.json());
// console.log("Routes here");

router.put("/response/:responseId", async (req, res) => {
        const responseId = req.params.responseId; 
        const response = respSchema.findOne({"responseId":responseId});
        req.json({"response":response});

})
//curl testing
/*
curl --header "Content-Type: application/json" --request POST --data '
{
"form_id":"32",
"responseBy":"kumarnitesh2000.nk@gmail.com",
"section_list":[
  [{
  "is_choice":false,
  "name":"Nitesh Kumar Arora"
},{
  "is_choice":true,
  "gender":{"male":1,"female":0,"others":0}
},
{
  "is_choice":false,
  "roll-number":1806810217
}
]
]

}' http://localhost:6000/api/meet
*/

router.post("/response", async (req,res)=>{
    console.log(req.body);
    
    let resp=new respSchema({
        formId:req.body.form_id,
        responseBy:req.body.responseBy,
        sections:req.body.section_list
    });

    //saving to mongoDB
    const idSave = await resp.save();
    res.send(idSave);
});
// const app = express();

module.exports = router;