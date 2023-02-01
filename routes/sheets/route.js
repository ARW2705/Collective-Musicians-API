import { Router } from 'express'
import createError from 'http-errors'
import { verifyUser } from '../../authenticate.js'
import { getSpreadSheetMetaData, getSheetValues, mapColumns, getColumnMap } from '../../sheets/connector/connector.js'
import { queryToRange, getFilteredSheet, getSheet, getColumnNames, getRowLimits } from './helpers.js'


const sheetsRouter = Router()

sheetsRouter.route('/:spreadsheetId')
  .get(verifyUser, async (req, res, next) => {
    try {
      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      res.json(await getSpreadSheetMetaData(req.params.spreadsheetId))
    } catch (error) {
      return next(error)
    }
  })

sheetsRouter.route('/:spreadsheetId/query')
  .get(verifyUser, async (req, res, next) => {
    try {
      const { sheetName, rowStart, rowEnd, colStart, colEnd } = req.query
      const range = queryToRange(sheetName, rowStart, rowEnd, colStart, colEnd)

      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      res.json(await getSheetValues(req.params.spreadsheetId, range))
    } catch (error) {
      console.log(error)
      return next(error.name === 'QueryError' ? createError(400, error.message) : error)
    }
  })

sheetsRouter.route('/:spreadsheetId/query-terms')
  .get(verifyUser, async (req, res, next) => {
    try {
      const columnsMap = await getColumnMap(req.params.spreadsheetId)
      let queryTerms = {}
      for (const queryKey in columnsMap) {
        let sheetTerms = []
        for (const sheetKey in columnsMap[queryKey]) {
          sheetTerms = [...sheetTerms, sheetKey]
        }
        queryTerms = { ...queryTerms, [queryKey]: sheetTerms }
      }

      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      res.json(queryTerms)
    } catch (error) {
      return next(error)
    }
  })

sheetsRouter.route('/:spreadsheetId/refresh-query-terms')
  .get(verifyUser, async (req, res, next) => {
    try {
      const { spreadsheetId } = req.params
      await mapColumns(spreadsheetId)

      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      res.json(await getColumnMap(spreadsheetId))
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


export default sheetsRouter
