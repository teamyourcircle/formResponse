const express = require('express');
const mongoose = require('mongoose');
const swaggerRoute = require('./Swagger/swagger');
const formInforoute = require('./Routes/form_info');
const cors = require('cors');
const formRoute = require('./Routes/routes');

const app = express();
app.use(cors());


const port = process.env.port || 5002;
const uri = process.env.URI ;
console.log('FormResponse service Activated..!! on port '+port);
//tester middleware
app.use(express.json());
const testFun = require('./MiddleWareFun/auth');
app.use(testFun);
app.use('/form/api',formInforoute);
app.use('/api', formRoute);
app.use('/form/developer',swaggerRoute);

// const client = MongoClient(uri);
mongoose.connect( uri, {
    useNewUrlParser:true, useUnifiedTopology: true
}, () => {
    console.log('Connected to mongoDB..!');
});

app.listen(port);