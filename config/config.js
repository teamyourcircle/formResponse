require('dotenv').config();

module.exports= {
    development: {
        uri: process.env.URI,
        port:process.env.PORT || 5002 ,
        logDirectory: process.env.LOG_DIRECTORY,
    },
    test:{
        uri: process.env.URI,
        port:process.env.PORT || 5002,
        logDirectory: process.env.LOG_DIRECTORY,
    }
}

