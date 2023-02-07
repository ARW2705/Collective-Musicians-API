import { indexToColAlpha } from '../../shared/index-to-col-alpha.js'
import { filter, buildConditionGroups } from '../../shared/query/filter.js'
import { getSheetValues } from '../../sheets/connector/connector.js'


/**
 * Get column names from a sheet
 * 
 * @param  {String} spreadsheetId - id of the parent spreadsheet
 * @param  {String} sheetName - name of the sheet from which to get column names
 * @return {String[]} array of column names
 */
async function getColumnNames(spreadsheetId, sheetName) {
  const columnNameRange = queryToRange(sheetName, 1)
  const columnNamesResponse = await getSheetValues(spreadsheetId, columnNameRange)
  const { values } = columnNamesResponse
  return values?.length > 0 ? values[0] : []
}

/**
 * Get a filtered and paginated sheet as key: value paired documents
 * 
 * @param  {String} spreadsheetId - id of the parent spreadsheet
 * @param  {String} sheetName - name of the sheet to filter
 * @param  {Object} queryFilter - filtering config data
 * @param  {Number} rowStart - pagination start
 * @param  {Number} rowEnd - pagination end
 * @return {Object[]} array of filtered document objects
 */
async function getFilteredSheet(spreadsheetId, sheetName, queryFilter, rowStart, rowEnd) {
  const { values } = await getSheetValues(spreadsheetId, sheetName)
  const filters = {
    includeColumns: queryFilter.includeColumns,
    conditions: buildConditionGroups(queryFilter.conditions)
  }

  return filter(values, filters, rowStart, rowEnd)
}

/**
 * Get starting and ending page limits
 * 
 * @param  {Number} page - page index to start (1-indexed; first row is always column names, skip this row each time)
 * @param  {Number} limit - number of results per page
 * @return {Number, Number} the start and end index of the page 
 */
function getRowLimits(page, limit) {
  const [_page, _limit] = [parseInt(page), parseInt(limit)]
  const rowStart = (_page - 1) * _limit + 2
  const rowEnd = rowStart + _limit - 1
  return { rowStart, rowEnd }
}

/**
 * Get a paginated sheet as key: value paired documents 
 * 
 * @param  {String} spreadsheetId - id of the parent spreadsheet
 * @param  {String} sheetName - name of the sheet to filter
 * @param  {String[]} columnNames - array of columns names; used in document formation
 * @param  {Number} rowStart - pagination start
 * @param  {Number} rowEnd - pagination end
 * @return {Object[]} array of document objects
 */
async function getSheet(spreadsheetId, sheetName, columnNames, rowStart, rowEnd) {
  const range = queryToRange(sheetName, rowStart, rowEnd)
  const { values } = await getSheetValues(spreadsheetId, range)
  return values.map(row => {
    return columnNames.reduce((doc, columnName, index) => {
      if (!columnName) return doc
      return { ...doc, [columnName]: index < row.length ? row[index] : '' }
    }, {})
  })
}

/**
 * Convert query params to Google Sheets Range in A1 Notation
 * see https://developers.google.com/sheets/api/guides/concepts#cell for possible query param combinations
 * 
 * @param  {String} sheetName - the title of the sheet
 * @param  {Number} [rowStart] - optional starting row index
 * @param  {Number} [rowEnd] - optional ending row index inclusive
 * @param  {Number} [colStart] - optional starting column index
 * @param  {Number} [colEnd] - optional ending columns index inclusive
 * @return {String} A1 range notation for query
 */
 function queryToRange(sheetName, rowStart, rowEnd, colStart, colEnd) {
  try {
    let query = sheetName
    if (rowStart || rowEnd || colStart || colEnd) {
      const strColStart = indexToColAlpha(colStart || colEnd   || -1)
      const strColEnd   = indexToColAlpha(colEnd   || colStart || -1)
      const strRowStart = rowStart || rowEnd   || ''
      const strRowEnd   = rowEnd   || rowStart || ''
      query += `!${strColStart}${strRowStart}:${strColEnd}${strRowEnd}`
    }

    return query
  } catch (error) {
    console.log(error)
    const badQueryError = new Error(`Invalid query params: ${error.message || 'please check query request'}`)
    Object.assign(badQueryError, { name: 'QueryError' })
    throw badQueryError
  }
}


export {
  getColumnNames,
  getFilteredSheet,
  getRowLimits,
  getSheet,
  queryToRange
}
