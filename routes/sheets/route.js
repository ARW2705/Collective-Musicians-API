import { Router } from 'express'
import createError from 'http-errors'
import { verifyAdmin, verifyUser } from '../../authenticate.js'
import { toCamelCase } from '../../shared/to-camel-case.js'
import Definitions from '../../models/Definitions.js'
import { getSpreadSheetMetaData } from '../../sheets/connector/connector.js'
import { getFilteredSheet, getSheet, getColumnNames, getRowLimits } from './helpers.js'
import { INTERNAL_SHEET_DELIMITER, SPREADSHEET_CONTEXT_SHEET_NAME } from '../../shared/constants/internal-sheet-delimiter.js'


const sheetsRouter = Router()

sheetsRouter.route('/')
  .get(async (req, res, next) => {
    try {
      const { connectedSpreadsheetId } = await Definitions.findOne({}).exec()
      const { properties, sheets } = await getSpreadSheetMetaData(connectedSpreadsheetId)
      const configuredSheets = sheets.map(sheet => ({ name: sheet.properties.title, columnNames: [] }))

      let response = {
        id: connectedSpreadsheetId,
        name: properties.title,
        sheets: configuredSheets
      }

      const contentSheets = configuredSheets
        .map(sheet => sheet.name.includes(INTERNAL_SHEET_DELIMITER) ? null : sheet)
        .filter(sheet => sheet !== null)

      if (contentSheets.length > 0) {
        const columnNames = await getColumnNames(connectedSpreadsheetId, SPREADSHEET_CONTEXT_SHEET_NAME)
        const contextSheets = await getSheet(connectedSpreadsheetId, SPREADSHEET_CONTEXT_SHEET_NAME, 2, sheets.length, columnNames)
        
        response = {
          ...response,
          sheets: contentSheets,
          sheetContext: contextSheets.reduce((acc, curr) => {
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

sheetsRouter.route('/sheet')
  .get(async (req, res, next) => {
    try {
      const { connectedSpreadsheetId } = await Definitions.findOne({}).exec()
      const { sheetName } = req.query
      const { sheets } = await getSpreadSheetMetaData(connectedSpreadsheetId)
      const contextSheetProps = sheets.find(sheet => sheet.properties.title === sheetName)
      const rowEnd = contextSheetProps
        ? contextSheetProps.properties.gridProperties.rowCount
        : 1000

      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      res.json(await getSheet(connectedSpreadsheetId, sheetName, 2, rowEnd))
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
      res.json(await getSheet(connectedSpreadsheetId, sheetName, rowStart, rowEnd, columnNames))
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

sheetsRouter.route('/sheet/context')
  .get(async (req, res, next) => {
    try {
      const { connectedSpreadsheetId } = await Definitions.findOne({}).exec()
      const { sheetName: baseSheetName } = req.query
      const sheetName = `__Internal ${baseSheetName}`
      const columnNames = await getColumnNames(connectedSpreadsheetId, baseSheetName)
      const contextColumnNames = await getColumnNames(connectedSpreadsheetId, sheetName)
      const { sheets } = await getSpreadSheetMetaData(connectedSpreadsheetId)
      const contextSheetProps = sheets.find(sheet => sheet.properties.title === sheetName)
      let rowEnd = 100
      if (contextSheetProps) {
        rowEnd = contextSheetProps.properties.gridProperties.rowCount
      }

      const sheetContext = (await getSheet(connectedSpreadsheetId, sheetName, 2, rowEnd, contextColumnNames))
        .reduce(
          (formattedContext, context) => {
            const [keyName, ...dataKeys] = contextColumnNames
            let nextContext = {}
            dataKeys.forEach(key => {
              nextContext = {
                ...nextContext,
                [toCamelCase(key)]: context[key]
              }
            })

            return {
              ...formattedContext,
              [context[keyName]]: nextContext
            }
          },
          {}
        )

      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      res.json({ columnNames, sheetContext })
    } catch (error) {
      console.log(error, error.code)
      return next(error)
    }
  })


export default sheetsRouter
