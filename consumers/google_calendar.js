const logger = require('../util/logger');
const {google} = require('googleapis');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
var open = require('amqplib').connect(config.RABBIT_MQ_URL);
const {get_credentials,authorize} = require('./google_sheet');
const {helper_module}=require('@teamyourcircle/form-validator')
const encode = helper_module.convertStringToVariable;
const google_calendar = async (queue, isNoAck = false, durable = false, prefetch = null) => {
// Consumer
open.then(function(conn) {
    return conn.createChannel();
  }).then(function(ch) {
    return ch.assertQueue(queue).then(function() {
      return ch.consume(queue, function(msg) {
        if (msg !== null) {
          logger.info(`recieving payload from the queue :: ${queue}`);
          initiateCalendar(queue,msg.content.toString());
          ch.ack(msg);
        }
      });
    });
  }).catch(logger.warn);
}
/*
* global variable for calendar info
*/
var _template;
const initiateCalendar = (queue,_payload) => {
  logger.debug('inside initiateCalendar function');
  let {payload,template} = JSON.parse(_payload);
  _template = template;
  let formId = payload.formId;
  get_credentials()
    .then(credentials =>{
        authorize(add_event_to_calendar, formId, queue, payload,credentials)
    })
    .catch(err=>{
        logger.error(err);
        logger.error('not able to add event on calendar');
    })
}
/**
 * this function will add the data
 * @param {*} auth 
 * @param {*} payload 
 */
const add_event_to_calendar = (auth,payload,document_info) =>{
  logger.debug('add event to google calendar');
  //available info [_template, payload, document_info]
  let param_values = makeConsumerResource(payload);
  let data_for_third_party = getConsumerResourcesForThirdParty(param_values,_template);
  create_event(data_for_third_party,auth);
}
/**
 * {title: 'consultancy and cosult for pain in back',description: 'meet for: cosult for pain in back'}
 * @param {*} data_for_third_party 
 */
const create_event = (data_for_third_party,auth) => {
  const {start_date_time,title,description,end_date_time,location} = data_for_third_party;
  const calendar = google.calendar({ version: 'v3', auth});
  let eventStartTime = new Date(start_date_time);
  let eventEndTime = new Date(end_date_time);
  const event = {
    summary: title,
    location,
    description,
    start: {
      dateTime: eventStartTime,
      timeZone: 'Asia/Calcutta',
    },
    end: {
      dateTime: eventEndTime,
      timeZone: 'Asia/Calcutta',
    },
  }
  calendar.freebusy.query(
    {
      resource: {
        timeMin: eventStartTime,
        timeMax: eventEndTime,
        timeZone: 'Asia/Calcutta',
        items: [{ id: 'primary' }],
      },
    },
    (err, res) => {
      if (err) return logger.error('not able to add event due to err: ', err)
      const eventArr = res.data.calendars.primary.busy;
      if (eventArr.length === 0)
      {
        return calendar.events.insert(
          { calendarId: 'primary', resource: event },
          err => {
            if (err) return logger.error('error in event insertion:', err)
            return logger.debug('Calendar event successfully created.')
          }
        )
      }else{
        return logger.debug(`event conflicts occur`)
      }
    }
  )
}

module.exports = google_calendar;

/**
 * eg. responsePayload - 
 * @param {*} responsePayload 
 */
const makeConsumerResource = (responsePayload) =>{
  let paramValues = {};
  responsePayload.sections.map(s => {
    s.map(f =>{
      let label = Object.keys(f)[1];
      let encodedLabel = encode(label);
      let labelVal = f[label];
      paramValues = {...paramValues,[encodedLabel]: labelVal}
    })
  })
  return paramValues;
}
/** 
 * eg. consumerResources==_template - {"title":"{{my_title}}"}
 * @param {*} paramValues 
 * @param {*} consumerResources 
 */
const getConsumerResourcesForThirdParty = (paramValues,consumerResources) => {
  let updatedResourcses = consumerResources;
  for(var key in consumerResources){
    let newResourceValForKey = consumerResources[key];
    for(var param_key in paramValues){
      newResourceValForKey=newResourceValForKey.replace(`{{${param_key}}}`,paramValues[param_key]);
    }
    updatedResourcses = {...updatedResourcses, [key]: newResourceValForKey};
  }
  return updatedResourcses;
}