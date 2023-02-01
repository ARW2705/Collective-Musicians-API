import createError from 'http-errors'


function createMongoError(error) {
  // TODO: parse mongo error other than 'unique' errors
  console.log('mongo error', error)
  return createError(400, error)
}


export { createMongoError }
