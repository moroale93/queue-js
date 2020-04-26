module.exports = {
  mode: 'development',
  target: 'node',
  entry: './index.js',
  output: {
    filename: 'index.js',
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  devtool: 'cheap-module-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
};