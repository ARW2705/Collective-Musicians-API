import { Schema, model } from 'mongoose'
import passportLocalMongoose from 'passport-local-mongoose'

import uniqueValidator from 'mongoose-unique-validator'

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
  }
})

userSchema.plugin(uniqueValidator)
userSchema.plugin(passportLocalMongoose)

export default model('User', userSchema)
