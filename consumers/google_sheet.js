var open = require('amqplib').connect('amqp://localhost:5672');
var env = require('../config/config')['development']
const {google} = require('googleapis');
const fetch = require('node-fetch');
const sheets = google.sheets('v4')

const google_sheet = async (queue, isNoAck = false, durable = false, prefetch = null) => {
// Consumer
open.then(function(conn) {
    return conn.createChannel();
  }).then(function(ch) {
    return ch.assertQueue(queue).then(function() {
      return ch.consume(queue, function(msg) {
        if (msg !== null) {
          console.log(`recieving payload from the queue :: ${queue}`);
          prepare_the_auth_sheet(queue, msg.content.toString());
          ch.ack(msg);
        }
      });
    });
  }).catch(console.warn);
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
    const spreadsheetId = document_info['spreadsheet_id'];
    sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: "A:B",
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [
            payload_expand(payload)
          ],
        },
        auth: auth
      }, (err, response) => {
        if (err) return console.error(err)
        else if(response){
            console.log(`status is ${response.status}`);
        }
      })
}
/**
 * this will do authorization process
 * @param {*} integration_id 
 * @param {*} supportive_email 
 * @param {*} payload
 */
const prepare_the_auth_sheet = (integration_id, payload) =>{
    const formId = JSON.parse(payload)['formId'];
    authorize(add_row_to_sheet, formId, integration_id, payload);
}

/**
 * this will authorize for sheet
 * @param {*} callback 
 * @param {*} formId 
 * @param {*} integration_id 
 * @param {*} payload
 */
const authorize = (callback, formId, integration_id,payload) => {
    const oAuth2Client = new google.auth.OAuth2(
      env.client_id,
      env.client_secret,
      env.redirect_uri
    );
    set_integration_doc(formId,integration_id)
    .then(() => {
        oAuth2Client.setCredentials({ "refresh_token": document_info['refresh_token']});
        callback(oAuth2Client,payload);
    })
    .catch(err =>{
        console.log(err);
    })
}

/**
 * this will set sheetId , spreadsheetid , refreshtoken
 * @param {*} formId 
 * @param {*} integrationId 
 */
const set_integration_doc = (formId,integrationId)=>{
    return new Promise((resolve,reject)=>{
    fetch(`http://localhost:5000/auth/api/all/oauthApps?integration_id=${integrationId}`)
    .then(res => res.json())
    .then(data => {
        if(data.integartionList.length){
            document_info = filter_doc(data.integartionList,formId);
            resolve();
        }
    })
    .catch(err => {
        console.log(err);
        reject(err);
    })
    })
    
}

/**
 * search which doc contain additional info with formId as property
 * @param {*} integration_arr 
 * @param {*} formId 
 */
const filter_doc = (integration_arr, formId) => {
    let doc_body = {};
    integration_arr.map(i => {
        if(i['additional_info']!=undefined && i['additional_info'][formId]!=undefined && !i['additional_info'][formId].deleted)
        {   
            doc_body['refresh_token'] = i['refresh_token'];
            doc_body['spreadsheet_id'] = i['additional_info'][formId]['spreadsheet_id'];
            doc_body['sheetId'] = i['additional_info'][formId]['sheetId'];
        }
    })
    return doc_body;
}
/**
 * this will decode the payload
 * @param {*} payload 
 */
const payload_expand = (payload) =>{
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
