const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

/**
 * Convert a 0 based index to an A1 alphabetical column index
 * 
 * @param: index - numerical index to convert
 * @return: A1 notation of the given index
 * @example:
 *  4 -> 'D'
 *  47 -> 'AU'
 *  600 -> 'WC'
 *  702 -> 'AAA'
 */
function indexToColAlpha(index) {
  if (index < alphabet.length) return alphabet[index]
  
  return (
    indexToColAlpha(Math.floor(index / alphabet.length) - 1)
    + indexToColAlpha(index % alphabet.length)
  )
}


export { indexToColAlpha }
