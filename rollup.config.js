import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';
import gzipPlugin from 'rollup-plugin-gzip';
import typescript from 'rollup-plugin-typescript2';

const tsConfigCjs = {
    tsconfigOverride: {
        compilerOptions: { module: 'esnext', declaration: false },
    },
    clean: true,
};

const tsConfigEsm = {
    tsconfigOverride: {
        compilerOptions: { module: 'esnext' },
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
            typescript(tsConfigCjs),
            terser(), // uglify
            gzipPlugin(),
        ],
    },
    {
        input: 'src/router.ts',
        external: [],
        plugins: [typescript(tsConfigEsm)],
        output: [{ file: pkg.module, format: 'es' }],
    },
];
