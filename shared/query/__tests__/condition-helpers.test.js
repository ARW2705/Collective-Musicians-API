import { jest } from '@jest/globals'
import {
  _splitDateString,
  compareDateArrays,
  parseDate,
  parseDateTarget,
  parseNumber
} from '../condition-helpers.js'


describe('Query: Condition Helpers', () => {

  afterEach(() => {
    jest.resetModules()
  })

  test('should split a string representation of a date into an array of numbers', () => {
    expect(_splitDateString('5/1/1990', '/')).toStrictEqual([1990, 5, 1])
    expect(_splitDateString('5/1/1990', '/', 'dmy')).toStrictEqual([1990, 1, 5])
    expect(_splitDateString('5-1990', '-')).toStrictEqual([1990, 5])
    expect(_splitDateString('1990')).toStrictEqual([1990])
  })

  test('should compare two date representations', () => {
    expect(compareDateArrays([1990, 5, 1], [1990, 5, 1])).toEqual(0)
    expect(compareDateArrays([1990, 5, 1], [1990])).toEqual(0)
    expect(compareDateArrays([1990, 5, 1], [1990, 5, 2]) < 0).toBe(true)
    expect(compareDateArrays([1991, 5], [1990, 5, 1]) > 0).toBe(true)
    expect(compareDateArrays([1991, 5, 1], [1990, 5, 1]) > 0).toBe(true)
    expect(() => { compareDateArrays([], []) }).toThrowError()
  })

  test('should parse a date string', () => {
    expect(parseDate('')).toBeNull()
    expect(parseDate('1990')).toStrictEqual([1990])
    expect(parseDate('1-1995')).toStrictEqual([1995, 1])
    expect(parseDate('1/2/1999')).toStrictEqual([1999, 1, 2])
  })

  test('should parse a date target', () => {
    expect(parseDateTarget('1990')).toStrictEqual([1990])
    expect(() => {
      parseDateTarget('')
    }).toThrowError()
  })

  test('should parse a number', () => {
    expect(parseNumber(5)).toEqual(5)
    expect(parseNumber('5')).toEqual(5)
    expect(parseNumber('$5,000.00')).toEqual(5000.0)
    expect(() => {
      parseNumber('puppy')
    }).toThrowError()
  })

})
