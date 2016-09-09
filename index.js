var parser = require('./lib/parser')

module.exports = {
  parse: function(input) {
    try {
      return parser.parse(input.toString())
    } catch (e) {
      console.log(e.location)
      throw e
    }
  }
}
