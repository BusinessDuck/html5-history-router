import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';
import gzipPlugin from 'rollup-plugin-gzip';
import typescript from 'rollup-plugin-typescript2';
const tsConfig = {
    tsconfigOverride: {
        compilerOptions: { declaration: false },
    },
    clean: true,
};

export default [
    // browser-friendly UMD build
    {
        input: 'src/router.ts',
        output: [
            { file: pkg.main, format: 'cjs' },
            { name: 'router', file: pkg.browser, format: 'umd' },
        ],
        plugins: [
            resolve(), // so Rollup can find `ms`
            commonjs(), // so Rollup can convert `ms` to an ES module
            typescript(tsConfig),
            terser(), // uglify
            gzipPlugin(),
        ],
    },
    {
        input: 'src/router.ts',
        external: [],
        plugins: [typescript()],
        output: [{ file: pkg.module, format: 'es' }],
    },
];
