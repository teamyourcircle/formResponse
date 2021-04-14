const logger = require('../util/logger');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
var open = require('amqplib').connect(config.RABBIT_MQ_URL);
const hello_consumer = async (queue, isNoAck = false, durable = false, prefetch = null) => {
// Consumer
open.then(function(conn) {
    return conn.createChannel();
  }).then(function(ch) {
    return ch.assertQueue(queue).then(function() {
      return ch.consume(queue, function(msg) {
        if (msg !== null) {
          logger.info(`recieving payload from the queue :: ${queue}`);
          logger.debug(msg.content.toString());
          ch.ack(msg);
        }
      });
    });
  }).catch(console.warn);
}
module.exports = hello_consumer;
