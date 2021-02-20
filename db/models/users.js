const mongoose = require('../mongoose')
const validator = require('validator')
const {secret,customer,admin,superadmin} = require('../../constants')
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    email:{
        type:String,
        required:true,
        validate(value){
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        required:true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    posts: [{
        post: {
            type: String
        }
    }],
    actions:[{
        action:{
            type:String
        }
    }
    ]
   
})
userSchema.methods.generateToken = async function() 
{    
    const user = this
    let role = "Na" ;
    if(user.role.toUpperCase() === customer){
        role = customer
    }
    if(user.role.toUpperCase() === admin){
        role = admin
    }
    if(user.role.toUpperCase()=== superadmin){
        role= superadmin
    }
    
    const token = await jwt.sign({role,id:user._id.toString()},secret,{expiresIn: '24h'})
    user.tokens = user.tokens.concat({token})
    return token


}
userSchema.statics.findUser = async (email)=>{
    const user = await User.findOne({ email })
    return user
}
const User = mongoose.model('User', userSchema)

module.exports = User