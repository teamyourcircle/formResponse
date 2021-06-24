const fetch = require('node-fetch');
const HttpStatus = require('http-status-codes');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const apiUtils = require('../util/apiUtils');
const globalConstant = require('../util/globalConstant');
const logger = require('../util/logger');

const integration_provider = (req, res, next) => {
    logger.debug('inside integration provider');
    const token = req.headers['access-token'];
    req.integration = {};
    checkOAuthIntegrator(req.body, token)
    .then(resp => resp.json())
    .then(data => {
        logger.debug('integartionList fetched');
        if(data){
            logger.debug('search refresh token');
            if(data["integartionList"].length){
                req.refresh_token = data["integartionList"][0]['refresh_token'];
                req.access_token = data["integartionList"][0]['access_token'];
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

function checkOAuthIntegrator(requestBody, token){
    const {oauth_provider, integration_id, supportive_email}=requestBody;
    let url='';
    let options={};
    logger.debug('inside check oauth integration')
    if(oauth_provider === globalConstant.GOOGLE) {
        logger.debug('hit request for google');
        const queryString = `?integration_id=${integration_id}&supportive_email=${supportive_email}`;
        url = apiUtils.createUrl(config.AUTH_SERVICE_BASE_URL,`/auth/api/user/oauthApps/byIntegrationId${queryString}`);
        options = {
            method: 'GET',
            headers: {
                'access-token': token,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }
    } else if(oauth_provider === globalConstant.DROP_BOX) {
        logger.debug('hit request for drop_box')
        url = `${config.AUTH_SERVICE_BASE_URL}/auth/api/refreshoauthAccess`;
        options = {
            method: 'PUT',
            headers: {
                'access-token': token,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                oauth_provider,
                integration_id,
                supportive_email
            })
        }
    }
    else {
        let message='no oauth provider matched'
        logger.error(message);
        return Promise.reject(message);
    }
    return fetch(url,options)
}

module.exports = integration_provider;