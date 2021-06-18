const fetch = require('node-fetch');
const HttpStatus = require('http-status-codes');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const apiUtils = require('../util/apiUtils');
const globalConstant = require('../util/globalConstant');
const google_sheet = require('../consumers/google_sheet');
const logger = require('../util/logger');

const credential_provider = (req, res, next) => {
    logger.debug('inside credential provider');
    let message='';
    google_sheet.get_credentials()
    .then(data => {
        if(data && !data.error){
            logger.debug('credentials fetched');
            req.body.credentials = data;
            next();
        }
        else {
            message = 'credentials not found'
            logger.debug(message)
            return Promise.reject(message)
        }
    })
    .catch(err =>{
        message='credentials not fetched';
        logger.error(message);
        res.json(apiUtils.getError(message,HttpStatus.FORBIDDEN));
    })
}

module.exports = credential_provider;