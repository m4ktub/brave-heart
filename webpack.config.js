//
// Webpack configuration file.
// Having this file allows running "webpack" without arguments.
//

const package = require('./package.json');
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
    'pages/popup': './pages/popup.js',
    'pages/options': './pages/options.js',
    'pages/contribute': './pages/contribute.js'
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
        use: [{
            loader: 'vue-loader',
            options: {
                compilerOptions: {
                    whitespace: 'condense'
                }
            }
        }]
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
      { from: 'manifest.json', transform: updateVersion },
      { from: 'pages/**/*.html' },
      { from: 'images/**/*.*' },
      { from: '_locales/**/*.*' }
    ])
  ]
};

function updateVersion(input) {
  const text = input.toString();
  const data = JSON.parse(text);

  data.version = package.version;

  return JSON.stringify(data, null, 2);
}
