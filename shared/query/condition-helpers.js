/**
 * Split a string representing a date into an array of [YEAR, MONTH, DAY]
 * 
 * @param  {String} date - a year value or a slash/dash formatted date
 * @param  {String} [delimiter] - character to split date on if it is formatted
 * @param  {String} [format] - the representation of the date; Defaults to Month/Day/Year
 *                             (e.g. month/day/year -> 'mdy'; day/month/year -> 'dmy')
 * @return {Number[]} array of date values in the order of Year -> Month -> Day
 */
function _splitDateString(date, delimiter, format = 'mdy') {
  if (!delimiter) return [+date]

  const strDates = date.split(delimiter)
  let orderedValues = [...strDates]
  if (strDates.length === 2) {
    orderedValues.reverse()
  } else if (strDates.length === 3) {
    orderedValues = [strDates[format.indexOf('y')], strDates[format.indexOf('m')], strDates[format.indexOf('d')]]
  }

  return orderedValues.map(strDate => +strDate)
}

/**
 * Compare arrays of date representations
 * Dates are expected to be in the order of [Year, Month, Day] with at least a Year value
 * Dates with different lengths will not compare mismatched indicies
 * 
 * @param  {Number[]} dateArr1 - date array
 * @param  {Number[]} dateArr2 - date array
 * @return {Number} - 0 if dates are equal,
 *                    negative if dateArr1 is before dateArr2,
 *                    positive if dateArr1 is after dateArr2
 * @example
 * dateArr1 = [1990, 5, 1]
 * dateArr2 = [1990, 5]
 * returns 0 - only years and months will be compared, day within dateArr1 will be ignored 
 */
function compareDateArrays(dateArr1, dateArr2) {
  if (!dateArr1.length || !dateArr2.length) throw new Error('Cannot compare empty date')

  const smallerLength = (dateArr1.length < dateArr2.length ? dateArr1 : dateArr2).length
  for (let i = 0; i < smallerLength; i++) {
    const date1 = dateArr1[i]
    const date2 = dateArr2[i]
    if (date1 !== date2) return date1 - date2
  }

  return 0
}

/**
 * Parse a string date value
 * 
 * @param  {String} date - may be a single year (e.g. '1990') or a separated date (e.g. '1/1/1999')
 * @return {Number[]} date values in the order of Year -> Month -> Day
 */
function parseDate(date) {
  if (date === '') return null

  let delimiter = null
  if (date.includes('/')) delimiter = '/'
  if (date.includes('-')) delimiter = '-'

  return _splitDateString(date, delimiter)
}

/**
 * Parse a target date string
 * 
 * @param  {String[]} target - date representation in the order of Year -> Month -> Day
 * @return {Number[]} date values in the order of Year -> Month -> Day
 */
function parseDateTarget(target) {
  const parsedTarget = parseDate(target)
  if (!parsedTarget) throw new Error(`${target} is not a valid target date`)
  return parsedTarget
}

/**
 * Parse a value to a number. Supports currency and comma separated values
 * 
 * @param  {String | Number} value - a number, string of number, or string of currency
 * @return {Number} the value as a number - throws if value cannot be parsed 
 */
function parseNumber(value) {
  if (typeof value === 'string') {
    value = value.replace('$', '')
    value = value.replaceAll(',', '')
  }

  const number = +value
  if (isNaN(number)) {
    throw new Error(`${value} must be serializable to a Number`)
  }

  return number
}


export {
  _splitDateString,
  compareDateArrays,
  parseDate,
  parseDateTarget,
  parseNumber
}
