const express = require('express');
const mongoose = require('mongoose');
// const {MongoClient} = require('mongodb');
const cors = require('cors');
// const redis = require('redis');

const formRoute = require('./Routes/routes');

const app = express();
app.use(cors());
console.log('FormResponse service Activated..!!');

const port = process.env.port || 6000;
const uri = "https://mongodb+srv://hardikshah:8630877372@hs@mycluster.hb4pm.mongodb.net/Test?retryWrites=true&w=majority;"

app.use('/api/meet', formRoute);

// const client = MongoClient(uri);
mongoose.connect( uri, {
    useNewUrlParser:true, useUnifiedTopology: true
}, () => {
    console.log('Connected to mongoDB..!');
});

app.listen(port);