const fetch = require('node-fetch');
let flag = false;
const dataExtracter = (req, res, next) => {
    let responseSummary = {};
    let choiceresponseSummary = {};
    const formObj = validate_form_created_by_current_user(req.formData, req.body.form_id);
    if(!formObj.length){
        return res.status(404).json({'msg':`form with form_id ${req.body.form_id} not exist`});
    }else if(formObj===undefined){
        return res.status(403).json({'msg':`not correct user`});
    }   
    else{
        req.form = formObj[0];
    }
    const token = req.headers['access-token'];
    const uri = "http://localhost:5000/auth/api/user/oauthApps";
    const options = {
        method: 'GET',
        headers: {
            'access-token': token,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }
    fetch(uri, options)
    .then(resp => resp.json())
    .then( data => {
        if(data.msg){
            return res.status(403).json({'msg':`err :: ${data.msg}`});
        }
        var rjson = already_create_sheet_checker(req.form.form_id, data,req.body.supportive_email);
        if(rjson.status == 200) {
            flag = true;
            return res.json(rjson);
        }
        else
            return data;
    })
    .then(rp => {
        if(!flag){
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
            .catch(err => res.status(502).json({"msg": "Bad Gateway -- " + err.message}))
        }
    })
    .catch(err => res.status(502).json({"msg": "Bad Gateway - " + err.message}));
}

module.exports = dataExtracter;

const validate_form_created_by_current_user  = (formsByUser, form_id) =>{
    if(formsByUser===undefined){
        return ;
    }
    return formsByUser.filter(form => form.form_id==form_id);
}

/**
 * this function will find the already created sheet present in multi-account
 * @param {*} data 
 * @param {*} form_id
 */

const already_create_sheet_checker = (formId, data,supportive_email) => {
    let sheetUrl = '';
    let sheetInfo = {};
    let local_flag = false;
    data["integartionList"].forEach(eve => {
        var add_info = eve['additional_info'];
        if(add_info && add_info[formId] && eve.email===supportive_email){
            sheetUrl = `https://docs.google.com/spreadsheets/d/${add_info[formId].spreadsheet_id}/edit#gid=${add_info[formId].sheetId}`;
            sheetInfo.spreadsheet_id = add_info[formId].spreadsheet_id;
            sheetInfo.sheetInfo = add_info[formId].sheetId;
            local_flag = true;
        }else{
            return;
        }
    })
    if(local_flag)
        return {'url': sheetUrl, 'sheet_info':sheetInfo,'status': 200 ,supportive_email: supportive_email,'source': 'already_created'};
    else
        return {'status': 404};
}