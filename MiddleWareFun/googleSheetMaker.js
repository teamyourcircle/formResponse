const {google} = require('googleapis');
const sheets = google.sheets('v4');

const googleSheetMaker = (req, res, next) => {
    const { client_id, client_secret, redirect_uri, access_token } = req.body;
    let spreadId = "";
    authorize(createSheet);
    // let author = "";
    function authorize(callback) {
      const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uri
      );
      // Check if we have previously stored a token.
        oAuth2Client.setCredentials({ "access_token": access_token});
        callback(oAuth2Client);
        // author = oAuth2Client;
    }
    
    function createSheet(auth) {
      const sheets = google.sheets({version: 'v4', auth});
      const resource = {
        properties: {
          title: req.body.form_id,
        }
      };
      sheets.spreadsheets.create({
        resource,
        fields: 'spreadsheetId',
      }, (err, spreadsheet) =>{
        if (err) {
          // Handle error.
          console.log("Here is the error ----- ",err);
        } else {
            spreadId = spreadsheet.data.spreadsheetId;
          console.log(`Spreadsheet ID: ${spreadsheet.data.spreadsheetId}`);
        }
      });
    //   main();
    }
    // async function main () {
    //     const authClient = author;
    //     const request = {
    //         spreadsheetId: spreadId,  
    //         resource: {
    //           valueInputOption: '',
    //           data: req.my_formData, 
    //         },
    //         auth: authClient,
    //       };
      
    //     try {
    //       const response = (await sheets.spreadsheets.values.append(request)).data;
    //       console.log(JSON.stringify(response, null, 2));
    //     } catch (err) {
    //       console.error(err);
    //     }
    //   }
    next();
}

module.exports = googleSheetMaker;