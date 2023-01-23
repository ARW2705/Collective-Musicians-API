import { generateToken } from '../../authenticate'


function composeAuthorizedUserResponse(user) {
  if (!user) throw new Error('Cannot compose user response: missing User')

  let response = {
    id: user._id,
    username: user.username,
    email: user.email,
    token: generateToken(user)
  }

  if (user.admin) response = { ...response, admin: user.admin }
  if (user.editor) response = { ...response, editor: user.editor }
  
  return response
}


export {
  composeAuthorizedUserResponse
}
