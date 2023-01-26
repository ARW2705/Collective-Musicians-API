import { indexToColAlpha } from '../../shared/index-to-col-alpha'

/**
 * Convert query params to Google Sheets Range in A1 Notation
 * see https://developers.google.com/sheets/api/guides/concepts#cell for possible query param combinations
 * 
 * @param: sheetName - the title of the sheet
 * @param: [rowStart] - optional starting row index
 * @param: [rowEnd] - optional ending row index inclusive
 * @param: [colStart] - optional starting column index
 * @param: [colEnd] - optional ending columns index inclusive
 * @return: A1 range notation for query
 */
function queryToRange(sheetName, rowStart, rowEnd, colStart, colEnd) {
  try {
    let query = sheetName
    if (rowStart || rowEnd || colStart || colEnd) {
      const strColStart = indexToColAlpha(colStart || colEnd || -1)
      const strRowStart = rowStart || rowEnd || ''
      const strColEnd = indexToColAlpha(colEnd || colStart || -1)
      const strRowEnd = rowEnd || rowStart || ''
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
  queryToRange
}
