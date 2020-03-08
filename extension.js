// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode')
const { writeJSDocComments } = require('./helpers/writeJSDocComments')
const { parse } = require('./helpers/parser')

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "jsdoc-proptypes" is now active!'
  )

  vscode.workspace.onDidSaveTextDocument(document => {
    if (
      document.languageId === 'javascriptreact' &&
      document.uri.scheme === 'file'
    ) {
      /*const parsed = parse(
        'PropTypes.arrayOf(\n' +
          'PropTypes.shape({\n' +
          'backgroundImageURL: PropTypes.string,\n' +
          'buttonLinks: PropTypes.arrayOf(\n' +
          'PropTypes.shape({\n' +
          'buttonType: PropTypes.string,\n' +
          'linkType: PropTypes.string,\n' +
          'text: PropTypes.string,\n' +
          'url: PropTypes.string\n' +
          '})\n' +
          '),\n' +
          'categories: PropTypes.arrayOf(PropTypes.string),\n' +
          'description: PropTypes.string,\n' +
          'publishedTimestamp: PropTypes.number,\n' +
          'title: PropTypes.string\n' +
          '})\n' +
          ')\n'
      )*/
      // console.log(parsed)
      writeJSDocComments(document)
    }
  })
}
exports.activate = activate

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
}
