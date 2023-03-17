/**
 * Convert a string to camel case
 * 
 * @param {String} str - input string
 * @return a string in camel case
 */
function toCamelCase(str) {
  const symbolRegex = /,.;:\?\/\\'"`~()[]{}<>/g
  const normalizedStr = str.replaceAll(symbolRegex, '')
  return normalizedStr
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index === 0) return word
      return `${word[0].toUpperCase()}${word.slice(1)}`
    })
    .join('')
}

export { toCamelCase }
