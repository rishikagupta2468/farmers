var mongoose = require("mongoose"),
passportLocalMongoose=require("passport-local-mongoose");


var UserSchema= new mongoose.Schema({
    name:  {type:String,unique:false},
    password:  String,
    username   :  String,
});


UserSchema.plugin(passportLocalMongoose);
module.exports=  mongoose.model("User", UserSchema);

