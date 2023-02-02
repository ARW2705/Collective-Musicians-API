import { jest } from '@jest/globals'
import request from 'supertest'
import createError from 'http-errors'

import { API_VERSION } from '../../../shared/api-version.js'


function mockUser(opts = {}) {
  return {
    _id: 'user-id',
    username: 'myusername',
    email: 'email@email',
    ...opts
  }
}

function mockUserModel(fnName, fn) {
  let doc = {
    find     : jest.fn().mockReturnThis(),
    findById : jest.fn().mockReturnThis(),
    sort     : jest.fn().mockReturnThis(),
    skip     : jest.fn().mockReturnThis(),
    limit    : jest.fn().mockReturnThis(),
    exec     : jest.fn().mockReturnValue(Promise.resolve())
  }

  if (fnName) {
    doc = { ...doc, [fnName]: fn }
  }

  return doc
}

describe('User Route', () => {
  const TEST_API_ROUTE = `/collective_musicians_${API_VERSION}/users`

  afterEach(() => {
    jest.resetModules()
  })

  describe('With Valid User', () => {

    beforeAll(() => {
      const user = mockUser()
      jest.unstable_mockModule('../../../authenticate.js', () => ({
        __esModule: true,
        generateToken: jest.fn(),
        verifyEditor: jest.fn(),
        verifyUser: jest.fn((req, res, next) => {
          Object.assign(req, { user })
          return next()
        }),
        verifyAdmin: jest.fn((req, res, next) => next())
      }))
    })

    describe('Route /', () => {
      test('should get a list of users', async () => {
        jest.unstable_mockModule('../../../models/User.js', () => ({
          __esModule: true,
          default: mockUserModel('exec', jest.fn(() => Promise.resolve([{}, {}])))
        }))
    
        const User = (await import('../../../models/User')).default
        const findSpy = jest.spyOn(User, 'find')
        const sortSpy = jest.spyOn(User, 'sort')
        const skipSpy = jest.spyOn(User, 'skip')
        const limitSpy = jest.spyOn(User, 'limit')
        
        const app = (await import('../../../app.js')).default
        const page = 1
        const limit = 25
        const res = await request(app).get(`${TEST_API_ROUTE}?page=${page}&limit=${limit}`)
        expect(res.statusCode).toEqual(200)
        expect(findSpy).toHaveBeenCalledWith({})
        expect(sortSpy).toHaveBeenCalledWith({_id: 1})
        expect(skipSpy).toHaveBeenCalledWith(page * limit)
        expect(limitSpy).toHaveBeenCalledWith(limit)
      })
  
      test('should handle error when building a response', async () => {
        const TEST_ERROR = 'Test Error'
    
        jest.unstable_mockModule('../../../models/User.js', () => ({
          __esModule: true,
          default: mockUserModel('skip', jest.fn().mockImplementation(() => { throw new Error(TEST_ERROR) }))
        }))
    
        const User = (await import('../../../models/User')).default
        const findSpy = jest.spyOn(User, 'find')
        const sortSpy = jest.spyOn(User, 'sort')
        const skipSpy = jest.spyOn(User, 'skip')
        const limitSpy = jest.spyOn(User, 'limit')
        
        const app = (await import('../../../app.js')).default
        const page = 1
        const limit = 25
        const res = await request(app).get(`${TEST_API_ROUTE}?page=${page}&limit=${limit}`)
        expect(res.statusCode >= 500).toBe(true)
        expect(res.error.text).toMatch(TEST_ERROR)
        expect(findSpy).toHaveBeenCalled()
        expect(sortSpy).toHaveBeenCalled()
        expect(skipSpy).toHaveBeenCalled()
        expect(limitSpy).not.toHaveBeenCalled()
      })
    })

    describe('Route /profile', () => {
      test('should get user profile', async () => {
        const myUser = mockUser()
  
        jest.unstable_mockModule('../../../models/User.js', () => ({
          __esModule: true,
          default: mockUserModel('exec', jest.fn().mockReturnValue(Promise.resolve(myUser)))
        }))
  
        const User = (await import('../../../models/User')).default
        const findSpy = jest.spyOn(User, 'findById')
  
        const app = (await import('../../../app.js')).default
        const res = await request(app).get(`${TEST_API_ROUTE}/profile`)
        expect(res.statusCode).toEqual(200)
        expect(findSpy).toHaveBeenCalled()
        expect(res.body).toStrictEqual({
          username: myUser.username,
          email: myUser.email
        })
      })
    })

    describe('Route /:userId', () => {
      test('should get a user by id', async () => {
        const myUser = mockUser({ admin: true })
  
        jest.unstable_mockModule('../../../models/User.js', () => ({
          __esModule: true,
          default: mockUserModel('exec', jest.fn().mockReturnValue(Promise.resolve(myUser)))
        }))
  
        const User = (await import('../../../models/User')).default
        const findSpy = jest.spyOn(User, 'findById')
  
        const app = (await import('../../../app.js')).default
        const res = await request(app).get(`${TEST_API_ROUTE}/${myUser._id}`)
        expect(res.statusCode).toEqual(200)
        expect(findSpy).toHaveBeenCalledWith(myUser._id)
        expect(res.body).toStrictEqual({
          id: myUser._id,
          username: myUser.username,
          email: myUser.email,
          admin: true
        })
      })
  
      test('should error when getting a user by id that does not exist', async () => {
        const myUser = mockUser({ admin: true })
  
        jest.unstable_mockModule('../../../models/User.js', () => ({
          __esModule: true,
          default: mockUserModel('exec', jest.fn().mockReturnValue(Promise.resolve(null)))
        }))
  
        const User = (await import('../../../models/User')).default
        const findSpy = jest.spyOn(User, 'findById')
  
        const app = (await import('../../../app.js')).default
        const res = await request(app).get(`${TEST_API_ROUTE}/${myUser._id}`)
        expect(res.statusCode).toEqual(404)
        expect(findSpy).toHaveBeenCalledWith(myUser._id)
      })
  
      test('should handle error when querying user', async () => {
        const TEST_ERROR = 'Test Error'
    
        jest.unstable_mockModule('../../../models/User.js', () => ({
          __esModule: true,
          default: mockUserModel('findById', jest.fn().mockImplementation(() => { throw new Error(TEST_ERROR) }))
        }))
    
        const User = (await import('../../../models/User')).default
        const findSpy = jest.spyOn(User, 'findById')
        const sortSpy = jest.spyOn(User, 'sort')
        const skipSpy = jest.spyOn(User, 'skip')
        const limitSpy = jest.spyOn(User, 'limit')
        
        const app = (await import('../../../app.js')).default
        const res = await request(app).get(`${TEST_API_ROUTE}/test-id`)
        expect(res.statusCode >= 500).toBe(true)
        expect(res.error.text).toMatch(TEST_ERROR)
      })
    })
  })

  describe('With Invalid User', () => {

    beforeAll(() => {
      jest.unstable_mockModule('../../../authenticate.js', () => ({
        __esModule: true,
        generateToken: jest.fn(),
        verifyEditor: jest.fn((req, res, next) => next(createError(403))),
        verifyUser: jest.fn((req, res, next) => next()),
        verifyAdmin: jest.fn((req, res, next) => next(createError(403)))
      }))
    })

    describe('Route /', () => {
      test('should error when getting a list of users but not an admin', async () => {
        const app = (await import('../../../app.js')).default
        const page = 1
        const limit = 25
        const res = await request(app).get(`${TEST_API_ROUTE}?page=${page}&limit=${limit}`)
        expect(res.statusCode).toEqual(403)
      })
    })

    describe('Route /profile', () => {
      test('should error getting user profile that is not the requesting user\'s profile', async () => {
        jest.unstable_mockModule('../../../models/User.js', () => ({
          __esModule: true,
          default: mockUserModel()
        }))
  
        const app = (await import('../../../app.js')).default
        const res = await request(app).get(`${TEST_API_ROUTE}/profile`)
        expect(res.statusCode).toEqual(500)
      })
    })

    describe('Route /:userId', () => {
      test('should error getting user by id if user is not verified', async () => {
        jest.unstable_mockModule('../../../models/User.js', () => ({
          __esModule: true,
          default: mockUserModel()
        }))

        const app = (await import('../../../app.js')).default
        const res = await request(app).get(`${TEST_API_ROUTE}/test-id`)
        expect(res.statusCode).toEqual(403)
      })
    })
  })

})
