var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    flash       = require("connect-flash"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Category  = require("./models/category"),
    Questions  = require("./models/questions"),
    Solutions  = require("./models/solutions"),
    // seedDB      = require("./seed"),
    User        = require("./models/user"),
    middleware = require("./middleware"),
    Experience = require("./models/experience");

    
    
     var  indexRoutes      = require("./routes/index");

// mongoose.connect("mongodb://localhost:27017/farming_app",{useNewUrlParser:true,useCreateIndex:true});
mongoose.connect("mongodb+srv://himanipopli:mujhenhipta@cluster0-taszv.mongodb.net/test?retryWrites=true",{useNewUrlParser:true,useCreateIndex:true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());


// var data1= new Category({
//      name: "Crop-Protection", 
// }) ; 
// Category.create(data1);

// var data2= new Category({
//      name: "Irrigation", 
// }) ; 
// Category.create(data2);

// var data3= new Category({
//      name: "Seeds", 
// }) ; 
// Category.create(data3);

// var data4= new Category({
//      name: "Climate", 
// }) ; 
// Category.create(data4);

// var data5= new Category({
//      name: "Land-Soil", 
// }) ; 
// Category.create(data5);

// var data6= new Category({
//      name: "Others", 
// }) ; 
// Category.create(data6);



// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});
app.get("/", function(req, res){
    res.render("home");
});

app.use("/", indexRoutes);

app.get("/questions/search", function (req,res){
      var noMatch=null;
      //console.log(req.query);
      if(req.query.search){
           const regex =new RegExp(escapeRegex(req.query.search),'gi');
           Questions.find({"name":regex}, function(err,allQuestions){
               if(err){
                   console.log(err);
               }
               else{
                   if(allQuestions.length < 1){
                     noMatch="Nothing found , please try again.";   
                   }
                   
                   else {
                       res.render("questions/index",{questions:allQuestions, noMatch:noMatch});
                   }
               }
           });
      }
      else{
          Questions.find({}, function(err,allQuestions){
            if(err){
                console.log(err);
            }
            else{
                res.render("questions/index",{questions:allQuestions, noMatch:noMatch});
            }
          });
      }
});


// ===========================
//      PROFILE ROUTE
// ===========================
//profile get route
app.get("/profile",middleware.isLoggedIn,function(req, res) {
    Questions.find({},function(err,questions){
        if(err){
            res.render("home");
        }else{
            Experience.find({},function(err, allexp) {
                if(err){
                    res.render("home");
                }else{
                    res.render("profile",{questions:questions,experiences:allexp});
                }
            });
        }
    });
});

// ============================
//      CATEGORY ROUTE
// ============================
// show route for particular category questions
app.get("/category/:catName", function(req,res){
    Category.findOne({name:req.params.catName}).populate("questions").exec(function(err, showCategoryQuestions){
        if(err){
            res.redirect("/category");
        }else{
            res.render("category/show",{category:showCategoryQuestions});
        }
    }); 
});
 
// =============================
//      QUESTION ROUTES
// =============================
// ask_question route
 app.get("/question/new",middleware.isLoggedIn,function(req, res) {
     res.render("ask_question");
 });
 //view all questions
 app.get("/allques",function(req, res) {
     Questions.find({},function(err,questions){
        if(err){
            res.render("home");
        }else{
            res.render("questions/allques",{questions:questions});
           
        }
    });
 })
 //post route for ask_question
 app.post("/question",middleware.isLoggedIn,function(req,res){
       var categoryName=req.body.category;
       console.log(categoryName);
       Category.findOne({name:categoryName}, function(err, category){
       if(err){
           res.redirect("/");
       } else{
           console.log(category.name);
           Questions.create(req.body.questions, function(err, question){
               if(err){
                   console.log(err);
               }else{
                   question.author.id= req.user._id;
                   question.author.username=req.user.name;
                   question.save();
                   category.questions.push(question);
                   category.save();
                   req.flash("success", "Successfully added question to "+ category.name);
                   if(category.name=="Others"){
                       res.redirect("/allques");
                   }
                   else{
                        res.redirect("/category/"+categoryName);
                   }
               }
           });
       }
    });
 });
 
 //get route for editing questions 
app.get("/questions/:id/edit",middleware.checkUserQuestion, function(req,res){
    Questions.findById(req.params.id, function(err,foundQuestions){
         if(err){
             console.log("hello");
             console.log(err);
         }else{
             console.log(req.params.id);
             res.render("questions/edit",{questions:foundQuestions});
         }
    });   
});
 
 // post route for editing questions
 app.put("/questions/:id",middleware.checkUserQuestion, function(req, res){
   
       Questions.findByIdAndUpdate(req.params.id, req.body.questions, function(err,updatedQuestion){
        if(err){
            res.redirect("back");
        }else{
            req.flash("success", "Successfully Edited Question ");
            res.redirect("/questions/"+updatedQuestion._id+"/solutions");
        }
        
    });
 });

 // route to delete question 
 app.delete("/questions/:id",middleware.checkUserQuestion, function(req,res){
   Questions.findByIdAndRemove(req.params.id,function(err){
       if(err){
           res.redirect("back");
       }else{
           req.flash("success", "You have deleted this question");
           res.redirect("/");
       }
   });
});

// ========================================
//      SOLUTION ROUTES
// ========================================
// route for solutions 
app.get("/questions/:questions_id/solutions", function(req,res){
  Questions.findById(req.params.questions_id).populate("solutions").exec(function(err,showAllSolutions){
      if(err){
          console.log(err);
      }
      else{
          Category.findOne({name:req.params.catName},function(err, category) {
              if(err){
                  console.log(err);
              }else{
                res.render("questions/show",{questions:showAllSolutions});
              }
          })
      }
  });
});


// post route to add solutions to database for that question 
app.post("/questions/:questions_id/solutions",middleware.isLoggedIn, function(req,res){
    Questions.findById(req.params.questions_id, function(err,questions){
        if(err){
            console.log(err);
        }else{
            Solutions.create(req.body.solution,function(err,solutions){
                if(err){
                    console.log(err);
                }else{
                   
                   solutions.author.id= req.user._id;
                   solutions.author.username=req.user.name;
                   solutions.save();
                   questions.solutions.push(solutions);
                   questions.save();
                   req.flash("success", "successfully added solution ");
                   res.redirect("/questions/"+ req.params.questions_id+"/solutions");
                }
            })
        }
    });
});

// get route to edit a solution 
app.get("/solutions/:id/edit",middleware.checkUserSolution, function(req,res){
     Solutions.findById(req.params.id, function(err,foundSolutions){
         if(err){
             console.log(err);
         }else{
             res.render("solutions/edit",{solutions:foundSolutions});
         }
     });
 });

 //post route to edit solution
 app.put("/solutions/:id",middleware.checkUserSolution, function(req,res){
       Solutions.findByIdAndUpdate(req.params.id, req.body.solutions, function(err,updatedSolutions){
        if(err){
            res.redirect("back");
        }else{
            req.flash("success", "Successfully edited solution ");
            res.redirect("/");
        }
    });
 });

 //delete a solution 
  app.delete("/questions/:questions_id/solutions/:id",middleware.checkUserSolution, function(req,res){
   Solutions.findByIdAndRemove(req.params.id,function(err){
       if(err){
           res.redirect("back");
       }else{
           req.flash("success", "You have deleted this solution");
           res.redirect("back");
       }
   });
});


// ================================
//       EXPERIENCE ROUTES
// ================================
//to show all experiences
app.get("/experience",function(req,res){
    Experience.find({}, function(err, allexp){
      if(err){
          console.log(err);
      } else {
          res.render("experience/index",{experience:allexp});
      }
    });
});
// post route to add new experience to db
app.post("/experience",middleware.isLoggedIn,function(req,res){
    var author = {
        id: req.user._id,
        username: req.user.name
    }
    var image;
    if(req.body.image!='')
    image=req.body.image;
    var title=req.body.title;
    var description=req.body.description;
    Experience.create({author:author,image:image,description:description,title:title},function(err,exp){
        if(err){
            console.log(err);
        }
        else{
            console.log(exp);
            res.redirect("/experience");
        }
        
    });
});
// route to add new exp
app.get("/experience/new",middleware.isLoggedIn,function(req,res){
    res.render("experience/new_experience");
});
//show page for particular exp
app.get("/experience/:id",function(req,res){
    Experience.findById(req.params.id,function(err,found){
        if(err){
            console.log(err);
        }
        else{
            res.render("experience/show_exp",{exp:found});
        }
    });
});
//edit experience
app.get("/experience/:id/edit",middleware.checkUserExperience, function(req, res){
    Experience.findById(req.params.id, function(err, found){
        if(err){
            res.redirect("/experience");
        }else{
            res.render("experience/edit", {exp: found});
        }
    });
});

// UPDATE ROUTE
app.put("/experience/:id",middleware.checkUserExperience, function(req, res){
    Experience.findByIdAndUpdate(req.params.id, req.body.experience, function(err, updatedCampground){
      if(err){
          res.redirect("/experience");
      } else {
          res.redirect("/experience/" + req.params.id);
      }
    });
});

// DESTROY ROUTE
app.delete("/experience/:id",middleware.checkUserExperience,function(req, res){
  Experience.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/experience");
      } else {
          res.redirect("/experience");
      }
  });
});

function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server started ");
});
    