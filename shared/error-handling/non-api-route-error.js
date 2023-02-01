import createError from 'http-errors'


function nonAPIRouteError(apiRoute) {
  return (req, res, next) => {
    if (!req.url.includes(`/${apiRoute}/`)) {
      next(createError(400))
    }
  }
}

export { nonAPIRouteError }
