const fetch = require('node-fetch');
const HttpStatus = require('http-status-codes');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const apiUtils = require('../util/apiUtils');
const globalConstant = require('../util/globalConstant');
const logger = require('../util/logger');

const check_form_author = (req, res, next) => {
    logger.debug('determine the form author');
    const token = req.headers[globalConstant.TOKEN];
    const formId = req.body.formId || req.query.formId 
    if(token){
        const url = apiUtils.createUrl(config.FORM_RESPONSE_BASE_URL,'/form/api/myforms');
        const options = {
            method: 'GET',
            headers: {
                'access-token': token,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }
        fetch(url, options)
        .then(res => {
            if(res.status==HttpStatus.OK){
                return res.json();
            }else{
                logger.error('not able to fetch the forms info');
                return Promise.reject(' forms not fetched');
            }
        })
        .then(data => {
            logger.debug('forms info fetched');
            req.formData = data.form;
            const is_validate = validate_form_created_by_current_user(data.form,formId);
            if(is_validate.length){
                return Promise.resolve();
            }else{
                logger.error(`form ${formId} :: not created by user`);
                return Promise.reject(` form ${formId} :: not created by user`);
            }
        })
        .then(()=>{
            logger.debug(`${formId} created by user`);
            next();
        })
        .catch(err => {
            logger.error('unauthorized :: '+err);
            res.status(HttpStatus.UNAUTHORIZED).json(
            apiUtils.getError(
            'unauthorized'+err,
            HttpStatus.UNAUTHORIZED))
        })

    }else{
        logger.error(`unauthorized :: token not found`);
        res.status(HttpStatus.UNAUTHORIZED).json(
        apiUtils.getError(
        'unauthorized',
        HttpStatus.UNAUTHORIZED))
    }
}

module.exports = check_form_author;

/**
 * array and id
 * @param {*} formsByUser 
 * @param {*} form_id 
 */
const validate_form_created_by_current_user  = (formsByUser, form_id) =>{
    logger.debug('check whether this form is created by logged in user or not');
    if(formsByUser===undefined){
        return ;
    }
    return formsByUser.filter(form => form.form_id==form_id);
}