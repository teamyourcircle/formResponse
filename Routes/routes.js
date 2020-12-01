const express = require('express');
const mongoose = require('mongoose');
const fetch = require('node-fetch');

const respSchema=require('../Model/responseSchema');

const router=express.Router();
router.use(express.json());

router.get('/get/form/:formId',async (req,res)=>{

  // curl http://localhost:5002/get/form/51


  const formId = req.params.formId;
  //response is the array of responses .
  const response = await respSchema.find({"formId":formId});
    
  res.json({"responseArray":response});


})

//now we want that particular response info get 
router.get('/get/response/:responseId',async (req,res)=>{

  const responseId = req.params.responseId;
  const response = await respSchema.findOne({"_id": responseId});
  const section = response.sections;
  let fieldArray  = [];
  section.map(s => {
    s.map(f =>{
      fieldArray.push(f);
    })
  })
  res.send({"response":fieldArray});

});

// console.log("Routes here");
/*curl -X PUT -H "Content-Type: application/json" -d '{"data":[{ "is_choice":true,"skills":{"c":1,"python":1,"ruby":0} }]}' http://localhost:5003/api/response/5f80c8321d4dcf2434a9a0c5
*/
router.put("/response/:responseId", async (req, res) => {
       
        const responseId = req.params.responseId; 
        const response = await respSchema.update({"_id": responseId},{$push:{"sections":req.body.data}});
        res.json({"status":"Added"});
})
//curl testing
/*
curl --header "Content-Type: application/json" --request POST --data '
{
"form_id":"32",
"responseBy":"nitesh.nk@gmail.com",
"section_list":[
  [{
  "is_choice":false,
  "name":"Anmol Kumar Arora"
},{
  "is_choice":true,
  "gender":{"male":0,"female":1,"others":0}
},
{
  "is_choice":false,
  "roll-number":1806810227
}
]
]

}' http://localhost:5003/api/response
*/

router.post("/response", async (req,res)=>{
    //console.log(req.body);
    
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

// http://localhost:8000/forms/delete/id 
                                              
router.delete('/forms/delete', async(req,res)=>{

  const formId = req.body.formId;
 
  
try {
  let response = await fetch(`http://localhost:8000/forms/delete/${formId}`);
  if (response.ok) { // if HTTP-status is 200-299
    // get the response body (the method explained below)
    let json = await response.json();
    const resultData = await respSchema.deleteMany({"formId":formId});
  res.status(200).json({status:"Deleted"});
    console.log(json);
  } else {
    // console.log("HTTP-Error: " + response.status);
    res.status(response.status).json({status:response.status});
  }
  
} catch (err) {
  console.log(err);
  res.status(500).json('Internal error');
}

});

// curl -X DELETE -H "Content-Type: application/json" -d '{"formId": "51"}' http://localhost:5002/api/forms/delete
module.exports = router;