import mongoose from 'mongoose'
const { Schema, model } = mongoose
import uniqueValidator from 'mongoose-unique-validator'
import passportLocalMongoose from 'passport-local-mongoose'


const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  admin: {
    type: Boolean,
    default: false
  },
  editor: {
    type: Boolean,
    default: false
  },
  hash: {
    type: String,
    select: false
  },
  salt: {
    type: String,
    select: false
  }
})

userSchema.plugin(uniqueValidator)
userSchema.plugin(passportLocalMongoose)


export default model('User', userSchema)
