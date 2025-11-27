const postcssImport = require('postcss-import');
const postcssUrl = require('postcss-url');
const fs = require('fs');
const path = require('path');

module.exports = (ctx) => {
  // Определяем, нужно ли встраивать шрифты как base64 (для UMD версии)
  const shouldEmbedFonts =
    ctx?.EMBED_FONTS === 'true' ||
    ctx?.env?.EMBED_FONTS === 'true' ||
    process.env.EMBED_FONTS === 'true';

  if (shouldEmbedFonts) {
    console.log('✓ PostCSS: Font embedding enabled for UMD build');
  }

  return {
    plugins: [
      postcssImport(), // Обработка @import должна быть первой
      require('autoprefixer'),
      postcssUrl({
        filter: (asset) => {
          // Для UMD версии встраиваем шрифты
          if (shouldEmbedFonts && /\.(ttf|woff|woff2|eot)$/.test(asset.url)) {
            return true;
          }
          // Для остальных файлов (изображения и т.д.)
          return /\.(png|jpg|jpeg|gif|svg)$/.test(asset.url);
        },
        url: (asset, dir) => {
          // Для UMD версии встраиваем шрифты как base64
          if (shouldEmbedFonts && /\.(ttf|woff|woff2|eot)$/.test(asset.url)) {
            try {
              // Получаем абсолютный путь к файлу шрифта
              let fontPath = null;

              // Способ 1: Используем absolutePath если доступен
              if (asset.absolutePath && fs.existsSync(asset.absolutePath)) {
                fontPath = asset.absolutePath;
              }

              // Способ 2: Разрешаем относительно директории текущего файла
              if (!fontPath && dir) {
                const resolvedPath = path.resolve(dir, asset.url);
                if (fs.existsSync(resolvedPath)) {
                  fontPath = resolvedPath;
                }
              }

              // Способ 3: Ищем относительно src директории
              if (!fontPath) {
                // Убираем ../ из начала пути
                const cleanPath = asset.url.replace(/^\.\.\//, '');
                const srcPath = path.resolve(__dirname, 'src', cleanPath);
                if (fs.existsSync(srcPath)) {
                  fontPath = srcPath;
                }
              }

              // Способ 4: Пробуем найти в src/font
              if (!fontPath && asset.url.includes('font/')) {
                const fontFileName = path.basename(asset.url);
                const fontDir = asset.url.includes('static/')
                  ? path.resolve(__dirname, 'src/font/static')
                  : path.resolve(__dirname, 'src/font');
                const fontFile = path.join(fontDir, fontFileName);
                if (fs.existsSync(fontFile)) {
                  fontPath = fontFile;
                }
              }

              // Способ 5: Пробуем разрешить путь относительно исходного файла
              if (!fontPath && dir && asset.url) {
                // Обрабатываем пути вида ../font/static/Onest-Medium.ttf
                const normalizedPath = asset.url.replace(/^\.\.\//, '');
                const possiblePaths = [
                  path.resolve(dir, asset.url),
                  path.resolve(__dirname, 'src', normalizedPath),
                  path.resolve(__dirname, normalizedPath),
                ];

                for (const possiblePath of possiblePaths) {
                  if (fs.existsSync(possiblePath)) {
                    fontPath = possiblePath;
                    break;
                  }
                }
              }

              if (fontPath && fs.existsSync(fontPath)) {
                const fontBuffer = fs.readFileSync(fontPath);
                const base64 = fontBuffer.toString('base64');
                const ext = path.extname(fontPath).toLowerCase();
                // Исправляем MIME тип для TTF файлов
                const mimeType = ext === '.ttf' ? 'font/ttf' :
                  ext === '.woff' ? 'font/woff' :
                    ext === '.woff2' ? 'font/woff2' :
                      ext === '.eot' ? 'application/vnd.ms-fontobject' :
                        'application/octet-stream';
                console.log(`✓ Embedded font: ${path.basename(fontPath)} (${(fontBuffer.length / 1024).toFixed(2)} KB)`);
                return `data:${mimeType};base64,${base64}`;
              } else {
                console.warn(`⚠ Font file not found: ${asset.url}`);
                if (dir) {
                  console.warn(`  Tried path: ${path.resolve(dir, asset.url)}`);
                }
                // Если не нашли, возвращаем исходный путь (fallback)
                return asset.url;
              }
            } catch (error) {
              console.warn(`Failed to embed font ${asset.url}:`, error.message);
              return asset.url;
            }
          }

          // Для остальных случаев обновляем пути (для CJS/ESM версий)
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
};

