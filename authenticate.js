import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'

import User from './models/User'


passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

const verifyUser = passport.authenticate('UserStrategy', {session: false})
const verifyAdmin = (req, res, next) => req.user.admin ? next() : next(createError(403))
const verifyEditor = (req, res, next) => (req.user.editor || req.user.admin) ? next() : next(createError(403))

export {
  verifyUser,
  verifyAdmin,
  verifyEditor
}
