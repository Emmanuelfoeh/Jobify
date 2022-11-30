import mongoose from "mongoose";
import validator from "validator";
import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken";
const UserSchema = new mongoose.Schema({
  name: {
    type: "String",
    required: [true, "Please provide a username"],
    minLength: 3,
    maxLength: 30,
    trim: true,
  },
  password: {
    type: "String",
    required: [true, "Please provide a password"],
    select: false,
    minLength: 4,
  },
  email: {
    type: "String",
    unique: true,
    required: [true, "Please provide an Email Address"],
    validate: {
      validator: validator.isEmail,
      message: "Please provide a valid email",
    },
  },
  lastName: {
    type: "String",
    default: "Bro Yaw",
  },
  location: {
    type: "String",
    trim: true,
    default: "my City",
    maxLength: 30,
  },
});


UserSchema.pre('save', async function(){
  if (!this.isModified('password')) return
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  // console.log(this.password)
})

UserSchema.methods.createJWT =  function(){
    return jwt.sign({userId:this._id},process.env.JWT_SECRET, {expiresIn:process.env.JWT_LIFETIME})
}

UserSchema.methods.comparePassword = async function(condidatePassword){
  const isMatch = await bcrypt.compare(condidatePassword, this.password)
  return isMatch
}



export default mongoose.model("User", UserSchema);