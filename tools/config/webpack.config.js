const path = require('path');
module.exports = {
  entry: './build/src/core.js',
  output: {
    filename: 'translatex.js',
    path: path.resolve(__dirname, '../../dist'),
  },
};
