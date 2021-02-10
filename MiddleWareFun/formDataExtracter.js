const fetch = require('node-fetch');

const dataExtracter = (req, res, next) => {
    let arr = [];
    let responseSummary = {};
    let choiceresponseSummary = {};
    const url = `http://localhost:5002/form/api/get/form/${req.body.form_id}`;
    fetch(url).then( resp => resp.json())
    .then(data => {
        // data.responseArray.forEach( response => {
        //     if(response.formId == req.body.form_id)
        //         req.my_formData = response.sections[0];
        const responses = data.responseArray;
        for(var i=0;i<responses.length;i++){
            let sections = responses[i]['sections'];
            sections.map(s => {
                s.map(f =>{
                    var key = Object.keys(f)[1];
                    if(f["is_choice"]===false){
                        if(responseSummary.hasOwnProperty(key)){
                            responseSummary[key] = [...responseSummary[key],f[key]];
                        }
                        else{
                            responseSummary[key]  =  [ f[key] ];
                        }
                    }else{
                        if(choiceresponseSummary.hasOwnProperty(key)){
                            choiceresponseSummary[key] = [...choiceresponseSummary[key],f[key]];
                        }
                        else{
                            choiceresponseSummary[key]  =  [ f[key] ];
                        }
                    }
                })
            })
        }
        arr.push(responseSummary);
        arr.push    (choiceresponseSummary);
        req.my_formData = arr;
        next();
    })
    .catch(err => res.status(502).json({"msg": "Bad Gateway - " + err.message}))
}

module.exports = dataExtracter;