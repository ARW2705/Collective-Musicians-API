import { Router } from 'express'
import createError from 'http-errors'
import { verifyUser } from '../../authenticate.js'
import { toCamelCase } from '../../shared/to-camel-case.js'
import Definitions from '../../models/Definitions.js'
import { getSpreadSheetMetaData } from '../../sheets/connector/connector.js'
import { getFilteredSheet, getSheet, getColumnNames, getRowLimits } from './helpers.js'


const sheetsRouter = Router()

sheetsRouter.route('/')
  .get(async (req, res, next) => {
    try {
      const { connectedSpreadsheetId } = await Definitions.findOne({}).exec()
      const { properties, sheets } = await getSpreadSheetMetaData(connectedSpreadsheetId)
      let configuredSheets = await Promise.all(sheets.map(async sheet => ({
        name: sheet.properties.title,
        columnNames: (await getColumnNames(connectedSpreadsheetId, sheet.properties.title))
          .filter(name => name !== '')
      })))

      let response = {
        id: connectedSpreadsheetId,
        name: properties.title,
        sheets: configuredSheets
      }

      const contextSheetName = 'Internal Sheets Context'
      const contextSheetIndex = configuredSheets.findIndex(sheet => sheet.name === contextSheetName)
      if (contextSheetIndex !== -1) {
        const contentSheets = [...configuredSheets.slice(0, contextSheetIndex), ...configuredSheets.slice(contextSheetIndex + 1)] 
        const columnNames = await getColumnNames(connectedSpreadsheetId, contextSheetName)
        const contextSheets = await getSheet(connectedSpreadsheetId, contextSheetName, columnNames, 2, sheets.length)
        response = {
          ...response,
          sheets: contentSheets,
          contextSheet: contextSheets.reduce((acc, curr) => {
            const { 'Sheet Name': sheetName, ...remainder } = curr
            let context = {}
            for (const key in remainder) {
              context = { ...context, [toCamelCase(key)]: curr[key] }
            }
            
            return { ...acc, [sheetName]: context }
          },
          {})
        }
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
      const { filter, sort } = req.body
      const { rowStart, rowEnd } = getRowLimits(page, limit)

      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      res.json(await getFilteredSheet(connectedSpreadsheetId, sheetName, filter, sort, rowStart, rowEnd))
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
