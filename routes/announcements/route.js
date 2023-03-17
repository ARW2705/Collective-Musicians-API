import { Router } from 'express'
import { verifyAdmin, verifyUser } from '../../authenticate.js'
import Announcement from '../../models/Announcement'


const announcementsRouter = Router()

announcementsRouter.get('/', async (req, res, next) => {
  const announcements = await Announcement.find({})
    .sort({ updatedAt: -1 })
    .limit(5)
    .exec()

  res.statusCode = 200
  res.setHeader('content-type', 'application/json')
  res.json(announcements)
})

announcementsRouter.post('/', verifyUser, verifyAdmin, async (req, res, next) => {
  await Announcement.create(req.body)

  const announcements = await Announcement.find({})
    .sort({ updatedAt: -1 })
    .limit(5)
    .exec()

  res.statusCode = 200
  res.setHeader('content-type', 'application/json')
  res.json(announcements)
})

export default announcementsRouter
