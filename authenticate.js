import createError from 'http-errors'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import jwt from 'jsonwebtoken'

import User from './models/User'


passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

const jwtStragetyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.TOKEN_KEY
}
passport.use(new JwtStrategy(jwtStragetyOptions, (jwt_payload, done) => {
  User.findOne({_id: jwt_payload._id}, (error, user) => {
    if (error) return done(error, false)
    if (user) return done(null, user)
    return done(null, false)
  })
}))

const generateToken = user => jwt.sign(user.toJSON(), process.env.TOKEN_KEY, {expiresIn: '30d'})
const verifyUser = passport.authenticate('jwt', {session: false})
const verifyAdmin = (req, res, next) => req.user.admin ? next() : next(createError(403))
const verifyEditor = (req, res, next) => (req.user.editor || req.user.admin) ? next() : next(createError(403))


export {
  generateToken,
  verifyUser,
  verifyAdmin,
  verifyEditor
}
