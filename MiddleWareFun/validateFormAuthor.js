// this middleware will hit the Dashboard to get user info.
const fetch = require('node-fetch');

const validateAuthor = (req, res, next) => {
    const token = req.headers['access-token'];
    if(token === undefined)
        return res.status(401).json({"msg":"Unauthorized"});
    const url = "http://localhost:5002/form/api/myforms";
    const options = {
        method: 'GET',
        headers: {
            'access-token': token,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }
    fetch(url, options)
    .then(res => res.json())
    .then( data => {
        if(data.msg){
            return res.status(403).json({'msg':`err :: ${data.msg}`});
        }
        req.formData = data.form;
        const is_validate = validate_form_created_by_current_user(data.form,req.body.formId )
        if(is_validate.length)
        next();
        else
        return res.status(401).json({'msg':`unauthorized form ${req.query.formId} :: not created by user`});
    })
    .catch(err => res.status(502).json({"msg": "Bad Gateway - " + err.message}));
}

module.exports = validateAuthor;


const validate_form_created_by_current_user  = (formsByUser, form_id) =>{
    if(formsByUser===undefined){
        return ;
    }
    return formsByUser.filter(form => form.form_id==form_id);
}