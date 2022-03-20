var mongoose = require('mongoose')
var Schema = mongoose.Schema
var bvrypt = require('bcrypt')
var jwt = require('jsonwebtoken')

var userSchema = new schema({
    name: {type:String, required:true},
    email: {type:String, unique: true},
    username: {type: String, required: true, unique:true},
    age: Number,
    phone: {type: String, minlength: 10, maxlength: 13},
    address: {type: String, required: true}
}, {timestamps: true})

//prehook always before user name

userSchema.pre('save', function(next) {
    if(this.password && this.isModified('password'))   {    //if modified only the capture 
        bcrypt.hash(this.password, 10, (err, hashed) => {
            if(err) return next(err)
            this.password = hashed // will containt a version of the hashed pass
            return next()
        })
    } else {
        next()
    }
})


userSchema.methods.verifyPassword = function(password, cb) {
    bcrypt.compare(password, this.password, (err, result) => {   //takes plain pass 
        return cb(err, result) 
    }) 

}
//prior saving, if I use arrow fn it will not use inner scope of this


userSchema.methods.signToken = async function() {
    var payload = {userId: this.id, email: this.email }  //payload generated
    try {   //in order to handle error
    var token = await jwt.sign(payload, 'thisisasecret')  // process.env.nameoffile / takes first argument payload, secret from env
    return token    
} catch (error) {
        next(error) 
    }
}


userSchema.methods.userJSON = function(token) {   // access to that without password
    return {
        name: this.name,
        email: this.email,
        token: token
    }
}

// sign token



var User = mongoose.model('User', userSchema)

  
module.exports = User;


// to has a password - bcrypt.genSalt(saltR, function(err,salt) {
//    bcrypt.hash(myPlaintextPassword, salt, fn(err, hash))
//})

//bcrypt.hash(myPass, saltR, fn(err,hash))
