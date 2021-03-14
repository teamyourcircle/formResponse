var open = require('amqplib').connect('amqp://localhost:5672');
const hello_consumer = async (queue, isNoAck = false, durable = false, prefetch = null) => {
// Consumer
open.then(function(conn) {
    return conn.createChannel();
  }).then(function(ch) {
    return ch.assertQueue(queue).then(function() {
      return ch.consume(queue, function(msg) {
        if (msg !== null) {
          console.log(msg.content.toString());
          ch.ack(msg);
        }
      });
    });
  }).catch(console.warn);
}

//module.exports = hello_consumer;

hello_consumer("tasks")