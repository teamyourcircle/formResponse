const {google} = require('googleapis');
const {
maxRowCount,
buildHeaderRowRequest,
buildRowsForData
} = require('../util/create_sheet_helper');
const logger = require('../util/logger');

function addValueToSheet(auth,msg) {
    logger.debug('adding value to sheet');
    const { spreadsheet_id, sheetId ,my_formData} = msg;
    const sheets = google.sheets({version: 'v4', auth});
      var data = my_formData;
      let COLUMNS = Object.keys(data).map(key => key);
      logger.debug('build header for the sheet for columns: ',COLUMNS);
      var requests = [
        buildHeaderRowRequest(sheetId,COLUMNS,data),
      ];
      //row Count
      let row_count = maxRowCount(data);
      logger.debug(`number of rows are ${row_count}`);
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
            logger.debug(`status is ${response.status}`);
            if(err)
            logger.error(`error is ${err}`);
        });
    }  
   
function authorize(callback,msg) {
  logger.debug('check for authorization for data entry in sheet');    
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

/*msg is this*/

// let msg={
//   "client_id": "391383527608-vq5pjfpslfeq4i10624rvt088eqhsa4p.apps.googleusercontent.com",
//   "client_secret": "HtTwp2jwnOrLK5qaY-0nNPUA",
//   "redirect_uri": "http://localhost:3000",
//   "refresh_token": "1//0g4WtalsTml6mCgYIARAAGBASNwF-L9IrF7VLjZLRBdshBtPVY8J0zhUy2EKbJHrAqAm_QNf0gw-gb7fLVJHDX-TDSBGtDNZbF8k",
//   "spreadsheet_id": "1XsMLItLjKOvzNuszUMCd0sncasUYmC6GQcQukZ5YmJQ",
//   "sheetId": 639480134,
//   "my_formData":[
//     {
//       "_id": "605b7f349f376b4228108cd7",
//       "sections": [
//         [
//           {
//             "is_choice": false,
//             "name": "now"
//           },
//           {
//             "is_choice": true,
//             "gender": {
//               "male": 1,
//               "female": 0
//             }
//           }
//         ]
//       ],
//       "formId": 118,
//       "responseBy": "niteshditest@gmail.com",
//       "__v": 0
//     },
//     {
//       "_id": "605b8216a81fbf4624e2d4e6",
//       "sections": [
//         [
//           {
//             "is_choice": false,
//             "name": "sss"
//           },
//           {
//             "is_choice": true,
//             "gender": {
//               "male": 1,
//               "female": 0
//             }
//           }
//         ]
//       ],
//       "formId": 118,
//       "responseBy": "niteshditest@gmail.com",
//       "__v": 0
//     }
//   ]
// }
// authorize(addValueToSheet,msg);
