const mongoose=require('mongoose');

const responseSchema=new mongoose.Schema({
    formId:{
        type:Number,
        min:1,
        required:true
    },
    responseBy:{
        type: String,
        required:true,
    },
    sections:{
        type:Array,
        required:true,
        min:1
    }
});
module.exports=mongoose.model('resp',responseSchema);