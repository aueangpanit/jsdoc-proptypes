const fs = require('fs')
const { getPropTypesObjects, getLines, getJSDocType } = require('./parser')

function writeJSDocComments(document) {
  const propTypesObjects = getPropTypesObjects(document)
  let lines = getLines(document)

  // get new file content
  Object.keys(propTypesObjects).forEach(componentName => {
    const newLines = getNewLines(
      propTypesObjects,
      componentName,
      lines,
      document
    )
    lines = newLines
  })

  // convert lines to string
  let content = ''
  lines.forEach(line => (content += line + '\n'))

  // write to file
  fs.writeFileSync(document.uri.fsPath, content)
}

/**
 *
 * @param {{} | { [x: string]: { [x: string]: string } }} propTypesJsons
 * @param {string} componentName
 * @param {string[]} lines
 */
function getNewLines(propTypesJsons, componentName, lines, document) {
  // create jsdoc comment for each component
  const componentJson = propTypesJsons[componentName]
  /** @type {{ propName: string, typeValue: string }[]} */
  const props = Object.keys(componentJson).map(propName => {
    const type = componentJson[propName]
    // const formattedType = type.replace(/(PropTypes.)|(.isRequired)/g, '')
    return { propName, typeValue: type }
  })

  // construct jsdoc string
  let jsdocString = '/**\n * @component\n * @param {object} props\n'

  for (const prop of props) {
    const JSDocType = getJSDocType(prop.typeValue, document)
    jsdocString += ` * @param {${JSDocType}} props.${prop.propName}\n`
  }

  jsdocString += ' */'

  // find component declaration line
  // i.e. find the line that contains const [componentName]
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.includes(`const ${componentName}`)) {
      if (i > 0 && lines[i - 1].includes('*/')) return lines.slice()

      lines.splice(i, 0, jsdocString)
      break
    }
  }

  return lines.slice()
}
module.exports = {
  writeJSDocComments
}
