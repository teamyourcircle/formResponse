const fetch = require('node-fetch');
const HttpStatus = require('http-status-codes');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const apiUtils = require('../util/apiUtils');
const globalConstant = require('../util/globalConstant');
const logger = require('../util/logger');

const refresh_token_provider = (req, res, next) => {
    logger.debug('inside refresh token provider');
    const token = req.headers['access-token'];
    const { supportive_email } = req.body;
    const queryString = `?integration_id=${globalConstant.INTEGRATION_ID}&supportive_email=${supportive_email}`;
    const url = apiUtils.createUrl(config.AUTH_SERVICE_BASE_URL,`/auth/api/user/oauthApps/byIntegrationId${queryString}`);
    let options = {
        method: 'GET',
        headers: {
            'access-token': token,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }
    logger.debug('request for refresh token');
    fetch(url, options)
    .then(resp => resp.json())
    .then(data => {
        logger.debug('integartionList fetched');
        if(data){
            logger.debug('search refresh token');
            if(data["integartionList"].length){
                req.refresh_token = data["integartionList"][0]['refresh_token'];
                req.oauthBody=data["integartionList"][0];
            }
            else{
                logger.debug(' refresh token not found');
                return Promise.reject('refresh token not found');
            }
        } else {
            logger.debug(data);
            return Promise.reject(data);
        }
    })
    .then(() => {
        logger.debug('refresh token fetched');
        next();
    })
    .catch(err => {
        logger.error('internal server error :: '+err);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
        apiUtils.getError(
        'internal server error'+err,
        HttpStatus.INTERNAL_SERVER_ERROR))
    })
}

module.exports = refresh_token_provider;