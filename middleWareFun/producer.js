const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
var open = require('amqplib').connect(config.RABBIT_MQ_URL);const logger = require('../util/logger');
const publishToQueue = async (queue, payload, durable = false) => {
    open.then(function(conn) {
        return conn.createChannel();
      }).then(function(ch) {
        return ch.assertQueue(queue).then(function() {
            logger.debug(`insert payload to queue :: ${queue}`);
          return ch.sendToQueue(queue, Buffer.from(JSON.stringify(payload)));
        });
      }).catch(console.warn);
}
module.exports = publishToQueue;
