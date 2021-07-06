require('dotenv').config()
const logger = require("../util/logger");
const env=process.env.NODE_ENV || 'development';
const config=require('../config/config')[env]
const open=require('amqplib').connect(config.RABBIT_MQ_URL);
const fetch = require('node-fetch');
const nodeBase64 = require('nodejs-base64-converter')

const webhook_consumer= async (queue, isNoAck = false, durable = false, prefetch = null)=>{
    open.then((conn)=>{
        return conn.createChannel()
    })
    .then((ch)=>{
        return ch.assertQueue(queue)
            .then(()=>{
                return ch.consume(queue,(msg)=>{
                        if(msg){
                            logger.debug(`receiving payload from queue : ${queue}`)
                            webhook_worker(queue,msg.content.toString())
                            ch.ack(msg);
                        }
                    })
            })
    })
    .catch(console.warn)
}

const webhook_worker=(queue,payload)=>{
    logger.debug('inside webhook worker function')
    payload=JSON.parse(payload);
    let base64encode = nodeBase64.encode(`${config.basic_auth_username}:${config.basic_auth_password}`);
    const url=`${config.AUTH_SERVICE_BASE_URL}/auth/api/webhook/provider/init`;
    const options={
        method:'POST',
        headers:{
            'Authorization' : `Basic ${base64encode}`,
            'Content-Type' : 'application/json'
        },
        body:JSON.stringify({id:payload.formId,request_payload:payload})
    }
    fetch(url,options)
    .then((res)=>{
        if(res.ok){
            return res.json()
        }
        else{
            return Promise.reject('cannot able to init webhook provider')
        }
    })
    .then((result)=>{
        logger.debug(`Result from webhook init request :: ${result.message}`)
    })
    .catch((err)=>{
        logger.debug(`Error :: ${err}`)
    })
}

module.exports = webhook_consumer;
module.exports.webhook_worker=webhook_worker;