const {google} = require('googleapis');
const redis = require('redis');
const publisher = redis.createClient();
const fetch = require('node-fetch');

const integration_id = "google-sheets";

const googleSheetMaker = (req, res, next) => {
  const form_id = req.form.form_id;
  const { client_id, client_secret, redirect_uri, supportive_email, refresh_token} = req.body;
  authorize(createSheet);
  function authorize(callback) {
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uri
    );
    oAuth2Client.setCredentials({ "refresh_token": refresh_token});
    callback(oAuth2Client);
  }
  function createSheet(auth) {
    console.log('creating a sheet ');
    const sheets = google.sheets({version: 'v4', auth});
    const resource = {
      properties: {
        title: req.form.form_title,
      },
      sheets: [
        {
          properties:{
            title: 'form response'
          }
        }
      ]
    };
    sheets.spreadsheets.create({
      resource,
    }, (err, spreadsheet) =>{
      if (err) {
        return res.status(500).json({'msg':`error : ${err.message}`})
      } else {
        var spreadsheet_id = spreadsheet.data.spreadsheetId;
        var sheetId = spreadsheet.data.sheets[0].properties.sheetId;
        console.log(`sheet created with spreadid : ${spreadsheet_id} and sheetid ${sheetId}`);
        // add data to spreadsheet here 
        fetch('http://localhost:5000/auth/api/oauth/edit/'+integration_id,{
          method: 'PUT',
          headers: {
            'access-token': req.headers['access-token'],
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'supportive_email': supportive_email
          },
          body:JSON.stringify({[req.form.form_id]: {
            spreadsheet_id,
            sheetId,
            deleted: false
          }})
        })
        .then(res => res.json())
        .then(async (data) => {
          publisher.publish("buildSheet",JSON.stringify({spreadsheet_id,sheetId,my_formData:req.my_formData,client_id, client_secret, redirect_uri,refresh_token}));
          req.response_from_google = {
            url: `https://docs.google.com/spreadsheets/d/${spreadsheet_id}/edit#gid=${sheetId}`,
            sheet_info: {
              spreadsheet_id,
              sheetId
            },
            supportive_email,
            status: 200
          }
        next();
        })
        .catch(err =>{
          return res.status(500).json({'msg':`error :: ${err.message}`})
        })
      }
    });
  }
}

module.exports = googleSheetMaker;
