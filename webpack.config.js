//
// Webpack configuration file.
// Having this file allows running "webpack" without arguments.
//

const path = require('path');
const ExtensionReloader  = require('webpack-extension-reloader');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
  context: path.resolve(__dirname, 'src'),
  devtool: false,
  entry: {
    'background': './background.ts',
    'content': './content.ts',
    'pages/popup': './pages/popup.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist/unpacked'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.vue']
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loaders: 'vue-loader'
      },
      {
        test: /\.tsx?$/,
        use: [{
            loader: 'ts-loader',
            options: {
                appendTsSuffixTo: [/\.vue$/]
            }
        }]
      },
      {
        test: /\.css$/,
        use: ['style-loader','css-loader']
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new ExtensionReloader({
      manifest: path.resolve(__dirname, "src/manifest.json")
    }),
    new CopyWebpackPlugin([
      { from: 'manifest.json' },
      { from: 'pages/**/*.html' }
    ])
  ]
};
