var open = require('amqplib').connect('amqp://localhost:5672');
const logger = require('../util/logger');
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
