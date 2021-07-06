const google_sheet_consumer = require('../consumers/google_sheet');
const google_caledar_consumer = require('../consumers/google_calendar');
const webhook_worker = require('../consumers/webhook');
const resource = require('./resources/body_obj')
const chai = require('chai');
const HttpStatus = require('http-status-codes');
const assertArrays = require('chai-arrays');
const {expect} = require('chai');
const { assert } = require('chai');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const nock = require('nock');
chai.use(assertArrays);
describe('test for add row to sheet functions',function(){
    it('should get the desired output from: payload_expand',function(done){
        let value = google_sheet_consumer.payload_expand(resource.consumerPayloadSheet);
        expect(value).to.be.equalTo(['ritu','female']);
        done();
    })

    it('should get the desired output from: get_choices',function(done){
        let choiceObject = google_sheet_consumer.get_choices({
            "male": 0,
            "female": 1
        });
        assert.strictEqual(choiceObject,'female')
        done();
    })

    it('should get the desired output from: set_integration_doc',function(done){
        const setup={
            integration_id: 'google-sheets',
            form_id: 118
        } 
        nock(config.AUTH_SERVICE_BASE_URL).get(`/auth/api/oauth/active/${setup.integration_id}?key=${setup.form_id}`)
        .reply(HttpStatus.OK,resource.activeOAuthRes);
        google_sheet_consumer.set_integration_doc(setup.form_id,setup.integration_id)
        .then(data => {
            data.should.have.keys('additional_info','refresh_token','email')
            done();
        })
        .catch(err => {
            done(err);
        })
    })

})

describe('test the payload creator with template',function () {
    let encodedPayload;
    it('test the function: makeConsumerResource',function(done){
        encodedPayload = google_caledar_consumer.makeConsumerResource(resource.newpayloadForTemplateExchange);
        encodedPayload.should.have.keys('title_here','description_here');
        encodedPayload.should.have.value('title_here','consultancy')
        done();
    })
    it('test the function: getConsumerResourcesForThirdParty',function(done){
        let valForThirdParty = google_caledar_consumer.getConsumerResourcesForThirdParty(encodedPayload,resource.consumerResources);
        valForThirdParty.should.have.keys('title');
        valForThirdParty.should.have.value('title','consultancy and cosult for pain in back');
        valForThirdParty.should.have.value('description','meet for: cosult for pain in back');
        done();
    })

})

describe('test suite for webhook consumer', () => {
    it('test for the function :: webhook_worker',(done)=>{
        nock(`${config.AUTH_SERVICE_BASE_URL}`)
        .post('/auth/api/webhook/provider/init')
        .reply(HttpStatus.OK,resource.replyFromInitApi);

        webhook_worker('webhook',JSON.stringify(resource.fakePayloadForWebhook));
        done()
    })
})

