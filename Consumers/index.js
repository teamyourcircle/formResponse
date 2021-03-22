/*
* here we define the consumers
*/
module.exports = [
    {
        queue: "hello",
        consumer: require('./hello_consumer'),
        tags: ["hello","test"] ,
        name: "hello_consumer",
        display_name: "Hello Consumer",
        feature_flag: true,
        logo: "https://i.ibb.co/DY0Zc25/android-chrome-512x512.png",
        description: `this is for testing purpose so if any form linked with this consumer's queue ,then on new response that response payload is shown on console`
    },
]