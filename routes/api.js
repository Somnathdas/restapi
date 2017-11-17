var express = require('express');
var router = express.Router();



var config = require('../config');
var secretKey = config.secret;
var jwt = require('jsonwebtoken');
var UserController = require('../controllers/UserController');


//======================
//  Middleware to check the login
//=========================

function checkToken(req, res, next){
    
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    //console.log(token);
    if(token){
        jwt.verify(token, secretKey, function(err, decoded){
            if(err){
                res.status(403).json({success: false, message: "failed to authenticate"});
            }
            else{
                req.user = decoded;    
                //console.log("req.user : ", req.user);            
                return next();
            }
        });
    }
    else{
        res.status(403).json({success: false, message: "token required"});
    }
}

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  res.json({success: true, message: "api routes is working"});
});

router.post('/sign-up', function(req, res) {
  //res.render('index', { title: 'Express' });
  UserController.createNewUser(req.body, function(data){
      res.json(data);   
  })
});

router.post('/login', function(req, res) {
  console.log(req.body);
  UserController.doLogin(req.body, req.headers['user-agent'], function(data){
      var statusCode = config.status.OK;
      if(data.statusCode)
        statusCode = data.statusCode;
      res.status(statusCode).json(data);   
  });
});



router.post('/changepassword', checkToken, function(req, res, next) {
  //console.log(req.user);
  UserController.changeMyPassword(req.body, req.user, function(data){
    res.json(data); 
  })
  
});

router.post('/forgotpassword', checkToken, function(req, res, next) {
  console.log(req.user);
  UserController.forgotMyPassword(req.body, req.user, function(data){
    res.json(data); 
  })
  
});

router.post('/changeforgotpassword', checkToken, function() {
  res.render('forgotpassword');
});



module.exports = router;