const mongoose=require('mongoose');
//const mongooseUniqueValidator=require('mongoose-unique-validator');

const responseSchema=new mongoose.Schema({

    formId:{
        type:Number,
        min:1,
        required:true
    },

    responseBy:{
        type:String,
        required:true,
        min:6,
        max:100,
        //unique:true
    },

    sections:{
        type:Array,
        required:true,
        min:1
    }
});

//responseSchema.plugin(mongooseUniqueValidator);

module.exports=mongoose.model('resp',responseSchema);
/*const resp=mongoose.model('resp',responseSchema);

const m=new resp;
m.formId=32;
m.responseBy='run@gmail.com';
m.sections=[[1],[2]];
console.log(m);
*/