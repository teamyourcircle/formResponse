const fetch = require('node-fetch');
const keychecking = (req,res,next) =>{
    const {key} = req.params;
    if(key==undefined){
        return res.status(401).json({"msg":"Unauthorized"})
    }
    else{
        const url = `http://localhost:5000/auth/api/whoami?key=${key}`;
        fetch(url).then(res=>res.json()).then(data=>{
            req.email = email;
        })     
        next();
    }
      
} 

module.exports = keychecking ;