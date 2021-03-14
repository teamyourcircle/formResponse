/*
* here we define the consumers
*/
module.exports = [
    {
        queue: "queue",
        consumer: require('./hello_consumer'),
        tags: ["hello","test"] 
    },
]