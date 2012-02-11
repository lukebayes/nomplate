
require './test/express_test'
require './test/pretty_test'
require './test/nomplate_test'
require './test/nomtml_test'

process.on 'exit', ->
  console.log '>> Exiting after all tests'
