import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';

const packageJson = require('./package.json');

const isProduction = process.env.NODE_ENV === 'production';

// Базовая конфигурация для CJS и ESM
const baseConfig = {
  input: 'src/index.ts',
  external: ['react', 'react-dom', 'antd', 'react/jsx-runtime'],
  plugins: [
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
    isProduction && terser(),
  ].filter(Boolean),
};

// Конфигурация для UMD с классическим JSX transform
const umdConfig = {
  input: 'src/index.ts',
  external: ['react', 'react-dom', 'antd', 'dayjs'],
  plugins: [
    peerDepsExternal(),
    resolve({
      browser: true,
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      jsx: 'react',
      declaration: false,
      declarationMap: false,
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      extensions: ['.ts', '.tsx'],
      presets: [
        ['@babel/preset-env', {
          targets: {
            browsers: ['> 1%', 'last 2 versions'],
          },
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
    }),
    isProduction && terser(),
  ].filter(Boolean),
  output: {
    file: 'dist/index.umd.js',
    format: 'umd',
    name: 'GetWellWidget',
    sourcemap: true,
    globals: {
      'react': 'React',
      'react-dom': 'ReactDOM',
      'antd': 'antd',
      'dayjs': 'dayjs',
    },
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

