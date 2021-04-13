const swaggerRoute = require('../swagger/swagger');
const formInforoute = require('../routes/form_info');
const consumerInfoRoute = require('../routes/consumer');
const formRoute = require('../routes/routes');
const health = require('../routes/health')
const express = require('express');
const app = express();
const cors = require('cors');
const handler = require('../middleWareFun/socket_handler');

app.use(cors());
app.use(express.json());
app.use('/form/api',[formInforoute,consumerInfoRoute,health]);
app.use('/api', [handler,formRoute]);
app.use('/form/developer',swaggerRoute);


module.exports = app;