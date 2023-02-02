import { jest } from '@jest/globals'


describe('User Route Helpers', () => {
  const mockToken = 'test-token'
  let composeAuthorizedUserResponse
  
  beforeAll(async () => {
    /**
     * See https://github.com/facebook/jest/issues/10025
     */
    jest.unstable_mockModule('../../../authenticate.js', () => ({
      __esModule: true,
      generateToken: jest.fn(() => mockToken)
    }))
    const { composeAuthorizedUserResponse: _composeAuthorizedUserResponse } = await import('../helpers.js')
    composeAuthorizedUserResponse = _composeAuthorizedUserResponse
  })

  test('should generate a basic user', () => {
    const mockUser = {
      _id: 'test-id',
      username: 'test-username',
      email: 'test-email'
    }

    const user = composeAuthorizedUserResponse(mockUser)
    expect(user.id).toMatch(mockUser._id)
    expect(user.username).toMatch(mockUser.username)
    expect(user.email).toMatch(mockUser.email)
    expect(user.token).toMatch(mockToken)
    expect(user.hasOwnProperty('admin')).toBe(false)
    expect(user.hasOwnProperty('editor')).toBe(false)
  })

  test('should generate an editor user', () => {
    const mockUser = {
      _id: 'test-id',
      username: 'test-username',
      email: 'test-email',
      editor: true
    }

    const user = composeAuthorizedUserResponse(mockUser)
    expect(user.id).toMatch(mockUser._id)
    expect(user.username).toMatch(mockUser.username)
    expect(user.email).toMatch(mockUser.email)
    expect(user.token).toMatch(mockToken)
    expect(user.hasOwnProperty('admin')).toBe(false)
    expect(user.hasOwnProperty('editor')).toBe(true)
  })

  test('should generate an admin user', () => {
    const mockUser = {
      _id: 'test-id',
      username: 'test-username',
      email: 'test-email',
      admin: true
    }

    const user = composeAuthorizedUserResponse(mockUser)
    expect(user.id).toMatch(mockUser._id)
    expect(user.username).toMatch(mockUser.username)
    expect(user.email).toMatch(mockUser.email)
    expect(user.token).toMatch(mockToken)
    expect(user.hasOwnProperty('admin')).toBe(true)
    expect(user.hasOwnProperty('editor')).toBe(false)
  })

  test('should throw error if missing user', () => {
    expect(() => {
      composeAuthorizedUserResponse(null)
    }).toThrowError()
  })

})
