
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const YAML = require('yamljs');
const swaggerDocument = YAML.load(path.join(__dirname, '/swagger.yaml'));
const router = require('express').Router();
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
swaggerDocument.host=config.FORM_RESPONSE_BASE_URL;
router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument));

module.exports = router;