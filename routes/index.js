var express    = require("express");
var router     = express.Router();
var passport   = require("passport");
var User       = require("../models/user");
var middleware = require("../middleware");
//var Farmers= require("../models/farmers");



// router.get("/", function(req, res){
//     // res.render("index");
//     res.send("welcome to landing page");
// });



// router.get("/secret", middleware.isLoggedIn,function(req, res){
//     res.render("secrets");
// });

//register routes
router.get("/register", function(req,res){
   res.render("authentication/register"); 
});

router.post("/register", function(req,res){
    
    var newUser =new User({
        username:req.body.username,
        name:req.body.name,
        password:req.body.password
        
    });
    User.register(newUser, req.body.password, function(err,user){
        if(err){
            return res.render("authentication/register", {"error": err.message});
        }
        passport.authenticate("local")(req,res,function(){
            req.flash("success", "Welcome  "+ user.name);
             res.redirect("/");
        });
    });
    
});


//login
router.get("/login", function(req,res){
    res.render("authentication/login");
});

router.post("/login", passport.authenticate("local",{
    successRedirect:"/",
    failureRedirect:"/login"
}),function(req,res){
});

// <script>
// function goBack() {
//   history.go(-2);
// }
// </script>

//logout

router.get("/logout", function(req, res){
    req.logout();
    req.flash("success","Logged out successfully!!");
    res.redirect("/");
});


module.exports= router;