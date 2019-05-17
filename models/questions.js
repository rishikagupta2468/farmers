var mongoose = require("mongoose");

var QuestionsSchema= new mongoose.Schema({
    name:String ,
    image:{type:String, default:"https://source.unsplash.com/Zm2n2O7Fph4"},
    description:String,
    created:{type:Date,default:Date.now},
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        username:String
    },
    solutions: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Solutions"
      }
  ]
});

module.exports= new mongoose.model("Questions", QuestionsSchema);