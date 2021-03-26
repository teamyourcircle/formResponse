const {google} = require('googleapis');
const sheets = google.sheets('v4');
const fetch = require('node-fetch');
const {
maxRowCount,
buildHeaderRowRequest,
buildRowsForData
} = require('../util/create_sheet_helper');

const integartion_id = "google-sheets";

const googleSheetMaker = (req, res, next) => {
  const form_id = req.form.form_id;
  const { client_id, client_secret, redirect_uri, supportive_email} = req.body;
  let spreadId = "";
  authorize(createSheet);
  function authorize(callback) {
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uri
    );
    oAuth2Client.setCredentials({ "refresh_token": req.body.refresh_token});
    callback(oAuth2Client);
  }
  function createSheet(auth) {
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
        /*
        * here may be access token is expired so we can refresh it 
        * add if we get access_token :: (200) then set to req.body.access_token
        * and again call authorize(createSheet)
        * but if no access_token :: (!200) do nothing
        */
       if(err.response!=undefined){
        // if(err.response.status == 401){
        //   const option = {
        //     method: 'POST',
        //     headers: {
        //       'access-token': req.headers['access-token'],
        //       'Content-Type': 'application/json',
        //       'Accept': 'application/json'
        //     },
        //     body: JSON.stringify({"oauth_provider": "google",
        //     "integration_id": "google-sheets", "supportive_email": supportive_email})
        //   }
        //   fetch('http://localhost:5000/auth/api/refreshoauthAccess', option)
        //   .then(res => {
        //     if(res.ok){
        //       return res.json();
        //     }
        //     else{
        //       throw new Error('Refresh token not available as Access-Token is not correct'); 
        //     }
        //   })
        //   .then(data => {
        //     req.body.access_token = data.access_token;
        //     authorize(createSheet);
        //   })
        //   .catch(err => {
        //     return res.status(500).json({'msg':`err :: ${err}`})
        //   })
        // }
      }else{
        return res.status(500).json({'msg':`error : ${err.message}`})
      }
      } else {
        const integration_id = 'google-sheets';
        var spreadsheet_id = spreadsheet.data.spreadsheetId;
        var sheetId = spreadsheet.data.sheets[0].properties.sheetId;
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
          }})
        })
        .then(res => res.json())
        .then(data => addValuesToSheet(sheets,spreadsheet_id,sheetId))
        .catch(err =>{
          return res.status(500).json({'msg':`error :: ${err.message}`})
        })
      }
    });
  }

  function addValuesToSheet(sheets,spreadsheet_id,sheetId) {
    var data = req.my_formData;
    let COLUMNS = Object.keys(data).map(key => key);
    var requests = [
      buildHeaderRowRequest(sheetId,COLUMNS,data),
    ];
    //row Count
    let row_count = maxRowCount(data);
    // Resize the sheet.
    requests.push({
      updateSheetProperties: {
        properties: {
          sheetId: sheetId,
          gridProperties: {
            rowCount: row_count+1,
            columnCount: COLUMNS.length+1
          }
        },
        fields: 'gridProperties(rowCount,columnCount)'
      }
    });
    // Set the cell values.
    requests.push({
      updateCells: {
        start: {
          sheetId: sheetId,
          rowIndex: 1,
          columnIndex: 0
        },
        rows: buildRowsForData(row_count,COLUMNS,data),
        fields: '*'
      }
    });
    //single request
    var request = {
      spreadsheetId: spreadsheet_id,
      resource: {
        requests: requests
      }
    };
    //batch update request
      sheets.spreadsheets.batchUpdate(request, async function(err, response) {
        if (err) {
          console.log(`status is 502`);
          req.response_from_google = {
            status: 502,
            error: err
          }
          next();
        }
        //final response
        if(response!==undefined)
        {
          if(response.status==200){
            console.log(`status is ${response.status}`);
            const set_consumer = await set_the_consumer(req.headers['access-token'], integartion_id, form_id)
            req.response_from_google = {
                url: `https://docs.google.com/spreadsheets/d/${spreadsheet_id}/edit#gid=${sheetId}`,
                status: 200,
                source: response.request.responseURL
            }
            next();
          }else{
            console.log(`status is 502`);
            req.response_from_google = {
              status: 502,
              error: response.statusText,
              source: response.request.responseURL
            }
            next();
          }
        }else{
          console.log(`status is 500`);
            req.response_from_google = {
              status: 500,
              error: 'no response from google',
            }
            next();
        }
      });
  }
 
}

module.exports = googleSheetMaker;

/**
 * this will connect the automation consumer
 * @param {*} queueName 
 * @param {*} formId 
 */
const set_the_consumer = async (token, queueName, formId) =>{
    console.log('setting the consumer');
    const res = await fetch('http://localhost:5002/form/api/update/consumers', {
      method: 'PUT',
      headers: {
        'access-token': token,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body:JSON.stringify({
        queueName,
        formId
      })
    })

    const data = await res.json();
    return ;
    

}