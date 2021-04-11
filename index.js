const express = require('express');
const mongoose = require('mongoose');
const swaggerRoute = require('./swagger/swagger');
const formInforoute = require('./routes/form_info');
const consumerInfoRoute = require('./routes/consumer');
const cors = require('cors');
const app = express();
const formRoute = require('./routes/routes');
const port = process.env.port || 5002;
const uri = process.env.URI ;
const consumers = require('./consumers');
var socket = require('socket.io');
const redis = require('redis');
const subscriber = redis.createClient();
const busses = require('./subscribers');
const filter_function_by_busname = require('./subscribers/subscriber');
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
const testFun = require('./middleWareFun/auth');
app.use(testFun);
app.use('/form/api',[formInforoute,consumerInfoRoute]);

const socketHandlerMiddleware = (req,res,next) => {
    if(req.method=='POST'){
        const roomId = req.body.form_id;  
        io.to(roomId).emit('new-response');
    }
    next();
}
app.use('/api', [socketHandlerMiddleware,formRoute]);
app.use('/form/developer',swaggerRoute);

/*
*starting mongo client
*/
mongoose.connect( uri, {
    useNewUrlParser:true, useUnifiedTopology: true
}, () => {
    console.log('Connected to mongoDB..!');
});
/*
*starting the consumers
*/

(async ()=>{
    consumers.map(c =>{
        c.consumer(c.queue);
    })
  })();

/*
* socket connection handler
*/
io.on("connection", socket => {
    socket.on("join", async room => {
    console.log('join the room :: '+room);
      socket.join(room);
    })
})

/*
* running the functionality on new message
*/
subscriber.on("message",function(channel,msg){
    filter_function_by_busname(channel,msg);
  }); 
/*
* subscribing the channels
*/
busses.map(b => {
    subscriber.subscribe(b.bus_name);
})

