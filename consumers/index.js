/*
* here we define the consumers
* integration_id and queue is same things
*/
module.exports = [
    {
        queue: "hello",
        consumer: require('./hello_consumer'),
        tags: ["hello","test"] ,
        params: [],
        actions: ["print the new response payload to console"],
        name: "hello_consumer",
        display_name: "Hello Consumer",
        authRequired: false,
        feature_flag: true,
        logo: "https://img.icons8.com/fluent/48/000000/test.png",
        description: `this is for testing purpose so if any form linked with this consumer's queue ,then on new response that response payload is shown on console`
    },
    {
        queue: "google-sheets",
        consumer: require('./google_sheet'),
        params: [],
        tags: ["google","sheet"] ,
        actions: ["add the new row in connected spreadsheet"],
        name: "google_sheet_consumer",
        display_name: "Google Sheet",
        authRequired: true,
        feature_flag: true,
        logo: "https://img.icons8.com/color/48/000000/google-sheets.png",
        description: "on incoming new response we will create a new row in connected spreadsheet"
    },
    {
        queue: "google-calendar",
        consumer: require('./google_calendar'),
        params:[
            {
                label: "title",
                type:  "text",
                description: "event title",
                required: true
            },
            {
                label: "start_date_time",
                type: "datetime",
                description: "event starting date-time",
                required: true
            },
            {
                label: "end_date_time",
                type: "datetime",
                description: "event end date-time",
                required: false
            },
            {
                label: "description",
                type: "text",
                description: "event description",
                required: false
            },
            {
                label: "location",
                type: "text",
                description: "event location",
                required: false
            }
        ],
        tags: ["google","calendar","management"] ,
        actions: ["add new event on google calendar"],
        name: "google_calendar_consumer",
        display_name: "Google Calendar",
        authRequired: true,
        feature_flag: true,
        logo: "https://img.icons8.com/fluent/48/000000/google-calendar--v2.png",
        description: "on incoming new response we will create a new event on connected google calendar"
    },
    {
        queue: "webhook",
        consumer: require('./webhook'),
        params: [],
        tags: ["webhook"] ,
        actions: ["create a webhook init request"],
        name: "webhook_consumer",
        display_name: "Webhook",
        authRequired: false,
        feature_flag: true,
        description: "on incoming new response we will initialize a delivery request on given endpoint"
    }
]