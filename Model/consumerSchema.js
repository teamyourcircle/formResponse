const mongoose=require('mongoose');

const consumerSchema=new mongoose.Schema({
    formId:{
        type:Number,
        min:1,
        required:true,
        unique: true
    },
    queue:{
        type:Array,
        required: true
    }

});
module.exports=mongoose.model('consumers',consumerSchema);