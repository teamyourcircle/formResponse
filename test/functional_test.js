//test goes here
/* eslint-disable no-undef */
const should = require('should');
const sinon = require("sinon");
const HttpStatus = require('http-status-codes');
const build_sheet = require('../subscribers/build_sheet');
const body_obj = require('./resources/body_obj');
const create_sheet_helper = require('../util/create_sheet_helper');
const assert = require('assert');
const { Http } = require('winston/lib/winston/transports');

describe('functionality test',() => {
    afterEach(function () {
      sinon.restore();
    });
    it('add data to sheet test', function(done) {
        let mocked = sinon.mock(build_sheet)
        let expected = mocked.expects("addValueToSheet")
        expected.exactly(1);
        let stub2= sinon.stub(create_sheet_helper, "maxRowCount")
        stub2.returns(1000)
        let stub3 = sinon.stub(create_sheet_helper, "buildRowsForData")
        stub3.returns({values:8 });
        let stub4 = sinon.stub(create_sheet_helper,"buildHeaderRowRequest")
        stub4.returns({updateCells: {
            start: {
              sheetId: 118,
              rowIndex: 0,
              columnIndex: 0
            },
            rows: [
              {
                values: 8
              }
            ],
            fields: 'userEnteredValue,userEnteredFormat.textFormat.bold'
          }
        });
        build_sheet.authorize(build_sheet.addValueToSheet, body_obj.sheetFunctionalityResource);
        mocked.verify();
        done()
    })
    it('add data to sheet test 2', function(done) {
      let stub2= sinon.stub(create_sheet_helper, "maxRowCount")
      stub2.withArgs(body_obj.sheetFunctionalityResource.my_formData)
      stub2.returns(3)
      let stub3 = sinon.stub(create_sheet_helper, "buildRowsForData")
      stub3.returns({values:8 });
      let stub4 = sinon.stub(create_sheet_helper,"buildHeaderRowRequest")
      stub4.returns({updateCells: {
          start: {
            sheetId: 118,
            rowIndex: 0,
            columnIndex: 0
          },
          rows: [
            {
              values: 8
            }
          ],
          fields: 'userEnteredValue,userEnteredFormat.textFormat.bold'
        }
      });
      build_sheet.authorize(build_sheet.addValueToSheet, body_obj.sheetFunctionalityResource);
      done();
  })
})