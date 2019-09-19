import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";
import gzipPlugin from 'rollup-plugin-gzip'
import buble from 'rollup-plugin-buble';

export default [
  // browser-friendly UMD build
  {
    input: "src/router.js",
    output: {
      name: "router",
      file: pkg.browser,
      format: "umd"
    },
    plugins: [
      resolve(), // so Rollup can find `ms`
      commonjs(), // so Rollup can convert `ms` to an ES module
      buble({
        transforms: { forOf: false },
        objectAssign: 'Object.assign'
    }),
      terser(), // uglify
      gzipPlugin()
    ]
  },
  {
    input: "src/router.js",
    external: [],
    plugins: [
        buble()
    ],
    output: [
      { file: pkg.main, format: "cjs" },
      { file: pkg.module, format: "es" }
    ]
  }
];