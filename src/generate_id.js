/* eslint-disable no-bitwise */
/* eslint-disable no-mixed-operators */
/* eslint-disable prefer-template */

const lut = [];

for (let i = 0; i < 256; i += 1) {
  lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
}

function generateId() {
  const d0 = Math.random() * 0xffffffff | 0;
  const d1 = Math.random() * 0xffffffff | 0;

  const id = lut[d0 & 0xff] +
    lut[d0 >> 8 & 0xff] +
    lut[d0 >> 16 & 0xff] +
    lut[d0 >> 24 & 0xff] + '-' +
    lut[d1 & 0xff] +
    lut[d1 >> 8 & 0xff];

  return id;
}

module.exports = generateId;

/* eslint-enable no-bitwise */
/* eslint-enable no-mixed-operators */
/* eslint-enable prefer-template */
