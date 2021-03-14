var open = require('amqplib').connect('amqp://localhost:5672');
const publishToQueue = async (queue, payload, durable = false) => {
    open.then(function(conn) {
        return conn.createChannel();
      }).then(function(ch) {
        return ch.assertQueue(queue).then(function() {
            console.log('sending payload ...');
            console.log(payload);
          return ch.sendToQueue(queue, Buffer.from(JSON.stringify(payload)));
        });
      }).catch(console.warn);
}
module.exports = publishToQueue;
