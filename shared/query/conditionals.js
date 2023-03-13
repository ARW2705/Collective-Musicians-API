import { compareDateArrays, parseDate, parseDateTarget, parseNumber } from './condition-helpers.js'


/**
 * Check if given value is greater than but not equal to target
 * 
 * @param  {Number | String} target - the target to filter query against
 * @return {Number | String => Boolean} function that takes the sheet value and compares to target
 */
function greaterThan(target) {
  return function(value) {
    return parseNumber(value) > parseNumber(target)
  }
}

/**
 * Check if given value is greater than or equal to target
 * 
 * @param  {Number | String} target - the target to filter query against
 * @return {Number | String => Boolean} function that takes the sheet value and compares to target
 */
function greaterThanOrEqual(target) {
  return function(value) {
    return parseNumber(value) >= parseNumber(target)
  }
}

/**
 * Check if given value is lesser than but not equal to target
 * 
 * @param  {Number | String} target - the target to filter query against
 * @return {Number | String => Boolean} function that takes the sheet value and compares to target
 */
function lesserThan(target) {
  return function(value) {
    return parseNumber(value) < parseNumber(target)
  }
}

/**
 * Check if given value is lesser than or equal to target
 * 
 * @param  {Number | String} target - the target to filter query against
 * @return {Number | String => Boolean} function that takes the sheet value and compares to target
 */
function lesserThanOrEqual(target) {
  return function(value) {
    return parseNumber(value) <= parseNumber(target)
  }
}

/**
 * Check if given value is strict equal to target
 * 
 * @param  {Number | String} target - the target to filter query against
 * @return {Number | String => Boolean} function that takes the sheet value and compares to target
 */
function equal(target, options) {
  const _target = String(target)

  return function(value) {
    const _value = String(value)
    if (options.matchCase) {
      return _value === _target
    }
    
    return _value.toLowerCase() === _target.toLowerCase()
  }
}

/**
 * Check if given value is strict not equal to target
 * 
 * @param  {Number | String} target - the target to filter query against
 * @return {Number | String => Boolean} function that takes the sheet value and compares to target
 */
function notEqual(target, options) {
  const _target = String(target)

  return function(value) {
    const _value = String(value)
    if (options.matchCase) {
      return _value !== _target
    }
    
    return _value.toLowerCase() !== _target.toLowerCase()
  }
}

/**
 * Check if given value date is before target
 * 
 * @param  {String[]} target - the target to filter query against
 * @return {String[] => Boolean} function that takes the sheet value and compares to target
 */
function before(target) {
  const parsedTarget = parseDateTarget(target)

  return function(value) {
    const parsedDate = parseDate(value)
    if (!parsedDate) return false
    return compareDateArrays(parsedDate, parsedTarget) < 0
  }
}

/**
 * Check if given value date is on or before target
 * 
 * @param  {String[]} target - the target to filter query against
 * @return {String[] => Boolean} function that takes the sheet value and compares to target
 */
function beforeOrOn(target) {
  const parsedTarget = parseDateTarget(target)

  return function(value) {
    const parsedDate = parseDate(value)
    if (!parsedDate) return false
    return compareDateArrays(parsedDate, parsedTarget) <= 0
  }
}

/**
 * Check if given value date is after target
 * 
 * @param  {String[]} target - the target to filter query against
 * @return {String[] => Boolean} function that takes the sheet value and compares to target
 */
function after(target) {
  const parsedTarget = parseDateTarget(target)

  return function(value) {
    const parsedDate = parseDate(value)
    if (!parsedDate) return false
    return compareDateArrays(parsedDate, parsedTarget) > 0
  }
}

/**
 * Check if given value date is on or after target
 * 
 * @param  {String[]} target - the target to filter query against
 * @return {String[] => Boolean} function that takes the sheet value and compares to target
 */
function afterOrOn(target) {
  const parsedTarget = parseDateTarget(target)

  return function(value) {
    const parsedDate = parseDate(value)
    if (!parsedDate) return false
    return compareDateArrays(parsedDate, parsedTarget) >= 0
  }
}

/**
 * Check if given value date matches target
 * 
 * @param  {String[]} target - the target to filter query against
 * @return {String[] => Boolean} function that takes the sheet value and compares to target
 */
function datesMatch(target) {
  const parsedTarget = parseDateTarget(target)

  return function(value) {
    const parsedDate = parseDate(value)
    if (!parsedDate) return false
    return compareDateArrays(parsedDate, parsedTarget) === 0
  }
}


export {
  greaterThan as gt,
  greaterThanOrEqual as gte,
  lesserThan as lt,
  lesserThanOrEqual as lte,
  equal as eq,
  notEqual as neq,
  before as be,
  beforeOrOn as beon,
  after as af,
  afterOrOn as afon,
  datesMatch as dmatch
}
