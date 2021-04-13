const express = require('express');
const router = express.Router();
const { version } = require('../package.json');
const logger = require('../util/logger');
const env = process.env.NODE_ENV || 'development';

router.get('/health', (req,res)=>{
    logger.debug(`inside health api :: stage -> ${env}`);
    var health_status = `form_response service is running successfully ${version} :: stage -> ${env}`;
    res.json(health_status);
})

module.exports = router;