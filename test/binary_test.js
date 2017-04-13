const assert = require('chai').assert;
const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

describe('binary test', () => {

  const expectedOutput = '<div>\n' +
      '  <h1>hello world: abcd</h1>\n' +
      '  <div>from inside</div>\n' +
    '</div>\n\n';

  it('gets results from binary', (done) => {
    const args = ['--pretty', '--foo', 'abcd', './test/fixtures/view.js'];
    const binary = path.resolve(path.join(__dirname, '../bin/nomplate.js'));
    const comparisonFile = path.resolve(path.join(__dirname, '/fixtures/view.html'));
    childProcess.execFile(binary, args, (result, stdout, stderr) => {
      try {
        assert.isNull(result, 'childProcess result should be null');
        assert.equal(stdout, expectedOutput);
        done();
      } catch (err) {
        done(err);
      }
    });
  });
});
