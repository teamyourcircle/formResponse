const mongoose = require('mongoose');
const app = require('./api');
const env = process.env.NODE_ENV || 'development';
const config = require('./config/config')[env];
const consumers = require('./consumers');
var socket = require('socket.io');
const redis = require('redis');
const subscriber = redis.createClient();
const busses = require('./subscribers');
const filter_function_by_busname = require('./subscribers/subscriber');
const logger = require('./util/logger');
const globalConstant = require('./util/globalConstant');
const formRoute = require('./routes/response');
/**
 * start the server
 */
var server = app.listen(config.port, function(){
    logger.info(`listening for requests on port ${config.port} :: stage -> ${env}`);
});
const io = socket(server, {
    cors: {
        origin: '*',
    }
});
/*
*starting mongo client
*/
mongoose.connect( config.uri, 
    { useNewUrlParser: true , useUnifiedTopology: true , useCreateIndex: true}
, (err,res) => {
    if(err){
        logger.error(`not connected to mongo db due to ${err}`);
    }else{
        logger.info('connected to mongo db --> '+env);
    }
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
    socket.on(globalConstant.JOIN, async room => {
    logger.info('joining the room :: roomID -> '+room);
      socket.join(room);
    })
})
/*
* running the functionality on new message
*/
subscriber.on(globalConstant.MESSAGE,function(channel,msg){
    filter_function_by_busname(channel,msg);
  }); 
/*
* subscribing the channels
*/
busses.map(b => {
    subscriber.subscribe(b.bus_name);
})
/**
 * this will emit the message on new response
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const socketHandlerMiddleware = (req,res,next) => {
    if(req.method=='POST'){
        const roomId = req.body.form_id;  
        io.to(roomId).emit('new-response');
    }
    next();
}
app.use('/api', [socketHandlerMiddleware,formRoute]);
