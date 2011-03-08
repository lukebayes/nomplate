
require.paths.unshift 'src'
require.paths.unshift 'test'

require 'nomplate_test'

process.on 'exit', ->
  console.log '>> Exiting after all tests'



