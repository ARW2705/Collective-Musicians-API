import createError from 'http-errors'
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import mongoose from 'mongoose'
import indexRouter from './routes/index'
import sheetsRouter from './routes/sheets/route'
import usersRouter from './routes/users/route'
import { API_VERSION } from './shared/api-version'

const connect = mongoose.connect(
  process.env.MONGO_URL,
  {
    keepAlive: true,
    keepAliveInitialDelay: 300000,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
    autoIndex: process.env.PROD !== 'true'
  }
)

connect.then(
  () => console.log(`Collective Musicians ${API_VERSION} database connection established`),
  error => console.error(error)
)

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

const API_ROUTE = `collective_musicians_${API_VERSION}`
app.use('/', indexRouter)
app.use(`/${API_ROUTE}/spreadsheets`, sheetsRouter)
app.use(`/${API_ROUTE}/users`, usersRouter)

// catch routes not using the API route
app.use((req, res, next) => {
  if (!req.url.includes(API_ROUTE)) {
    next(createError(400))
  }
})

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  if (req.url.includes(API_ROUTE)) {
    res.status(err.status || 500)
    res.setHeader('content-type', 'application/json')
    res.json({ status: err.status, message: err.message })
  } else {
    res.status(400)
    res.render('error')
  }
})

export default app
