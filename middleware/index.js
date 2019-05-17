var Solutions = require("../models/solutions");
var Questions = require("../models/questions");
var Experience = require("../models/experience");
module.exports = {
    isLoggedIn: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash("error", "You must be signed in to do that!");
        res.redirect("/login");
    },
    checkUserQuestion: function(req, res, next){
        if(req.isAuthenticated()){
            Questions.findById(req.params.id, function(err, question){
                if(err){
                    console.log(err);
                }
              if(question.author.id.equals(req.user._id)){
                  next();
              } else {
                  req.flash("error", "You don't have permission to do that!");
                  console.log("BADD!!!");
                  res.redirect("/");
              }
            });
        } else {
            req.flash("error", "You need to be signed in to do that!");
            res.redirect("/login");
        }
    },
    checkUserSolution: function(req, res, next){
        console.log("YOU MADE IT!");
        if(req.isAuthenticated()){
            Solutions.findById(req.params.id, function(err, solution){
                if(err){
                    res.redirect("/");
                }
              if(solution.author.id.equals(req.user._id)){
                  next();
              } else {
                  req.flash("error", "You don't have permission to do that!");
                  res.redirect("/category/" + req.params.id);
              }
            });
        } else {
            req.flash("error", "You need to be signed in to do that!");
            res.redirect("login");
        }
    },
    checkUserExperience: function(req, res, next){
        if(req.isAuthenticated()){
            Experience.findById(req.params.id, function(err, exp){
                if(err){
                    res.redirect("/experience/"+req.params.id);
                }
               if(exp.author.id.equals(req.user._id)){
                   next();
               } else {
                   req.flash("error", "You don't have permission to do that!");
                   console.log("BADD!!!");
                   res.redirect("/experience/"+req.params.id);
               }
            });
        } else {
            req.flash("error", "You need to be signed in to do that!");
            res.redirect("/login");
        }
    }
}