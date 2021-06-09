//test goes here
/* eslint-disable no-undef */
const should = require('should');
const assert = require('chai').assert;
const sinon = require("sinon");
const HttpStatus = require('http-status-codes');
const build_sheet = require('../subscribers/build_sheet');
const body_obj = require('./resources/body_obj');
const create_sheet_helper = require('../util/create_sheet_helper');

describe('functionality test',() => {
    afterEach(function () {
      sinon.restore();
    });
    it('add data to sheet Called once test', function(done) {
        let spy = sinon.spy(build_sheet, "addValueToSheet")
        build_sheet.addValueToSheet({},body_obj.sheetFunctionalityResource)
        sinon.assert.calledOnce(spy);
        done();
    })
    it('add data to sheet internal fucntions test', function(done) {
      let spy = sinon.spy(create_sheet_helper, "maxRowCount");
      let rowCount = create_sheet_helper.maxRowCount(body_obj.sheetFunctionalityResource.my_formData)
      // build_sheet.addValueToSheet({},body_obj.sheetFunctionalityResource)
      assert.equal(rowCount, 2);
      done();
  })
})