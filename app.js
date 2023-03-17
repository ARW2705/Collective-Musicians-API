import createError from 'http-errors'
import express from 'express'
import path from 'path'
import process from 'process'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import announcementsRouter from './routes/announcements/route.js'
import indexRouter from './routes/index.js'
import sheetsRouter from './routes/sheets/route.js'
import usersRouter from './routes/users/route.js'
import { API_VERSION } from './shared/api-version.js'
import { endStopErrorHandler } from './shared/error-handling/end-stop-error-handler.js'
import { nonAPIRouteError } from './shared/error-handling/non-api-route-error.js'


const app = express()

// view engine setup
app.set('views', path.join(process.cwd(), 'views'))
app.set('view engine', 'hbs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(process.cwd(), 'public')))

// api routes
const API_ROUTE = `collective_musicians_${API_VERSION}`
app.use('/', indexRouter)
app.use(`/${API_ROUTE}/announcements`, announcementsRouter)
app.use(`/${API_ROUTE}/spreadsheets`, sheetsRouter)
app.use(`/${API_ROUTE}/users`, usersRouter)

// catch routes not using the API route
app.use(nonAPIRouteError(API_ROUTE))

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// error handler
app.use(endStopErrorHandler(API_ROUTE))


export default app
