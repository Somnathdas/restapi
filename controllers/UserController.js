/*
 *   User Manipulation Services for App.
 */

var async = require('async');
var config = require('../config');

var secretKey = config.secret;
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt-nodejs');
var UserModel = require('../models/UserModel');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var randomstring = require("randomstring");
var dateFormat = require('dateformat');
var geolib = require('geolib');
var request = require('request');

function createToken(user){    
    var tokenData = {
        id: user._id,
        username: user.username,
        name: user.name
    };

    var token = jwt.sign(tokenData, secretKey, {
        expiresIn: "30 days"
    });
    return token;    
}

var UserController = {
    /**
     * Registering a new user
     */
    createNewUser: function (userData, callback) {
        //console.log("userData : ", userData);

        console.log("userData : ", userData);
        if(typeof (userData.name) == "undefined" || userData.name == "")
          var name = null;
        else
          var name = userData.name;

        async.waterfall([
            function(nextcb){
                var customErr = {success: null, status: null, message: null};
                var user = new UserModel({
                    username: userData.username,
					email: userData.email,
                    password: userData.password,
                    name: name
                });


                user.save(function (err, res) {
                    if (err) {
                        //console.log("err : ", err.errors.password.message)
                        if (err.name == "ValidationError") {
                            var field = err.errors.username || err.errors.password || err.errors.name;
                            customErr = { success: false, statusCode: config.status.BAD_REQUEST, message: field.message, err: err };
                        }
                        else
                            customErr = { success: false, statusCode: config.status.SERVER_ERROR, message: "SERVER.INTERNAL_ERROR", err: err };
                    }
                    else
                        customErr = { success: true, statusCode: config.status.OK, message: "SERVER.REG_SUCCESS" };
                    nextcb(null, customErr, user);
                });
            }
        ], function(err, response){
            callback(response);
        })

        

        /**/


    },

    doLogin: function (userData, userAgents, callback) {
		
		console.log(userData);
        if (typeof (userData.username) == "undefined" || userData.username == "") {
            callback({ success: false, message: "Please provide username" });
        } else if (typeof (userData.password) == "undefined" || userData.password == "") {
            callback({ success: false, message: "Please provide password" });
        } else {
            UserModel.findOne({ username: userData.username })
                .select('username password email')
                .exec(function (err, user) {
                    if (err)
                        callback({ success: false, statusCode: config.status.SERVER_ERROR, message: "SERVER.INTERNAL_ERROR", err: err });
                    else {
                        //console.log(user);
                        if (!user) {
                            callback({ success: false, statusCode: config.status.OK, message: "User Not Found" });
                        } else if (!user.comparePassword(userData.password)) {
                            callback({ success: false, statusCode: config.status.OK, message: "Worng Password" });
                        } else {
                           var token = createToken(user);
                           callback({ success: true, statusCode: config.status.OK, message: "Login Success", token: token,username:user.username,email:user.email });
                        }
                    }
                });
        }
    },

    changeMyPassword: function(passwordInfo, userData, callback){
        
         if(typeof(passwordInfo) == "undefined" || typeof(passwordInfo.old_password) == "undefined" || passwordInfo.old_password == ""){
            callback({ success: false, statusCode: config.status.BAD_REQUEST, message: "SERVER.OLD_PASS_BLANK" });
        } if(typeof(passwordInfo) == "undefined" || typeof(passwordInfo.new_password) == "undefined" || passwordInfo.new_password == ""){
            callback({ success: false, statusCode: config.status.BAD_REQUEST, message: "SERVER.NEW_PASS_BLANK" });
        } else {
            console.log(userData.id);
            UserModel.findOne({ _id: userData.id })
            .select('name username password')
            .exec(function(err, user){ 
                if(err)
                    callback({ success: false, statusCode: config.status.SERVER_ERROR, message: "SERVER.INTERNAL_ERROR", err: err });
                else {
                    if(!user.comparePassword(passwordInfo.old_password)){                        
                        callback({ success: false, statusCode: config.status.SERVER_ERROR, message: "SERVER.OLD_PASS_INVALID", err: err });
                    }else{
                        bcrypt.hash(passwordInfo.new_password, null, null, function (e, hash) {
                            if(e){ 
                                callback({ success: false, statusCode: config.status.SERVER_ERROR, message: "SERVER.INTERNAL_ERROR", err: e });
                            }
                            else{
                                var new_password = hash;                       
                                var conditions = { _id: userData.id },
                                fields = { password: new_password },
                                options = { upsert: false };

                                UserModel.update(conditions, fields, options, function (err, affected) {
                                    if (err) {
                                        callback({ success: false, statusCode: config.status.SERVER_ERROR, message: "SERVER.INTERNAL_ERROR", err: err });
                                    } else {
                                        callback({ success: true, statusCode: config.status.OK, message: "SERVER.PASS_UPDATED" });
                                    }
                                });
                            }
                        });

                    }
                    
                    

                }
            });
            
        }  
    },

    forgotMyPassword: function(emailInfo, userData, callback){

        if(typeof(emailInfo) == "undefined" || typeof(emailInfo.email) == "undefined" || emailInfo.email == ""){
            callback({ success: false, statusCode: config.status.BAD_REQUEST, message: "Email field can't be blank" });
        } else {
            console.log(emailInfo);
        //start sent mail
        // create reusable transporter object using the default SMTP transport 
        var transporter = nodemailer.createTransport('smtps://amlan.brainium@gmail.com:brainium.amlan@smtp.gmail.com');
        // setup e-mail data with unicode symbols 
        var mailOptions = {
            from: '"Fred Foo" <foo@blurdybloop.com>', // sender address 
            to: 'soumya.brainium@gmail.com', // list of receivers 
            subject: 'Hello', // Subject line 
            //text: 'Hello world', // plaintext body 
            html: '<b>Hello world</b>' // html body 
        };
        // send mail with defined transport object 
        transporter.sendMail(mailOptions, function(error, info)
        {
            if (error)
            {
                console.log('Message not sent: ' + error);
                res.json(error);
            }
            else
            {
                console.log('Message sent: ' + info.response);
                res.json(info.response);
            }
        });
        //end of sent mail 


/*

            var otp = randomstring.generate(7);

            //////////////////////////////////////////////////
            // create reusable transporter object using the default SMTP transport
            var transporter = nodemailer.createTransport(smtpTransport({
                service: 'gmail',
                auth: {
                    user: 'soumya.amstech@gmail.com',
                    pass: 'bootupsmarya'
                }
            }));

            // setup email data with unicode symbols
            var mailOptions = {
                from: '"Soumya Bhattacharya" <soumya.amstech@gmail.com>', // sender address
                to: 'soumya.brainium@gmail.com', // list of receivers
                subject: 'Password Recovery for Protegete App', // Subject line
                //html: 'Hello User, <br> Your One Time Password is following.<br> OTP: '+otp+'<br>Please use this to login', // plain text body
                text: '<b>Hello world ?</b>' // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                    callback({ success: false, statusCode: config.status.BAD_REQUEST, message: "Email not sent." });
                } else{
                    return console.log('Message %s sent: %s', info.messageId, info.response);
                    callback({ success: true, statusCode: config.status.OK, message: "Email sent to your mail id." });
                }
                
            });

            ////////////////////////////////////////////////////*/



        }

    },

   

}

module.exports = UserController;


