/*
 * User Model
 */

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var beautifyUnique = require('mongoose-beautiful-unique-validation');

// var validateEmail = function(email) {
//     var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
//     return re.test(email)
// };


var Schema = mongoose.Schema;
var UserSchema = new Schema({
        name: { 
                type: String, 
                //required: [true, 'name is required'],                
                //minlength: [5, 'The value of path `{PATH}` (`{VALUE}`) is shorter than the minimum allowed length ({MINLENGTH}).']
        },
        username: { 
                type: String, 
                required: [true, 'username is required'],
                minlength: [4, 'username should be at least {MINLENGTH} characters.'],
                maxlength: [15, 'username should not more than {MAXLENGTH} characters.'],
                index: {unique: true}
        },
		email: { 
                type: String, 
                required: [true, 'email is required'],
                index: {unique: true}
        },
        password: { 
                type: String, 
                required: [true, 'password is required'], 
                select: false 
        },
        profileImage: { type: String, default: null },
        lang: { type: String, default: "es" },
        useradmin: { type: Boolean, default: false },
        isLoggedIn: { type: Boolean, default: false },
        lastLogin: { type: Date, default: null },
        current_lat: { type: String, default: null },
        current_long: { type: String, default: null },
        changepasswordtoken: { type: String, default: null },
        changepasswordtokenexpiry: { type: Date, default: null },
        userAgent: { type: Schema.Types.Mixed, default: null }
}, {
        timestamps: true
});

// enables beautifying 
UserSchema.plugin(beautifyUnique);

UserSchema.pre('save', function (next) {
        var user = this;
        if (!user.isModified('password')) { return next(); }

        bcrypt.hash(user.password, null, null, function (err, hash) {
                if (err) { return next(err); }

                user.password = hash;
                next();
        });
});

UserSchema.methods.comparePassword = function (password) {
        var user = this;
        //console.log("user", user);
        return bcrypt.compareSync(password, user.password);
};

module.exports = mongoose.model('User', UserSchema);