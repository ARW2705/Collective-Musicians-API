import createError from 'http-errors'


function createIdCastError(error) {
  const texts = error.message.split('"')
  const model = texts[texts.length - 2] // second from last index will contain error source
  const message = `Received ${model} id is malformed`
  return createError(400, message)
}


export { createIdCastError }
