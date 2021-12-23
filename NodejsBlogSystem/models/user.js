const mongoose = require("mongoose")
const Joi = require("@hapi/joi")


const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    }, 
    email : {
        type: String,
        trim: true,
        unique: true,
        required : true,
    },
    password : {
        type: String,
        minlength: 5,  
        maxlength: 255,
        required : true,
    },
	address : {
	    type: String,
	    trim: true,
	    unique: true,
	},
	userimg : {
	    type: String,
	    trim: true,
	    unique: true,
	},
	usermotto : {
	    type: String,
	    trim: true,
	    unique: true,
	},
})

const User = mongoose.model('User', userSchema)

function validateUser(user) {

    const schema = Joi.object({
        name : Joi.string().required().min(5).max(50),


    })

    return schema.validate(user);
}
function validateEdit(user) {

    const schema = Joi.object({
        name : Joi.string().required().min(5).max(50),
        email : Joi.string().required().min(5).max(250).email({ tlds: { allow: ['com', 'net'] } }),
        password : Joi.string().required().min(5).max(255).pattern(/^[a-zA-Z0-9]{3,30}$/),
        confirmPassword : Joi.any().required().valid(Joi.ref('password'))

    })

    return schema.validate(user);
}

module.exports.User = User
module.exports.validateUser = validateUser
module.exports.validateEdit= validateEdit


// checking for unique email
userSchema.path('email').validate(async (value) => {
    const emailCount = await mongoose.models.User.countDocuments({email: value });
    return !emailCount;
  }, 'The given email already exists. Try new email');


