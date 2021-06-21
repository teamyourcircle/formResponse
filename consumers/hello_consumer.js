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
          sayHello(queue,msg.content.toString());
          ch.ack(msg);
        }
      });
    });
  }).catch(console.warn);
}

const sayHello = (queue_name,payload) => {
  logger.debug('inside sayhello function');
  logger.debug(`for queue ${queue} payload is ${JSON.stringify(payload)}`);
}

module.exports = hello_consumer;
