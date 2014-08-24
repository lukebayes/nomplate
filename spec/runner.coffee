process.env.NODE_ENV = 'test' unless process.env.NODE_ENV?

sys = require 'sys'
dir = 'jasmine-node/lib/jasmine-node/'
filename =  'jasmine-2.0.0'

filter = (list, predicate) ->
  predicate.call(context, item) for value of list

# Copy 'it', 'describe',... to global
for key, value of require("#{dir}#{filename}")
  global[key] = value

# Use jasmine-node's TerminalReporter for console output
TerminalReporter = require("#{dir}reporter").TerminalReporter
jasmine.getEnv().addReporter(new TerminalReporter(
  print: sys.print
  color: true
  stackFilter: (text) ->
    #_(text.split /\n/).filter((line) -> line.indexOf("#{dir}#{filename}") == -1).join('\n')
    lines = text.split /\n/
    filtered = filter(lines, (line) ->
        line.indexOf("#{dir}#{filename}") == -1)
    filtered.join('\n')
))

process.nextTick ->
  jasmine.getEnv().execute()

