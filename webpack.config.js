'use strict'

var webpack = require('webpack');

if (typeof process.env.NODE_ENV == "undefined") process.env.NODE_ENV = "development";

var config = {
  cache: true,
  resolve: {
    modulesDirectories: ['node_modules', './src'],
    extensions: ['', '.js', '.jsx']
  },
  
  entry: {
    isia_calendar: ['./src/custom/isia/calendar.js'],
    isia_order: ['./src/custom/isia/order.js'],
    registration_form_widget: ['./src/registration-form-widget.js'],
    event_order_form: ['./src/event-order-form.js'],
    event_schedule: ['./src/event-schedule.js']
  },
  output: {
    path: __dirname + '/../doc/assets',
    filename: "[name].js",
  },


  devtool: process.env.NODE_ENV == "development" ? "cheap-inline-module-source-map" : null,
  
  plugins: [
    new webpack.DefinePlugin({
      'process.env': Object.keys(process.env).reduce(function(o, k) {
        o[k] = JSON.stringify(process.env[k]);
        return o;
      }, {})
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery'
    }),
    // new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.[hash:6].js'),
    // new webpack.optimize.UglifyJsPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.OccurenceOrderPlugin()
  ],
  
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        include: __dirname,
        query: {
            presets: ['react', 'es2015', 'stage-0'],
            plugins: ['react-html-attrs', 'transform-decorators-legacy', 'transform-class-properties'],
        }
      },
      { test: /\.scss$/,                       loaders: ["style", "css", "sass"] },
      { test: /\.less$/,                       loaders: ["style", "css", "less"] },
      { test: /\.css$/,                        loaders: ["style", "css"] },
      { test: /effi-protocol\.js/,             loader: 'imports?jQuery=jquery' },
      { test: /bootstrap\/js\//,               loader: 'imports?jQuery=jquery' },
      { test: /\.(woff|woff2)$/,               loader: "url-loader?limit=20000&mimetype=application/font-woff" },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,    loader: "url?limit=10000&minetype=application/octet-stream" },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,    loader: "file" },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,    loader: "url?limit=10000&minetype=image/svg+xml" },
      { test: /vendor\/.+\.(jsx?)$/,           loader: 'imports?jQuery=jquery,$=jquery,this=>window'},
      { test: /\.(gif|png)$/,                  loader: "url?limit=10000"},
      { test: /\.(jpe?g)$/,                    loader: "file"},
      { test: /\.html$/,                       loader: "html"}
    ]
  }
};


if (process.env.NODE_ENV == "production") {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_console: true,
        // unsafe: true // js-cookie fails to work in unsafe mode
      }
    })
  );
}

module.exports = config;
