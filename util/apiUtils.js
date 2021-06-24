const responseCollection = require('../models/responseSchema');
const consumerSchema = require('../models/consumerSchema');
const dropboxV2Api = require('dropbox-v2-api');
const { google } = require('googleapis');
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

exports.getDropboxOAuth = (oauth_token, path) => {
  logger.debug('inside drop_box oauth')
  return new Promise((resolve, reject) => {
    const dropbox = dropboxV2Api.authenticate({ token: oauth_token });
    dropbox({
      resource: 'files/create_folder',
        parameters: {
        "path": `/${path}`,
        "autorename": false
      }
    }, (err, result, response) => {
      if(result && result.metadata){
        logger.debug('folder created with id :: '+result.metadata.id);
        resolve({ 'folder_id': result.metadata.id});
      }
      else {
        message = `folder not created :: Error : ${JSON.stringify(err)}`;
        logger.debug(message);
        reject(message); 
      }
    });
  })
}

exports.getGoogleDriveOAuth = (credentials, refresh_token, path) => {
  const { google_client_id, google_client_secret, google_redirect_uri } = credentials;
  logger.debug('hit google OAuth request');
  return new Promise((resolve, reject) => {
    const oauth2Client = new google.auth.OAuth2(
      google_client_id,
      google_client_secret,
      google_redirect_uri
    );
    logger.debug('set OAuth credentials');
    oauth2Client.setCredentials({ refresh_token });
    const drive = google.drive({
        version: 'v3',
        auth: oauth2Client,
    });
    var fileMetadata = {
        'name': path,
        'mimeType': 'application/vnd.google-apps.folder'
    };
    logger.debug('hit drive request for folder creation');
    drive.files.create({
      resource: fileMetadata,
      fields: 'id'
      }, function (err, file) {
        if (err) {
          const message = `folder not created :: ${JSON.stringify(err)}`;
          logger.debug(message);
          reject(message);
        } else {
          logger.debug(`folder created`);
          resolve({ "folder_id":file.data.id });
        }
    });
  })
}