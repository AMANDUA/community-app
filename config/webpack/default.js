const CopyWebpackPlugin = require('copy-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
// Import Happypack plugin
const HappyPack = require('happypack');

const path = require('path');

let publicPath = process.env.CDN_URL || '/api/cdn/public';
publicPath += '/static-assets';

module.exports = {
  entry: {
    'loading-indicator-animation': './src/client/loading-indicator-animation',
  },
  externals: {
    /* NodeJS library for https://logentries.com. It is server-side only. Exclude it as null. */
    le_node: 'null',
  },
  node: {
    tls: 'empty',
    net: 'empty',
  },
  module: {
    noParse: [

      /[\\/]node_modules[\\/]xml2json/,

      /* We might import some server-side services from isomorphic code, to use
       * them at the server-side only; but these should be always ignored by
       * the Webpack. */
      /server[\\/]services[\\/]contentful/,

      /* This module is a part of requireWeak(..) implementation, it must be
       * ignored by Webpack, so that the modules required with this function
       * are not bundled. */
      /utils[\\/]router[\\/]require/,
    ],
    /* Changed the rule to support for .png .svg and .jpg and jpeg files and
     * using happypack loader for parallelism
     */
    rules: [
      {
        test: /.svg$/,
        exclude: /node_modules/,
        use: ['happypack/loader'],
      },
    ],
  },
  // Marking optimization as false to cut time in terser plugin minification step
  optimization: {
    minimize: false,
  },
  plugins: [
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, '../../src/assets/mock-data'),
      to: path.resolve(__dirname, '../../build/mock-data'),
    }, {
      from: path.resolve(__dirname, '../../src/assets/themes'),
      to: path.resolve(__dirname, '../../build/themes'),
    }, {
      from: path.resolve(__dirname, '../../src/server/noopsw.js'),
      to: path.resolve(__dirname, '../../build/noopsw.js'),
    }]),
    new WebpackPwaManifest({
      name: 'TC Challenges',
      short_name: 'Challenges',
      start_url: '/challenges',
      background_color: '#ffffff',
      theme_color: '#ffffff',
      scope: '/',
      icons: [
        {
          src: path.resolve('src/assets/images/logo-192.png'),
          size: 192,
        },
        {
          src: path.resolve('src/assets/images/logo-512.png'),
          size: 512,
        },
      ],
      fingerprints: false,
    }),
    new WorkboxPlugin.InjectManifest({
      swSrc: path.resolve('src/server/sw.js'),
      swDest: path.resolve(__dirname, '../../build/sw.js'),
      importWorkboxFrom: 'local',
    }),
    // Adding happypack plugin
    new HappyPack({
      // Adding the file-loader alongwith its options to instansiate with happypack
      loaders: [
        {
          loader: 'file-loader',
          options: {
            outputPath: '/images/',
            publicPath: `${publicPath}/images`,
          },
        },
      ],
    }),
  ],
};
