const swaggerRoute = require('../swagger/swagger');
const formInforoute = require('../routes/form_info');
const responseInforoute = require('../routes/response_info');
const consumerInfoRoute = require('../routes/consumer');
const responseSubmitRoute=require('../routes/response');
const thirdPartyRoute = require('../routes/third_party_account');
const health = require('../routes/health')
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use('/form/api',[formInforoute,consumerInfoRoute,health,responseInforoute,responseSubmitRoute,thirdPartyRoute]);
app.use('/form/developer',swaggerRoute);


module.exports = app;