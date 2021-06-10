const {google} = require('googleapis');
const fetch = require('node-fetch');
const logger = require('../util/logger');
const apiUtils = require('../util/apiUtils');
const sheets = google.sheets('v4')
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
var nodeBase64 = require('nodejs-base64-converter');
var open = require('amqplib').connect(config.RABBIT_MQ_URL);
const google_sheet = async (queue, isNoAck = false, durable = false, prefetch = null) => {
// Consumer
open.then(function(conn) {
    return conn.createChannel();
  }).then(function(ch) {
    return ch.assertQueue(queue).then(function() {
      return ch.consume(queue, function(msg) {
        if (msg !== null) {
          logger.debug(`recieving payload from the queue :: ${queue}`);
          prepare_the_auth_sheet(queue, msg.content.toString());
          ch.ack(msg);
        }
      });
    });
  }).catch(logger.warn);
}
module.exports = google_sheet;

/*
* global variable for sheet info
*/
let document_info = {};

/**
 * this function will add the data
 * @param {*} auth 
 * @param {*} payload 
 */
const add_row_to_sheet = (auth,payload) =>{
    logger.debug('add row to google sheet');
    const formId = JSON.parse(payload)['formId'];
    const spreadsheetId = document_info['additional_info'][formId]['spreadsheet_id'];
    logger.debug(`adding rows to spreadsheetId ${spreadsheetId}`);
    let value = payload_expand(payload);
    sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: "A:B",
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [
            value
          ],
        },
        auth: auth
      }, (err, response) => {
        if (err){
            logger.error(err);
        }
        else if(response){
            logger.debug('row added to google sheet successfully');
            logger.debug(response.config.body);
        }
      })
}

/**
 * get client ids and secrets for apps
 */
const get_credentials = () => {
    logger.debug('inside get_credentials function');
    let base64encode = nodeBase64.encode(`${config.basic_auth_username}:${config.basic_auth_password}`);
    let url = apiUtils.createUrl(config.AUTH_SERVICE_BASE_URL,"/auth/api/oauth/credentials");
    return new Promise(function(resolve, reject){
        fetch(url,{
            headers: {
                Authorization: `Basic ${base64encode}`
            }
        })
        .then(res=>res.json())
        .then(data =>{
            if(!data.error){
                resolve(data);
            }
            else{
                reject(data.error);
            }
        })
        .catch(err =>{
            reject(err);
        })
    })
}

/**
 * this will do authorization process
 * @param {*} integration_id 
 * @param {*} payload
 */
const prepare_the_auth_sheet = (integration_id, payload) =>{
    logger.debug('inside prepare_the_auth_sheet');
    const formId = JSON.parse(payload)['formId'];
    logger.debug(`prepare the auth for formId: ${formId}`);
    get_credentials()
    .then(credentials =>{
        authorize(add_row_to_sheet, formId, integration_id, payload,credentials)
    })
    .catch(err=>{
        logger.error(err);
        logger.error('not able to add row in sheet');
    })
}

/**
 * this will authorize for sheet
 * @param {*} callback 
 * @param {*} formId 
 * @param {*} integration_id 
 * @param {*} payload
 */
const authorize = (callback, formId, integration_id,payload,credentials) => {
    logger.debug('authorization process init with google');
    const {google_client_id, google_client_secret, google_redirect_uri} = credentials;
    const oAuth2Client = new google.auth.OAuth2(
    google_client_id,
    google_client_secret,
    google_redirect_uri
    );
    set_integration_doc(formId,integration_id)
    .then(() => {
        oAuth2Client.setCredentials({ "refresh_token": document_info['refresh_token']});
        callback(oAuth2Client,payload);
    })
    .catch(err =>{
        logger.error('not able to authorize from google :: '+err);
    })
}

/**
 * this will set sheetId , spreadsheetid , refreshtoken
 * @param {*} formId 
 * @param {*} integrationId 
 */
const set_integration_doc = (formId,integrationId)=>{
    logger.debug('set the token of active account for integrationId: '+integrationId);
    let base64encode = nodeBase64.encode(`${config.basic_auth_username}:${config.basic_auth_password}`);
    let url = apiUtils.createUrl(config.AUTH_SERVICE_BASE_URL,`/auth/api/oauth/active/${integrationId}?key=${formId}`);
    return new Promise((resolve,reject)=>{
        fetch(url,{
            headers: {
                Authorization: `Basic ${base64encode}`,
                accept: "application/json"
            }
        })
        .then(res=>res.json())
        .then(data =>{
            if(!data.error){
                logger.debug('documet info fetched');
                document_info = data;
                resolve(data);
            }
            else{
                reject(data.error);
            }
        })
        .catch(err =>{
            reject(err);
        })
    })
}
/**
 * this will decode the payload
 * @param {*} payload 
 */
const payload_expand = (payload) =>{
    logger.debug(`formatting the payload`);
    let value = [];
    const sections = JSON.parse(payload).sections;
    sections.map(s => {
        s.map(f => {
            if(!f['is_choice']){
                value.push(f[Object.keys(f)[1]]);
            }else{
                value.push(get_choices(f[Object.keys(f)[1]]));
            }
        })
    })
    return value;
}
/**
 * this will return the choices
 * @param {*} obj 
 */
const get_choices = (obj) => {
    var val = [];
    for (var key in obj) {
        if(obj[key]){
            val.push(key);
        }
    }
    return val.join();
}
module.exports.get_choices = get_choices;
module.exports.payload_expand = payload_expand;
module.exports.set_integration_doc = set_integration_doc;
