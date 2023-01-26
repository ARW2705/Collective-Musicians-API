import { Router } from 'express'
import createError from 'http-errors'
import { verifyUser } from '../../authenticate'
import { getSpreadSheetMetaData, getSheetValues, mapColumns, getColumnMap } from '../../sheets-connector/connector'
import { queryToRange } from './helpers'


const sheetsRouter = Router()

sheetsRouter.route('/:spreadsheetId')
  .get(verifyUser, async (req, res, next) => {
    try {
      const response = await getSpreadSheetMetaData(req.params.spreadsheetId)
      
      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      res.json(response)
    } catch (error) {
      return next(error)
    }
  })

sheetsRouter.route('/:spreadsheetId/query')
  .get(verifyUser, async (req, res, next) => {
    try {
      const { sheetName, rowStart, rowEnd, colStart, colEnd } = req.query
      const range = queryToRange(sheetName, rowStart, rowEnd, colStart, colEnd)
      const response = await getSheetValues(req.params.spreadsheetId, range)

      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      res.json(response)
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
      const columnsMap = await getColumnMap(spreadsheetId)

      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      res.json(columnsMap)
    } catch (error) {
      return next(error)
    }
  })

sheetsRouter.route('/:spreadsheetId/sheet')
  .get(verifyUser, async (req, res, next) => {
    try {
      const { spreadsheetId } = req.params
      const { sheetName } = req.query
      const { values } = await getSheetValues(spreadsheetId, sheetName)

      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      res.json({
        keys: values[0],
        values: values.slice(1)
      })
    } catch (error) {
      return next(error)
    }
  })


export default sheetsRouter
