const logger = require('../util/logger');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const fetch = require('node-fetch');
const apiUtils = require('../util/apiUtils');
const globalConstant = require('../util/globalConstant');
const HttpStatus = require('http-status-codes');

const verify = (req, res, next) => {
    logger.debug('getting user info by token');
    fetch(apiUtils.createUrl(config.AUTH_SERVICE_BASE_URL,'/auth/api/dashboard'), {
        method: 'GET',
        headers: {
            'access-token': req.headers[globalConstant.TOKEN]
        }
    })
    .then(res => {
        if(res.status==HttpStatus.OK){
            return res.json();
        }else{
            return Promise.reject('not authorized');
        }
    })
    .then(data => {
        logger.debug('user info fetched');
        req.user = data;
        next();
    })
    .catch(err => {
        logger.error(`unauthorized :: ${err}`);
        res.status(HttpStatus.UNAUTHORIZED).json(
        apiUtils.getError(
        `unauthorized :: ${err}` || 'unauthorized',
        HttpStatus.UNAUTHORIZED))
    })
}

module.exports = verify;