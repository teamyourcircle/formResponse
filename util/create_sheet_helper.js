
function maxRowCount(data){
    let max = 0;
    Object.keys(data).map(key =>{
      max = Math.max(data[key].length,max);
    })
    return max;
  }
  
  function buildHeaderRowRequest(sheetId,COLUMNS,data) {
    var cells = COLUMNS.map(function(column) {
      return {
        userEnteredValue: {
          stringValue: column
        },
        userEnteredFormat: {
          textFormat: {
            bold: true
          }
        }
      }
    });
    return {
      updateCells: {
        start: {
          sheetId: sheetId,
          rowIndex: 0,
          columnIndex: 0
        },
        rows: [
          {
            values: cells
          }
        ],
        fields: 'userEnteredValue,userEnteredFormat.textFormat.bold'
      }
    };
  }
  
  function buildRowsForData(ROWSCOUNT,COLUMNS,data){
    var formatedData=[
    ];
    for(var i=0;i<ROWSCOUNT;i++){
      var obj = {};
      for(var j=0;j<COLUMNS.length;j++){
        obj[Object.keys(data)[j]] = data[Object.keys(data)[j]][i];
      }
      formatedData.push(obj);
    }
     return formatedData.map(function(row,i) {
      var cells = COLUMNS.map(function(column,j) {
        let is_choice = checkIsChoice(column,data);
        if(!is_choice){
          var string_val = null;
          if(row[column]!=undefined){
            string_val = row[column].toString();
          }else{
            string_val = null;
          }
          return {
              userEnteredValue: {
                stringValue: string_val
              }
            };
        }else{
          return {
              userEnteredValue: {
                stringValue: convertObjtoString(row[column]).toString()
              }
            };
        }
        
      });
      return {
        values: cells
      };
    });
  }
  
  
  function checkIsChoice(key,data){
    if(data[key].length){
      if(data[key][0]){
        if(typeof(data[key][0]) == 'object'){
          return true;
        }
      }
    }
    return false;
  }
  
  function convertObjtoString(obj){
    if(obj==undefined){
      return '';
    }
    var string = [];
    Object.keys(obj).map(key =>{
      if(obj[key]){
        string.push(key);
      }
    })
    return string.join(',');
    
  }

module.exports.maxRowCount = maxRowCount;
module.exports.buildHeaderRowRequest = buildHeaderRowRequest;
module.exports.buildRowsForData = buildRowsForData;
