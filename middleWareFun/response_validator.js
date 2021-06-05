const { resolve, reject } = require("bluebird");
const fetch=require('node-fetch');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const logger=require('../util/logger');
const HttpStatus=require('http-status-codes');
const apiUtils=require('../util/apiUtils');

const compareRespAndTemplate = (req,res,next)=>{
    logger.debug('Inside compare response and template middleware');
    const resp = req.body.section_list;
    logger.debug('fetching template');
    fetch(config.FORM_SERVICE_BASE_URL+`/forms/form_info/${req.body.form_id}`,{method:'GET'})
    .then((response)=>{
        if(response.ok)
            return response.json();
        else
        {logger.debug('failed to fetch');
            return new Promise((resolve,reject)=>{reject(`unauthorized form ${req.body.form_id} :: not created by user`)})}
    })
    .then((template)=>{
        logger.debug('template fetched successfully')
        compareNoOfSection(template,resp)
        .then((res)=>{
            return compareNoOfFields(template,resp)
        })
        .then((res)=>{
            return compareKeys(template,resp);
        })
        .then((res)=>{
            logger.debug('successfully matched response and template');
            next();
        })
        .catch((err)=>{
            res.status(HttpStatus.BAD_REQUEST).json(apiUtils.getError(err,400));
        })
    })
    .catch((err)=>{
        res.status(HttpStatus.BAD_REQUEST).json(apiUtils.getError(err,400))
    })
}



const compareNoOfSection= (temp,resp)=>{
    logger.debug('copmaring no. of sections')
    return new Promise((resolve,reject)=>{
        if(temp.template.section.section_fields.length===resp.length)
        {  
            logger.debug('No. of sections are equal.');
            resolve("No. of sections are equal");
        }
        else{
            logger.debug('No. of sections are not equal.');
            reject("Response Not Matched With Template:-- No. of sections are not equal");
        }
    })

}

const compareNoOfFields=(temp,resp)=>{
    logger.debug('comparing no. of fields');
    return new Promise((resolve,reject)=>{
        const templateFields=temp.template.section.section_fields;
        const sectionsArray=resp;
        var flag;
        for(let i=0;i<sectionsArray.length;i++){
            if(sectionsArray[i].length==templateFields[i]){
                flag=true;
            }
            else{
                flag=false;
                break;
            }
        }
        if(flag){
            logger.debug('No. of fields are equal.');
            resolve();}
        else{
            logger.debug('No. of fields are not equal.');
            reject("Response Not Matched with Template:-- Fields are not equal");}
    })
}





const compareKeys=(temp,resp)=>{
    logger.debug('comparing keys/labels of fields')
    return new Promise((resolve,reject)=>{
        const sections=resp;
        let arr=[];
        for(let s in sections){
            const section=sections[s];
            for(let f in section){
                arr=arr.concat(Object.keys(section[f]));
            }
        }
        for(let i=0;i<arr.length;i++){
            if(arr[i]==="is_choice"){
                arr.splice(i,1);
            }
        }

        const templateArray=temp.template.field.field_label;
        for(let f in templateArray){
            if(!arr.includes(templateArray[f])){
                logger.debug(`{${templateArray[f]}} key is missing at ${f}th position`);
                reject(`{${templateArray[f]}} key is missing at ${f}th position`);
            }
        }
        logger.debug('No. of keys are equal and same.');
        resolve('Response Matched');
    })
}

module.exports=compareRespAndTemplate;