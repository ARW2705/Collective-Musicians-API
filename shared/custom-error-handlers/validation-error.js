import createError from 'http-errors'


function createValidationError(error) {
  let errMsg = ''
  const { errors } = error
  for (const key in errors) {
    errMsg += errors[key].properties.message
  }
  return createError(400, errMsg)
}


export { createValidationError }
