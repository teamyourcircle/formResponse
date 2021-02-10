const {google} = require('googleapis');
const sheets = google.sheets('v4');
const fetch = require('node-fetch');

const googleSheetMaker = (req, res, next) => {
  const integration_id = 'google-sheets';
  const { client_id, client_secret, redirect_uri, access_token } = req.body;
  let spreadId = "";
  authorize(createSheet);
  function authorize(callback) {
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uri
    );
    oAuth2Client.setCredentials({ "access_token": access_token});
    callback(oAuth2Client);
  }
  function createSheet(auth) {
    const sheets = google.sheets({version: 'v4', auth});
    const resource = {
      properties: {
        title: req.form.form_title,
      }
    };
    sheets.spreadsheets.create({
      resource,
      fields: 'spreadsheetId',
    }, (err, spreadsheet) =>{
      if (err) {
        return res.status(500).json({'msg':`error :: ${err}`})
      } else {
        const integration_id = 'google-sheets';
        let spreadsheet_id = spreadsheet.data.spreadsheetId;
        // add data to spreadsheet here 
        fetch('http://localhost:5000/auth/api/oauth/edit/'+integration_id,{
          method: 'PUT',
          headers: {
            'access-token': req.headers['access-token'],
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body:JSON.stringify({[req.form.form_id]: spreadsheet_id})
        })
        .then(res => res.json())
        .then(data => next())
        .catch(err =>{
          return res.status(500).json({'msg':`error :: ${err.message}`})
        })
      }
    });
  }
 
}

module.exports = googleSheetMaker;