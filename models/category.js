var mongoose = require("mongoose");

var CategorySchema= new mongoose.Schema({
    name:String ,
    questions: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Questions"
      }
   ]
});

module.exports= new mongoose.model("Category", CategorySchema);