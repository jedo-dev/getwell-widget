const postcssImport = require('postcss-import');
const postcssUrl = require('postcss-url');

module.exports = {
  plugins: [
    postcssImport(), // Обработка @import должна быть первой
    require('autoprefixer'),
    postcssUrl({
      filter: /\.(ttf|woff|woff2|eot|svg|png|jpg|jpeg|gif)$/,
      url: (asset) => {
        // Обновляем пути для файлов из src/font и src/img
        if (asset.url.includes('../font/')) {
          return asset.url.replace('../font/', './font/');
        }
        if (asset.url.includes('../img/')) {
          return asset.url.replace('../img/', './img/');
        }
        return asset.url;
      },
    }),
    ...(process.env.NODE_ENV === 'production' ? [require('cssnano')] : []),
  ],
};

