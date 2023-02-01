function endStopErrorHandler(apiRoute) {
  return (err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    if (req.url.includes(apiRoute)) {
      res.status(err.status || 500)
      res.setHeader('content-type', 'application/json')
      res.json({ status: err.status, message: err.message })
    } else {
      res.status(400)
      res.render('error')
    }
  }
}

export { endStopErrorHandler }
