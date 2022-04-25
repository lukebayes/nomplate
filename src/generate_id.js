/* eslint-disable no-bitwise */
/* eslint-disable no-mixed-operators */
/* eslint-disable prefer-template */

const lut = [];

for (let i = 0; i < 256; i += 1) {
  lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
}

function generateId(opt_len) {
  const len = opt_len || 13;
  const halfLen = (len / 2) - 1;
  const count = Math.ceil(len / 8);
  const parts = new Array(len + 1);

  let d = 0;
  let pushed = 0;

  for (let i = 0; i < count; i++) {
    d = Math.random() * 0xffffffff | 0;
    if (pushed++ < halfLen) {
      parts.push(lut[d & 0xff]);
    }
    if (pushed++ < halfLen) {
      parts.push(lut[d >> 8 & 0xff]);
    }
    if (pushed++ < halfLen) {
      parts.push(lut[d >> 16 & 0xff]);
    }
    if (pushed++ < halfLen) {
      parts.push(lut[d >> 24 & 0xff]);
    }
    if (pushed % 4 === 0 && pushed < halfLen) {
      parts.push('-');
    }
  }

  return parts.join('');

  /*
  const d0 = Math.random() * 0xffffffff | 0;
  const d1 = Math.random() * 0xffffffff | 0;

  const id = lut[d0 & 0xff] +
    lut[d0 >> 8 & 0xff] +
    lut[d0 >> 16 & 0xff] +
    lut[d0 >> 24 & 0xff] + '-' +
    lut[d1 & 0xff] +
    lut[d1 >> 8 & 0xff];

  return id;
  */

}

module.exports = generateId;

/* eslint-enable no-bitwise */
/* eslint-enable no-mixed-operators */
/* eslint-enable prefer-template */
