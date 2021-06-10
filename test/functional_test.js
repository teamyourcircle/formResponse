let create_sheet_helper = require('../util/create_sheet_helper');
let resources = require('../test/resources/body_obj');
const { assert } = require('chai');

describe('test for build sheet functionality functions',() => {
  let maxRowCount;
  let rows;
  let request;
  it('should test functions used in add_value_to_sheet: maxRowCount',function(done){
    maxRowCount = create_sheet_helper.maxRowCount(resources.sheetFunctionalityResource.my_formData);
    assert.strictEqual(maxRowCount,13);
    done();
  })

  it('should test functions used in add_value_to_sheet: buildRowsForData',function(done){
    let {COLUMNS,my_formData} = resources.sheetFunctionalityResource
    rows = create_sheet_helper.buildRowsForData(maxRowCount+1,COLUMNS,my_formData);
    assert.strictEqual(rows.length,maxRowCount+1);
    done();
  })

  it('should test functions used in add_value_to_sheet: buildHeaderRowRequest',function(done){
    let {COLUMNS,my_formData,sheetId} = resources.sheetFunctionalityResource
    request = create_sheet_helper.buildHeaderRowRequest(sheetId,COLUMNS,my_formData);
    assert.strictEqual('updateCells',Object.keys(request)[0])
    done();
  })

})