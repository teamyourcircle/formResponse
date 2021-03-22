/*
* here we define the consumers
*/
module.exports = [
    {
        queue: "hello",
        consumer: require('./hello_consumer'),
        tags: ["hello","test"] ,
        name: "hello_consumer"
    },
]