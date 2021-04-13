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

module.exports = socketHandlerMiddleware;