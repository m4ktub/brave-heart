//
// Webpack configuration file.
// Having this file allows running "webpack" without arguments.
//

const package = require('./package.json');
const fs = require('fs');
const path = require('path');
const ExtensionReloader  = require('webpack-extension-reloader');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

var config = {
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
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: {
            reserved: ['BigInteger','ECPair','Point']
          }
        }
      }),
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new CopyWebpackPlugin([
      { from: 'manifest.json', transform: updateManifest },
      { from: 'pages/**/*.html' },
      { from: 'images/**/*.*' },
      { from: '_locales/**/*.*' }
    ])
  ]
};

var browser;
function updateManifest(input) {
  // original file
  const text = input.toString();
  const data = JSON.parse(text);

  // extra file
  const browserFile = path.resolve(__dirname, `src/manifest.${browser}.json`);
  const browserData = fs.existsSync(browserFile) 
    ? JSON.parse(fs.readFileSync(browserFile)) 
    : {};
  
  // modify
  data.version = package.version;
  Object.assign(data, browserData);

  // format final value
  return JSON.stringify(data, null, 2);
}

module.exports = (env, argv) => {
  // adjust configuration for env
  browser = env.browser || 'chrome';
  config.output.path = path.resolve(__dirname, 'dist', browser);

  // adjust configuration for mode
  switch (argv.mode) {
    case 'development':
      // allow extension to automatically reload
      config.plugins.push(new ExtensionReloader({
        manifest: path.resolve(__dirname, "src/manifest.json")
      }));
      break;
    case 'production':
      // add clean plugin to ensure a clean dist build
      config.plugins.push(new CleanWebpackPlugin());
      break;
    default:
      throw new Error("Unexpected mode: " + argv.mode);
  }

  // return the actual configuration
  return config;
};
