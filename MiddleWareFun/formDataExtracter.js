const fetch = require('node-fetch');
const dataExtracter = (req, res, next) => {
    let responseSummary = {};
    let choiceresponseSummary = {};
    const formObj = validate_form_created_by_current_user(req.formData, req.body.form_id);
    if(!formObj.length){
        return res.status(404).json({'msg':`form with form_id ${req.body.form_id} not exist`});
    }else{
        req.form = formObj[0];
    }
    const url = `http://localhost:5002/form/api/get/form/${req.form.form_id}`;
    fetch(url).then( resp => resp.json())
    .then(data => {
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
        req.my_formData = {...responseSummary,...choiceresponseSummary};
        next();
    })
    .catch(err => res.status(502).json({"msg": "Bad Gateway - " + err.message}))
}

module.exports = dataExtracter;

const validate_form_created_by_current_user  = (formsByUser, form_id) =>{
    return formsByUser.filter(form => form.form_id==form_id);
}