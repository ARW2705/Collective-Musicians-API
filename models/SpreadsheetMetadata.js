import { Schema, model } from 'mongoose'


const spreadsheetMetadataSchema = new Schema({
  spreadsheetId: {
    type: String,
    required: true
  },
  columnsMap: {
    type: Schema.Types.Mixed,
    required: true
  }
}, {
  _id: false
})

spreadsheetMetadataSchema.index({ spreadsheetId: 1 })


export default model('SpreadsheetMetadata', spreadsheetMetadataSchema)
