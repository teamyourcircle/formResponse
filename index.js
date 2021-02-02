const express = require('express');
const mongoose = require('mongoose');
const swaggerRoute = require('./Swagger/swagger');
const formInforoute = require('./Routes/form_info');
const cors = require('cors');
const app = express();
const formRoute = require('./Routes/routes');
const port = process.env.port || 5002;
const uri = process.env.URI ;
var socket = require('socket.io');
var server = app.listen(port, function(){
    console.log(`listening for requests on port ${port}`);
});
const io = socket(server, {
    cors: {
        origin: '*',
    }
});
app.use(cors());
//tester middleware
app.use(express.json());
const testFun = require('./MiddleWareFun/auth');
app.use(testFun);
app.use('/form/api',formInforoute);

const socketHandlerMiddleware = (req,res,next) => {
    if(req.method=='POST'){
        io.sockets.emit('new-response');
    }
    next();
}
app.use('/api', [socketHandlerMiddleware,formRoute]);
app.use('/form/developer',swaggerRoute);

// const client = MongoClient(uri);
mongoose.connect( uri, {
    useNewUrlParser:true, useUnifiedTopology: true
}, () => {
    console.log('Connected to mongoDB..!');
});

/*
* socket connection handler
*/
io.on('connection', (socket) =>{
    console.log('user connected');
    socket.on('disconnect', (socket) =>{
      console.log('user disconnected');
    })
})
