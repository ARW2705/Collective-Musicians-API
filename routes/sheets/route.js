import { Router } from 'express'
import createError from 'http-errors'
import { verifyUser } from '../../authenticate.js'
import { getSpreadSheetMetaData } from '../../sheets/connector/connector.js'
import { getFilteredSheet, getSheet, getColumnNames, getRowLimits } from './helpers.js'


const sheetsRouter = Router()

sheetsRouter.route('/:spreadsheetId')
  .get(async (req, res, next) => {
    try {
      const { properties, sheets } = await getSpreadSheetMetaData(req.params.spreadsheetId)
      const response = {
        spreadsheetTitle: properties.title,
        sheetNames: sheets.map(sheetData => sheetData.properties.title)
      }

      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      res.json(response)
    } catch (error) {
      return next(error)
    }
  })

sheetsRouter.route('/:spreadsheetId/sheet')
  .get(verifyUser, async (req, res, next) => {
    try {
      const { spreadsheetId } = req.params
      const { page = 1, limit = 50, sheetName } = req.query
      const { rowStart, rowEnd } = getRowLimits(page, limit)
      const columnNames = await getColumnNames(spreadsheetId, sheetName)

      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      res.json(await getSheet(spreadsheetId, sheetName, columnNames, rowStart, rowEnd))
    } catch (error) {
      return next(error)
    }
  })
  .post(verifyUser, async (req, res, next) => {
    try {
      const { spreadsheetId } = req.params
      const { page = 1, limit = 50, sheetName } = req.query
      const { filter } = req.body
      const { rowStart, rowEnd } = getRowLimits(page, limit)

      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      res.json(await getFilteredSheet(spreadsheetId, sheetName, filter, rowStart, rowEnd))
    } catch (error) {
      return next(error)
    }
  })

sheetsRouter.route('/:spreadsheetId/sheet/columns')
  .get(async (req, res, next) => {
    try {
      const { spreadsheetId } = req.params
      const { sheetName } = req.query
      const response = (await getColumnNames(spreadsheetId, sheetName))
        .filter(name => name !== '')

      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      res.json(response)
    } catch (error) {
      return next(error)
    }
  })


export default sheetsRouter
