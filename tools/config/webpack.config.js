const path = require('path');
module.exports = {
  mode: 'development',
  entry: './src/core.js',
  output: {
    filename: 'translatex.js',
    path: path.resolve(__dirname, '../../dist'),
    library: 'TransLaTeX',
    globalObject: 'this',
    libraryTarget: 'umd',
  },
};
