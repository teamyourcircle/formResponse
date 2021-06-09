const swaggerRoute = require('../swagger/swagger');
const formInforoute = require('../routes/form_info');
const responseInforoute = require('../routes/response_info');
const consumerInfoRoute = require('../routes/consumer');
const responseSubmitRoute=require('../routes/response');
const health = require('../routes/health')
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use('/form/api',[formInforoute,consumerInfoRoute,health,responseInforoute,responseSubmitRoute]);
app.use('/form/developer',swaggerRoute);


module.exports = app;