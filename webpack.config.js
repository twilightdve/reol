const path = require("path");
const ImageminWebpWebpackPlugin = require("imagemin-webp-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production",
  entry: {
    index: [path.resolve(__dirname, "src/index.js")],
  },
  output: {
    path: `${__dirname}`,
  },
  module: {
    rules: [
      {
        test: /\.(jpe?g|png)$/i,
        loader: "file-loader",
        options: {
          name: "[name].[ext]?[hash]",
          outputPath: "src/images/",
        },
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/images/",
          to: "src/images/",
        },
      ],
    }),
    new ImageminWebpWebpackPlugin({
      config: [
        {
          test: /\.(JPE?G|jpe?g|png|PNG|HEIC|heic)/,
          options: {
            quality: 80,
          },
        },
      ],
      detailedLogs: true,
      overrideExtension: true,
    }),
  ],
};
