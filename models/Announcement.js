import mongoose from 'mongoose'


const { Schema, model } = mongoose

const announcementSchema = new Schema({
  message: {
    type: String,
    required: true
  },
  importance: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

announcementSchema.index({ createdAt: 1 })
announcementSchema.index({ updatedAt: 1 })

export default model('Announcement', announcementSchema)
