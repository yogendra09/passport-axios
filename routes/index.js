var express = require('express');
var router = express.Router();
const userModel = require('./users')
const passport = require('passport');
const localStrategy = require('passport-local');
const users = require('./users');
var multer = require('multer');
const path = require('path')
const fs = require('fs');
passport.use(new localStrategy(userModel.authenticate()));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    var dt = new Date();
    var fn = Math.floor(Math.random()*100000) + dt.getTime() + path.extname(file.originalname);
    cb(null, fn );

  }
})

function fileFilter (req, file, cb) {

  if(file.mimetype == 'image/png'||file.mimetype == 'image/svg'||file.mimetype == 'image/jpg'||file.mimetype == 'image/jpeg'||file.mimetype == 'image/webp'){

    cb(null, true)
  }
  else{

    cb(new Error('Lawde kya upload kar raha hai!'),false);
  }


}

const upload = multer({ storage: storage , fileFilter:fileFilter})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
router.post('/register', function(req, res, next) {
 
  var newUser = new userModel({
    username:req.body.username,
    name:req.body.name,
    image:req.body.image
  })
  userModel.register(newUser,req.body.password).then(function(u){
    passport.authenticate('local')(req,res,function(){
      res.redirect("/allusers");
    })
  }).catch(function(err){
    res.send(err);
  })
  
});

router.post("/uploads",isLoggedIn,upload.single('imagefile'),function(req,res,next){
    userModel.findOne({username:req.session.passport.user}).then(function(loggedInUser){
      // fs.unlink(`./public/images/uploads/${loggedInUser.image}`,function(err){
      //   if(err){
      //     console.log(err);
      //   }else{
          loggedInUser.image = req.file.filename ;
          loggedInUser.save().then(function(){
            res.redirect("back");
      //     })
      //   }
      })
      
    })

})

router.get("/logout",function(req,res,next){
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

  router.get("/profile",isLoggedIn,function(req,res,next){
   
      userModel.findOne({username:req.session.passport.user}).then(function(loggedInUser){

        res.render("profile",{user:loggedInUser});

      })
  })


  router.get("/found/:username",function(req,res,next){

     userModel.findOne({username:req.params.username}).then(function(foundUser){
      if(foundUser){
        res.json({found:true});
      }
      else{
        res.json({found:false});
      }
     })

  })

  router.get("/like/:id",isLoggedIn,function(req,res,next){
   
    userModel.findOne({_id:req.params.id}).then(function(post){
      if(post.like.indexOf(req.session.passport.user) === -1){
        post.like.push(req.session.passport.user);
      }
       else{
        post.like.splice(post.like.indexOf(req.session.passport.user),1)
       }
          post.save().then(function(){
            res.redirect("back");
          })
    })
   
})

  router.get("/allusers",isLoggedIn,function(req,res,next){
    userModel.find().then(function(allusers){
      // console.log(allusers,req.session.passport.user);
      console.log(allusers.image);
      res.render("allusers",{allusers,loggedInUser:req.session.passport.user});
    })
  })

  router.get("/login",function(req,res,next){
    res.render("login");
  })
  router.post("/login",passport.authenticate('local',{
    successRedirect:"/allusers",
    failureRedirect:"/login"
  }),function(req,res,next){})


  function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
      return next();
    }
    else{
      res.redirect("/login")
    }
  }

module.exports = router;
