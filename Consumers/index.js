/*
* here we define the consumers
* integration_id and queue is same things
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
    {
        queue: "google-sheets",
        consumer: require('./google_sheet'),
        tags: ["google","sheet"] ,
        name: "google_sheet_consumer",
        display_name: "Google Sheet",
        feature_flag: true,
        logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Google_Sheets_logo.svg",
        description: "on incoming new response we will create a new row in connected spreadsheet"
    }
]