
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const YAML = require('yamljs');
const swaggerDocument = YAML.load(path.join(__dirname, '/swagger.yaml'));
const router = require('express').Router();

router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument));

module.exports = router;