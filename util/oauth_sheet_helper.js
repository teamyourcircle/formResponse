const redis = require('redis');
const logger = require('./logger');
const fetch = require('node-fetch');
const {google} = require('googleapis');
const publisher = redis.createClient();
const apiUtils = require('../util/apiUtils');
const HttpStatus = require('http-status-codes');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const integration_id = "google-sheets";

/**
 * this function will find the already created sheet present in multi-account
 * @param {*} data 
 * @param {*} form_id
 * @param {*} supportive_email
 * @param {*} flag
 */

  function sheetUsercheck(formId, data, email,flag){
      logger.debug('check sheet creation');
      let sheetUrl='';
      let sheetInfo={};
      let localFlag=false;
      data["integartionList"].forEach(eve => {
        var add_info = eve['additional_info'];
        if(add_info && add_info[formId] && eve.email===email){
            sheetUrl = `https://docs.google.com/spreadsheets/d/${add_info[formId].spreadsheet_id}/edit#gid=${add_info[formId].sheetId}`;
            sheetInfo.spreadsheet_id = add_info[formId].spreadsheet_id;
            sheetInfo.sheetInfo = add_info[formId].sheetId;
            local_flag = true;
        }else{
            return;
        }
    })
    if(localFlag){
    logger.debug('sheet found');
    return {sheetUrl, sheetInfo,'status': HttpStatus.OK ,supportive_email,'source': 'already_created'};
    }
    else{
    logger.debug('sheet not found')
    return {'status': HttpStatus.NOT_FOUND};
    }
  }

function sheetCreator(request, formData){
    logger.debug('inside sheetCreator');
    var response_from_google;
    const { client_id, client_secret, redirect_uri, supportive_email, refresh_token} = request;
    authorize(createSheet);
    function authorize(callback) {
        const oAuth2Client = new google.auth.OAuth2(
          client_id,
          client_secret,
          redirect_uri
        );
        oAuth2Client.setCredentials({ "refresh_token": refresh_token});
        logger.debug('authorized with google')
        callback(oAuth2Client);
      }
    
      function createSheet(auth) {
        const sheets = google.sheets({version: 'v4', auth});
        const resource = {
          properties: {
            title: formData.form_title,
          },
          sheets: [
            {
              properties:{
                title: 'form response'
              }
            }
          ]
        };
        logger.debug('creating spreadsheet');
        sheets.spreadsheets.create({
          resource,
        }, (err, spreadsheet) =>{
          if (err) {
            let message = 'internal server error'+err;
            logger.error(message);
            return {'status':HttpStatus.INTERNAL_SERVER_ERROR, message};
          } else {
            var spreadsheet_id = spreadsheet.data.spreadsheetId;
            var sheetId = spreadsheet.data.sheets[0].properties.sheetId;
            logger.debug('spreadsheet created');
            const url = apiUtils.createUrl(config.AUTH_SERVICE_BASE_URL,'/oauth/edit/'+integration_id)
            fetch(url+integration_id,{
              method: 'PUT',
              headers: {
                'access-token': request.headers['access-token'],
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'supportive_email': supportive_email
              },
              body:JSON.stringify({[formId]: {
                spreadsheet_id,
                sheetId          
              }})
            })
            .then(res => res.json())
            .then(async (data) => {
              logger.debug('loading data into sheet');
              publisher.publish("buildSheet",JSON.stringify({spreadsheet_id,sheetId,my_formData:request.my_formData,client_id, client_secret, redirect_uri,refresh_token}));
              response_from_google = {
                url: `https://docs.google.com/spreadsheets/d/${spreadsheet_id}/edit#gid=${sheetId}`,
                sheet_info: {
                  spreadsheet_id,
                  sheetId
                },
                supportive_email,
                status: 200
              }
              logger.debug('data loaded');
              return { 'status': HttpStatus.OK, response_from_google};
            })
            .catch(err =>{
            let message = 'internal server error'+err;
            logger.error(message);
            return {'status':HttpStatus.INTERNAL_SERVER_ERROR, message};
            })
          }
        });
      }    
  }

module.exports.sheetCreator = sheetCreator;
module.exports.sheetUsercheck = sheetUsercheck;
