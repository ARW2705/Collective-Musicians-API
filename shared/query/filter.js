import * as conditionals from './conditionals.js'


/**
 * Map array of conditions with their appropriate checking function
 * 
 * @param  {Object} conditionGroup - condition groups without validation functions attached
 * @return {Object} object with the applicable column name as the key
 *                  and checking function as the value
 */
function buildConditionGroup(conditionGroup) {
  let configuredConditionGroup = {}
  for (const key in conditionGroup) {
    const { condition, target, options = {} } = conditionGroup[key]
    if (!Object.keys(conditionals).includes(condition)) {
      throw new Error(`Unknown query conditional: ${condition}`)
    }

    configuredConditionGroup = {
      ...configuredConditionGroup,
      [key]: conditionals[condition](target, options)
    }
  }

  return configuredConditionGroup
}

/**
 * Check if a given row should be included in the final response
 * 
 * @param  {(String | Number)[]} row - the row to validate
 * @param  {String[]} columnNames - array of available sheet column names
 * @param  {Object[]} conditions - array of condition objects 
 * @return {Boolean} true if row matches the given conditions
 *                   conditions resolve with the following logic
 *                   comparisons between conditionGroups is treated as OR
 *                   comparisons within a conditionGroup is treated as AND
 *                   a condition that calls for a column name that is not available will always return false
 */
function isMatchingRow(row, columnNames, conditions) {
  return conditions.some(conditionGroup => {
    for (const key in conditionGroup) {
      const columnIndex = columnNames.findIndex(columnName => columnName === key)
      if (columnIndex === -1 || columnIndex >= row.length) return false
      if (!conditionGroup[key](row[columnIndex])) return false
    }

    return true
  })
}

/**
 * Build a document object from a row within the given column names
 * 
 * @param  {(String | Number)[]} row - a sheet row
 * @param  {String[]} includeColumns - array of column names to include
 * @param  {String[]} columnNames - array of available column names
 * @return {Object} object with column name as key and cell as value
 */
function buildDocument(row, includeColumns, columnNames) {
  return includeColumns.reduce((doc, column) => {
    const columnIndex = columnNames.findIndex(columnName => columnName === column)
    const value = columnIndex !== -1 && columnIndex < row.length
      ? row[columnIndex]
      : 'ERROR: Column Not Defined'
    return { ...doc, [column]: value }
  }, {})
}

/**
 * Build an array of condition group objects
 * 
 * @param  {Object[]} conditions - request input array of conditions 
 * @return {Object[]} array of configured condition group objects
 */
 function buildConditionGroups(conditions) {
  return conditions.map(conditionGroup => buildConditionGroup(conditionGroup))
}

/**
 * Filter a sheet given a set of filters and desired page
 * 
 * @param  {(String | Number)[][]} sheet - the sheet values response
 * @param  {Object} filters - object containing columns to include and filter conditions
 * @param  {Number} rowStart - pagination start
 * @param  {Number} rowEnd - pagination end
 * @return {Object[]} array of objects containing key:value pairs of filtered data
 */
function filter(sheet, filters, rowStart, rowEnd) {
  const allColumnNames = sheet[0]
  const { includeColumns, conditions } = filters
  const responseColumns = includeColumns && includeColumns.length > 0 ? includeColumns : allColumnNames
  let response = []
  let matchCount = 0
  for (let index = 1; index < sheet.length; index++) {
    const row = sheet[index]
    if (isMatchingRow(row, allColumnNames, conditions)) {
      matchCount++

      if (matchCount >= rowStart - 1) {
        response = [...response, buildDocument(row, responseColumns, allColumnNames)]
      }

      if (matchCount >= rowEnd - 1) break
    }
  }

  return response
}


export {
  buildConditionGroups,
  filter
}
