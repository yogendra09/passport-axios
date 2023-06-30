
var mongoose = require("mongoose");

const plm = require("passport-local-mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/passAuth");

const userSchema = mongoose.Schema({
  username:String,
  name:String,
  image:{
    type:String,
    default:'./user.png'
  },
  like:{
    type:Array,
    default:[]
  },
  post:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'post'
  }]
  ,
  password:String
})

userSchema.plugin(plm);

module.exports = mongoose.model("user",userSchema);
