// vue.config.js
module.exports = {
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          use: {
            loader: 'file-loader',
            options: {
              name: 'fonts/[name].[hash:8].[ext]',
              esModule: false
            }
          }
        }
      ]
    }
  },
  css: {
    loaderOptions: {
      css: {
        url: true
      }
    }
  }
}