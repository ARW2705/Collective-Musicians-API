import { Router } from 'express'
import createError from 'http-errors'
import { verifyUser } from '../../authenticate.js'
import Definitions from '../../models/Definitions.js'
import { getSpreadSheetMetaData } from '../../sheets/connector/connector.js'
import { getFilteredSheet, getSheet, getColumnNames, getRowLimits } from './helpers.js'


const sheetsRouter = Router()

sheetsRouter.route('/')
  .get(async (req, res, next) => {
    try {
      const { connectedSpreadsheetId } = await Definitions.findOne({}).exec()
      const { properties, sheets } = await getSpreadSheetMetaData(connectedSpreadsheetId)
      const response = {
        id: connectedSpreadsheetId,
        name: properties.title,
        sheets: await Promise.all(sheets.map(async sheet => ({
          name: sheet.properties.title,
          columnNames: (await getColumnNames(connectedSpreadsheetId, sheet.properties.title))
            .filter(name => name !== '')
        })))
      }

      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      res.json(response)
    } catch (error) {
      return next(error)
    }
  })

sheetsRouter.route('/sheet/query')
  .get(async (req, res, next) => {
    try {
      const { connectedSpreadsheetId } = await Definitions.findOne({}).exec()
      const { page = 1, limit = 50, sheetName } = req.query
      const { rowStart, rowEnd } = getRowLimits(page, limit)
      const columnNames = await getColumnNames(connectedSpreadsheetId, sheetName)

      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      res.json(await getSheet(connectedSpreadsheetId, sheetName, columnNames, rowStart, rowEnd))
    } catch (error) {
      return next(error)
    }
  })
  .post(async (req, res, next) => {
    try {
      const { connectedSpreadsheetId } = await Definitions.findOne({}).exec()
      const { page = 1, limit = 50, sheetName } = req.query
      const { filter } = req.body
      const { rowStart, rowEnd } = getRowLimits(page, limit)

      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      res.json(await getFilteredSheet(connectedSpreadsheetId, sheetName, filter, rowStart, rowEnd))
    } catch (error) {
      console.log(error)
      return next(error)
    }
  })

sheetsRouter.route('/sheet/columns')
  .get(async (req, res, next) => {
    try {
      const { connectedSpreadsheetId } = await Definitions.findOne({}).exec()
      const { sheetName } = req.query
      const response = (await getColumnNames(connectedSpreadsheetId, sheetName))
        .filter(name => name !== '')

      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      res.json(response)
    } catch (error) {
      return next(error)
    }
  })


export default sheetsRouter
