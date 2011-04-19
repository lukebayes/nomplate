
fs = require('fs')
require.paths.unshift(fs.realpathSync(__dirname))

exports.Nomplate = require('nomplate/base').Nomplate
exports.Nomtml = require('nomplate/nomtml').Nomtml

