const logger = require('./logger');
const fetch = require('node-fetch');
const {google} = require('googleapis');
const apiUtils = require('../util/apiUtils');
const HttpStatus = require('http-status-codes');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

/**
 * this function will find the already created sheet present in multi-account
 * @param {*} credentials 
 * @param {*} path
 * @param {*} refresh_token
 */

 function createFolder(credentials, path, refresh_token) {
    const { google_client_id, google_client_secret, google_redirect_uri } = credentials;
    logger.debug('hit google OAuth request');
    const oauth2Client = new google.auth.OAuth2(
        google_client_id,
        google_client_secret,
        google_redirect_uri
    );
    logger.debug('set OAuth credentials');
    oauth2Client.setCredentials({ refresh_token });
    const drive = google.drive({
        version: 'v3',
        auth: oauth2Client,
    });
    var fileMetadata = {
        'name': path,
        'mimeType': 'application/vnd.google-apps.folder'
    };
    logger.debug('hit drive request for folder creation')
    drive.files.create({
    resource: fileMetadata,
    fields: 'id'
    }, function (err, file) {
        if (err) {
            const message = `folder not created :: Error : ${err}`;
            logger.debug(message);
            return Promise.reject(message);
        } else {
            logger.debug(`folder created :: ${file}`);
            return Promise.resolve({ file });
        }
    });
 }

 module.exports.createFolder = createFolder;