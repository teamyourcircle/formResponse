const express = require('express');
const mongoose = require('mongoose');
// const {MongoClient} = require('mongodb');
const cors = require('cors');
// const redis = require('redis');

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

app.use('/api', formRoute);

// const client = MongoClient(uri);
mongoose.connect( uri, {
    useNewUrlParser:true, useUnifiedTopology: true
}, () => {
    console.log('Connected to mongoDB..!');
});

app.listen(port);