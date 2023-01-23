import { Router } from 'express'
import createError from 'http-errors'
import passport from 'passport'
import { verifyAdmin, verifyUser } from '../../authenticate'
import User from '../../models/User'
import handleError from '../../shared/custom-error-handlers/handle-error'
import { composeAuthorizedUserResponse } from './helpers'


const usersRouter = Router()

usersRouter.get('/', verifyUser, verifyAdmin, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)

    const users = await User.find({})
      .sort({ _id: 1 })
      .skip(page * limit)
      .limit(limit)
      .exec()

    res.statusCode = 200
    res.setHeader('content-type', 'application/json')
    res.json(users)
  } catch (error) {
    return next(error)
  }
})

usersRouter.get('/:userId', verifyUser, verifyAdmin, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).exec()
    if (!user) return next(createError(404, 'User not found'))

    res.statusCode = 200
    res.setHeader('content-type', 'application/json')
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      admin: user.admin,
      editor: user.editor
    })
  } catch (error) {
    return next(error)
  }
})

usersRouter.get('/profile', verifyUser, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).exec()
    if (!user) return next(createError(404, 'User not found'))

    res.statusCode = 200
    res.setHeader('content-type', 'application/json')
    res.json({
      username: user.username,
      email: user.email
    })
  } catch (error) {
    return next(error)
  }
})

usersRouter.post('/login', (req, res, next) => {
  passport.authenticate('local', (error, user) => {
    if (error) return next(error)
    if (!user) return next(createError(401, 'Password or username is incorrect'))

    res.statusCode = 200
    res.setHeader('content-type', 'application/json')
    return res.json(composeAuthorizedUserResponse(user))
  })(req, res, next)
})

usersRouter.post('/signup', async (req, res, next) => {
  try {
    const { username, email } = req.body
    const user = await User.register(new User({ username, email }), req.body.password)

    passport.authenticate('local')(req, res, () => {
      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      res.json(composeAuthorizedUserResponse(user))
    })
  } catch (error) {
    return next(handleError(error))
  }
})

// TODO: Add password reset initiation route


export default usersRouter
