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
    configuredConditionGroup = {
      ...configuredConditionGroup,
      [key]: conditionGroup[key]
        .map(({ condition, target, options = {} }) => {
          if (!Object.keys(conditionals).includes(condition)) {
            throw new Error(`Unknown query conditional: ${condition}`)
          }

          return conditionals[condition](target, options)
        })
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
  if (!conditions.length) return true

  return conditions.some(conditionGroup => {
    for (const key in conditionGroup) {
      const columnIndex = columnNames.findIndex(columnName => columnName === key)
      if (columnIndex === -1 || columnIndex >= row.length) return false
      if (!conditionGroup[key].every(condition => condition(row[columnIndex]))) return false
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
    let value
    if (columnIndex === -1) {
      value = 'Error: Column Not Defined'
    } else if (columnIndex >= row.length || !row[columnIndex]) {
      value = 'No value'
    } else {
      value = row[columnIndex]
    }

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
  if (!conditions) return []
  return conditions.map(conditionGroup => buildConditionGroup(conditionGroup))
}

/**
 * Filter a sheet given a set of filters and desired page
 * 
 * @param  {(String | Number)[][]} sheet - the sheet values response
 * @param  {Object} filters - object containing columns to include and filter conditions
 * @param  {Number} rowStart - pagination start
 * @param  {Number} rowEnd - pagination end
 * @return {Object[],Number} array of objects containing key:value pairs of filtered data and the total matched count
 */
function filter(sheet, filters, rowStart, rowEnd) {
  if (rowStart > sheet.length) return []

  const allColumnNames = sheet[0]
  const { conditions } = filters
  let responseIndices = []
  let matchCount = 0
  for (let index = 1; index < sheet.length; index++) {
    const row = sheet[index]
    if (isMatchingRow(row, allColumnNames, conditions)) {
      matchCount++

      if (matchCount >= rowStart - 1 && matchCount < rowEnd) {
        responseIndices = [...responseIndices, index]
      }
    }
  }

  const { includeColumns } = filters
  const responseColumns = includeColumns && includeColumns.length > 0 ? includeColumns : allColumnNames
  return {
    results: responseIndices.map(index => buildDocument(sheet[index], responseColumns, allColumnNames)),
    resultCount: matchCount
  }
}


export {
  buildConditionGroups,
  filter
}
