import mongoose from 'mongoose'


const { Schema, model } = mongoose

const definitionsSchema = new Schema({
  connectedSpreadsheetId: {
    type: String,
    immutable: true
  }
})

export default model('Definitions', definitionsSchema)
