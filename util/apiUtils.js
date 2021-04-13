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
