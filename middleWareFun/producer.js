const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
var open = require('amqplib').connect(config.RABBIT_MQ_URL);
const logger = require('../util/logger');
const globalConstant = require('../util/globalConstant');
const publishToQueue = async (queue_template, payload, durable = false) => {
    let queue = queue_template[globalConstant.QUEUE_NAME];
    let {template} = queue_template;
    let payload_with_template;
    open.then(function(conn) {
        return conn.createChannel();
      }).then(function(ch) {
        return ch.assertQueue(queue).then(function() {
          logger.debug(`insert payload to queue :: ${queue}`);
          if(!template){
            return ch.sendToQueue(queue, Buffer.from(JSON.stringify(payload)));
          }else{
            payload_with_template = {payload, template};
            return ch.sendToQueue(queue, Buffer.from(JSON.stringify(payload_with_template)));
          }
        });
      }).catch(console.warn);
}
module.exports = publishToQueue;
