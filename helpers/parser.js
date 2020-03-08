/**
 *
 * @param {import('vscode').TextDocument} document
 */
function getLines(document) {
  const documentText = document.getText()
  return documentText.split('\n')
}

function getPropTypesStartLineIndices(lines) {
  const propTypesStartLineIndices = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/.propTypes/.test(line)) {
      propTypesStartLineIndices.push(i)
    }
  }

  return propTypesStartLineIndices
}

function getPropTypesString(lines, propTypesStartLineIndex) {
  const firstLine = lines[propTypesStartLineIndex]

  let propTypesString = firstLine
  let count = 0

  const firstLineBrackets = firstLine.match(/[{}]/)
  for (const bracket of firstLineBrackets) {
    if (bracket === '{') count++
    else count--
  }

  if (count < 0) {
    // invalid json
    throw new Error('Invalid json')
  }

  for (let i = propTypesStartLineIndex + 1; i < lines.length; i++) {
    const line = lines[i]
    const brackets = line.match(/[{}]/) || []

    if (count === 0) {
      return propTypesString
    }

    propTypesString += line

    for (const bracket of brackets) {
      if (count === 0) {
        return propTypesString
      }

      if (bracket === '{') {
        count++
      } else {
        count--
      }
    }
  }
  throw new Error('Invalid json')
}

/**
 *
 * @param {import('vscode').TextDocument} document
 * @return {string[]}
 */
function getPropTypesStrings(document) {
  const lines = getLines(document)
  const propTypesStrings = []

  const propTypesStartLineIndices = getPropTypesStartLineIndices(lines)

  for (const index of propTypesStartLineIndices) {
    try {
      const propTypesString = getPropTypesString(lines, index)
      propTypesStrings.push(propTypesString)
    } catch (error) {}
  }

  return propTypesStrings
}

/**
 *
 * @param {import('vscode').TextDocument} document
 * @return {Object<string, Object<string, string>>|{}}
 */
function getPropTypesObjects(document) {
  const proptypesStrings = getPropTypesStrings(document)
  const map = {}

  for (const str of proptypesStrings) {
    // first remove everything before the first opening bracket
    // and remove everything after the last closing bracket
    const i = str.indexOf('{')
    const j = str.lastIndexOf('}')

    const componentName = str.substring(0, i).split('.')[0]
    const obj = getObject(str.substring(i + 1, j))
    map[componentName] = obj
  }

  return map
}

/**
 *
 * @param {string} str
 */
function getJSDocType(str) {
  const type = str.match(/PropTypes.[a-zA-Z]+/)[0].split('.')[1]

  switch (type) {
    case 'arrayOf': {
      const innerContent = getInnerContent('(', ')', str)
      return '[' + getJSDocType(innerContent) + ']'
    }
    case 'shape': {
      const innerContent = getInnerContent('{', '}', str)
      const obj = getObject(innerContent)
      const parsedArray = Object.keys(obj).map(name => {
        return `${name}: ${getJSDocType(obj[name])}`
      })
      const parsed = parsedArray.join(',')
      return '{' + parsed + '}'
    }
    case 'func': {
      return 'function'
    }
    default:
      return type
  }
}

/**
 *
 * @param {string} openingSymbol
 * @param {string} closingSymbol
 * @param {string} str
 */
function getInnerContent(openingSymbol, closingSymbol, str) {
  const startIndex = str.indexOf(openingSymbol) + 1
  let count = 1
  let innerString = ''

  for (let i = startIndex; i < str.length; i++) {
    if (str.charAt(i) === openingSymbol) count++
    else if (str.charAt(i) === closingSymbol) count--

    if (count === 0) return innerString

    innerString += str.charAt(i)
  }

  return innerString
}

/**
 *
 * @param {string} strObj
 */
function getObject(strObj) {
  let scanningType = 'name'
  let name = ''
  let value = ''
  let obj = {}

  for (let i = 0; i < strObj.length; i++) {
    if (scanningType === 'name') {
      if (strObj.charAt(i) === ':') {
        scanningType = 'value'
        continue
      }

      name += strObj.charAt(i)
    } else if (scanningType === 'value') {
      if (strObj.charAt(i) === ',') {
        obj[name.trim()] = value.trim()
        name = ''
        value = ''
        scanningType = 'name'
        continue
      }

      if (strObj.charAt(i) === '(') {
        const innerContent = getInnerContent('(', ')', strObj.substring(i))
        value += '(' + innerContent + ')'
        i = i + innerContent.length + 1
        continue
      }

      value += strObj.charAt(i)
    }
  }

  // add the last one
  obj[name.trim()] = value.trim()

  return obj
}

module.exports = {
  getPropTypesObjects,
  getLines,
  getJSDocType,
  getObject
}
