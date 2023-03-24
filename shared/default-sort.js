function defaultSort(prop, isDescending) {
  return (a, b) => {
    if (b === undefined || b === null) return -1
    if (a === undefined || a === null) return 1

    let valueA = a[prop]
    let valueB = b[prop]
    if (valueB === undefined || valueB === null) return -1
    if (valueA === undefined || valueA === null) return 1

    if (typeof valueA !== 'string') valueA = valueA.toString()
    if (typeof valueB !== 'string') valueB = valueB.toString()
    return (isDescending && valueA < valueB) || (!isDescending && valueA > valueB) ? -1 : 1
  }
}

export { defaultSort }
