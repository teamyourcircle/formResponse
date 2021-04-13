/* eslint-disable no-undef */
const mongoose = require('mongoose');
const logger = require('../util/logger');
mongoose.Promise = global.Promise;
const env = process.env.NODE_ENV || 'test';
const config = require('../config/config')[env];

before(done => {
    mongoose.connect(config.uri,{ useNewUrlParser: true , useUnifiedTopology: true , useCreateIndex: true});
    mongoose.connection
    .once("open",() =>{
        logger.info('connected to mongo db :: stage -> '+env);
        done();
    })
    .on("error",error => {
        logger.error('not connect to mongo db due to '+error);
    })
})


after(done => {
    mongoose.disconnect()
    .then(()=>{
        logger.info('mongo db disconnected after tests');
        done();
    })
    .catch(err => {
        logger.error('mongo db not disconnected after tests'+err);
        done(err);
    })
})