var mongoose = require("mongoose");

var experienceSchema = mongoose.Schema({
    description: String,
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        username:String
    },
    image:{type:String, default:"https://source.unsplash.com/Zm2n2O7Fph4"},
    title: String
});

module.exports = mongoose.model("experience", experienceSchema);