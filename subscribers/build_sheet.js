const {google} = require('googleapis');
const {
maxRowCount,
buildHeaderRowRequest,
buildRowsForData
} = require('../util/create_sheet_helper');

function addValueToSheet(auth,msg) {
    const { spreadsheet_id, sheetId ,my_formData} = msg;
    const sheets = google.sheets({version: 'v4', auth});
      var data = my_formData;
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
          fields: '*',
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
            if(response)
            console.log(`status is ${response.status}`);
            if(err)
            console.log(`error is ${err}`);
        });
    }  
   
function authorize(callback,msg) {
    const {client_id, client_secret,redirect_uri,refresh_token} = msg;
    const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uri
    );
    oAuth2Client.setCredentials({ "refresh_token": refresh_token});
    callback(oAuth2Client,msg);
    }

module.exports = function (msg) {
    authorize(addValueToSheet,msg);
}
