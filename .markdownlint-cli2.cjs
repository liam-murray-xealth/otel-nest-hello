const options = require('@github/markdownlint-github').init({
  'line-length': {
    // For now until we fix
    line_length: 400,
  },
  'ul-style': {
    style: 'dash',
  },
})
module.exports = {
  config: options,
  ignores: ['CHANGELOG.md', '.github/**'],
  customRules: ['@github/markdownlint-github'],
  outputFormatters: [
    ['markdownlint-cli2-formatter-pretty', { appendLink: true }], // ensures the error message includes a link to the rule documentation
  ],
}
