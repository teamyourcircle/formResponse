require('dotenv').config();

module.exports= {
    development: {
        uri: process.env.URI,
        port:process.env.PORT || 5002 ,
        logDirectory: process.env.LOG_DIRECTORY,
        AUTH_SERVICE_BASE_URL: process.env.AUTH_SERVICE_BASE_URL,
        FORM_SERVICE_BASE_URL: process.env.FORM_SERVICE_BASE_URL,
        FORM_RESPONSE_BASE_URL: process.env.FORM_RESPONSE_BASE_URL,
        RABBIT_MQ_URL: process.env.RABBIT_MQ_URL,
        basic_auth_username:process.env.BASIC_AUTH_USERNAME,
        basic_auth_password:process.env.BASIC_AUTH_PASSWORD,
        redis_host:process.env.REDIS_HOST,
        redis_port:process.env.REDIS_PORT,
        redis_password:process.env.REDIS_PASSWORD
    },
    test:{
        uri: process.env.URI,
        port:process.env.PORT || 5002,
        logDirectory: process.env.LOG_DIRECTORY,
        AUTH_SERVICE_BASE_URL: process.env.AUTH_SERVICE_BASE_URL,
        FORM_SERVICE_BASE_URL: process.env.FORM_SERVICE_BASE_URL,
        FORM_RESPONSE_BASE_URL: process.env.FORM_RESPONSE_BASE_URL,
        RABBIT_MQ_URL: process.env.RABBIT_MQ_URL,
        basic_auth_username:process.env.BASIC_AUTH_USERNAME,
        basic_auth_password:process.env.BASIC_AUTH_PASSWORD,
    }
}

