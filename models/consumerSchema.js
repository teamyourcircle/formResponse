const mongoose=require('mongoose');

var queueSchema = new mongoose.Schema(
    {
      queueName: { type: String,required: true},
      template: {type: Object}
    },
    { _id: false }
  );
const consumerSchema=new mongoose.Schema({
    formId:{
        type:Number,
        min:1,
        required:true,
        unique: true
    },
    queue_list_details:[queueSchema]
});
module.exports=mongoose.model('consumers',consumerSchema);