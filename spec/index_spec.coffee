index = require '../src/index'

describe 'Index', ->

  it 'exposes Nomplate', ->
    expect(index.Nomplate).toBeTruthy()

  it 'exposes Nomtml', ->
    expect(index.Nomtml).toBeTruthy()
