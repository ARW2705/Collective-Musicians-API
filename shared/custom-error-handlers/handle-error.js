import createError from 'http-errors'
import { createIdCastError } from './id-cast-error.js'
import { createMongoError } from './mongo-error.js'
import { createValidationError } from './validation-error.js'


const REGISTRATION_ERROR_NAMES = [
  'missingpassworderror',
  'missingusernameerror',
  'userexistserror'
]

function handleError(error) {
  if (!error || !error.name) return createError(error)

  const errorName = error.name.toLowerCase()
  switch(errorName) {
    case 'validationerror':
      return createValidationError(error)
    case 'mongoerror':
      return createMongoError(error)
    case 'casterror':
      return createIdCastError(error)
    default:
      if (REGISTRATION_ERROR_NAMES.includes(errorName)) {
        return createError(400, error.message)
      }
      return createError(error)
  }
}


export default handleError
