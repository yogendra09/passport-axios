
 const mongoose = require('mongoose');

  const postSchema = mongoose.Schema({
    post:String,
    like:{
        type:Array,
        default:[]
    },
    userId:{type:mongoose.Schema.Types.ObjectId,ref:'user'}
  })

  module.exports = mongoose.model('post',postSchema);