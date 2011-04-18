
require.paths.unshift 'lib'
require.paths.unshift 'test'

require 'pretty_test'
require 'nomplate_test'
require 'nomtml_test'

process.on 'exit', ->
  console.log '>> Exiting after all tests'



