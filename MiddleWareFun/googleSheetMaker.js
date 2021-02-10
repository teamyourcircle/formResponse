const {google} = require('googleapis');
const sheets = google.sheets('v4');

const googleSheetMaker = (req, res, next) => {
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
        return res.status(500).json({'msg':`error :: ${err.errors[0].message}`})
      } else {
        let spreadsheet_id = spreadsheet.data.spreadsheetId;
        console.log(spreadsheet_id);
        next();
      }
    });
  }
 
}

module.exports = googleSheetMaker;