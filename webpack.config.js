

'use strict';

var webpack = require('webpack');

module.exports = {
  entry: './browser/react/index.js',// the starting point for our program.. CHANGE THIS OBVIOUSLY WHEN YOU START USING REACT
  output: {
    path: __dirname + '/build', // the absolute path for the directory where we want the output to be placed
    filename: 'bundle.js' // the name of the file that will contain our output - we could name this whatever we want, but bundle.js is typical
  },
  context: __dirname,
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015']
        }
      }
    ]
  }
};



// module.exports = {
//
//   entry: __dirname + '/browser/react/index.js', // the starting point for our program.. CHANGE THIS OBVIOUSLY WHEN YOU START USING REACT
//   output: {
//     path: __dirname + '/browser', // the absolute path for the directory where we want the output to be placed
//     filename: 'bundle.js' // the name of the file that will contain our output - we could name this whatever we want, but bundle.js is typical
//   }
// }
