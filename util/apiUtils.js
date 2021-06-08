const responseCollection = require('../models/responseSchema');
const consumerSchema = require('../models/consumerSchema');
const globalConstant = require('../util/globalConstant');
const logger = require('../util/logger');
exports.getError = (message, statusCode) => {
  return {
    statusCode,
    message
  };
};

exports.getResponse = (msg,statusCode) => {
    return {
      msg,
      statusCode
    }
}

exports.createUrl = (baseUrl,path) => {
  if(baseUrl && path){
    return baseUrl+path;
  }else{
    return '';
  }
}

exports.check_for_required_labels  = (fields,labels) => {
  
  for(let i=0;i<fields.length;i++){
      if(compare(fields[i],labels)){
          return true;
      }
  }
  return false;

}
/**
 * compare fields with label
 * @param {*} field 
 * @param {*} labels 
 */
const compare = (field,labels) =>{
  for(let i=0;i<labels.length;i++){
    
      if(field===labels[i])
      {
      return true;
      }
  }
  return false;
}
/**
 * delete response
 * @param {*} id 
 */
exports.deleteResponse = (id) => {
  logger.debug(`deleting response with responseID ${id}`);
  return responseCollection.deleteOne({[globalConstant.UNDERSCORE_ID]:id});
}
/**
 * @param {*} formId
 */
exports.deleteConsumer = (formId) => {
  logger.debug('deleting conumer doc');
  return consumerSchema.deleteOne({formId});
}