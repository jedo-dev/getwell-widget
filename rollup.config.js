import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import url from '@rollup/plugin-url';
import copy from 'rollup-plugin-copy';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';

const packageJson = require('./package.json');

const isProduction = process.env.NODE_ENV === 'production';

// Плагин для удаления директив 'use client' из кода
const removeUseClient = () => ({
  name: 'remove-use-client',
  transform(code, id) {
    // Удаляем директивы 'use client' и 'use server' (с учетом разных вариантов написания)
    if (code.includes("'use client'") || code.includes('"use client"') ||
      code.includes("'use server'") || code.includes('"use server"')) {
      return {
        // Удаляем директивы с разными вариантами кавычек и с точкой с запятой или без
        code: code
          .replace(/['"]use client['"];?\s*/g, '')
          .replace(/['"]use server['"];?\s*/g, '')
          .replace(/['"]use client['"]\s*;?\s*/gm, '')
          .replace(/['"]use server['"]\s*;?\s*/gm, ''),
        map: null,
      };
    }
    return null;
  },
});

// Базовая конфигурация для CJS и ESM
const baseConfig = {
  input: 'src/index.ts',
  external: ['react', 'react-dom', 'antd', 'react/jsx-runtime'],
  onwarn(warning, warn) {
    // Подавляем предупреждения о 'use client' директивах
    if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
      return;
    }
    warn(warning);
  },
  plugins: [
    // Удаляем директивы 'use client' из node_modules (особенно из antd)
    removeUseClient(),
    peerDepsExternal(),
    resolve({
      browser: true,
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: './dist',
      rootDir: './src',
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      extensions: ['.ts', '.tsx'],
    }),
    postcss({
      extract: true,
      minimize: isProduction,
    }),
    // Обрабатываем изображения (встраиваем как base64 или копируем)
    url({
      include: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
      limit: 8192, // Если изображение меньше 8KB, встраиваем как base64, иначе копируем
      destDir: 'dist/img',
      publicPath: './img/',
    }),
    // Копируем файлы шрифтов в dist
    copy({
      targets: [
        { src: 'src/font/**/*', dest: 'dist/font' },
        { src: 'src/img/**/*', dest: 'dist/img' },
      ],
      copyOnce: false, // Копировать при каждом изменении в watch режиме
      hook: 'buildStart', // Копировать в начале сборки
    }),
    isProduction && terser(),
  ].filter(Boolean),
};

// Конфигурация для UMD с классическим JSX transform и всеми зависимостями в бандле
const umdConfig = {
  input: 'src/index.ts',
  // Не делаем зависимости external - они будут включены в бандл
  external: [],
  onwarn(warning, warn) {
    // Подавляем предупреждения о 'use client' директивах
    if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
      return;
    }
    warn(warning);
  },
  plugins: [
    // Удаляем директивы 'use client' из node_modules (особенно из antd)
    removeUseClient(),
    // Заменяем process.env на статические значения для браузера
    replace({
      'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
      'process.env': JSON.stringify({}),
      // Заменяем process на пустой объект для браузера
      'process.browser': JSON.stringify(true),
      // Добавляем полифилл для process
      'typeof process': JSON.stringify('undefined'),
      preventAssignment: true,
    }),
    // Не используем peerDepsExternal для UMD - включаем все в бандл
    resolve({
      browser: true,
      preferBuiltins: false,
      // Игнорируем встроенные модули Node.js
      exportConditions: ['browser', 'default'],
    }),
    commonjs({
      include: /node_modules/,
      transformMixedEsModules: true,
      // Заменяем process на пустой объект для браузера
      ignoreGlobal: false,
    }),
    typescript({
      tsconfig: './tsconfig.json',
      jsx: 'react',
      declaration: false,
      declarationMap: false,
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: /node_modules\/(?!(react|react-dom|antd|dayjs|@ant-design|rc-|@babel\/runtime))/,
      extensions: ['.ts', '.tsx'],
      presets: [
        ['@babel/preset-env', {
          targets: {
            browsers: ['> 1%', 'last 2 versions'],
          },
          modules: false,
        }],
        ['@babel/preset-react', {
          runtime: 'classic',
        }],
        '@babel/preset-typescript',
      ],
    }),
    postcss({
      extract: true,
      minimize: isProduction,
      // Включаем CSS из Ant Design
      inject: false,
    }),
    // Обрабатываем изображения для UMD версии
    url({
      include: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
      limit: Infinity, // Всегда встраиваем как base64 для UMD (чтобы не было проблем с путями)
    }),
    // Копируем файлы шрифтов в dist для UMD версии
    copy({
      targets: [
        { src: 'src/font/**/*', dest: 'dist/font' },
        { src: 'src/img/**/*', dest: 'dist/img' },
      ],
      copyOnce: false, // Копировать при каждом изменении в watch режиме
      hook: 'buildStart', // Копировать в начале сборки
    }),
    isProduction && terser(),
  ].filter(Boolean),
  output: {
    file: 'dist/index.umd.js',
    format: 'umd',
    name: 'GetWellWidget',
    sourcemap: true,
    // Globals не нужны, так как все включено в бандл
  },
};

export default [
  {
    ...baseConfig,
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
        exports: 'named',
      },
    ],
  },
  umdConfig,
];

