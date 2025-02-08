## Description

`vite-plugin-obfuscator-ts` is a Vite plugin that obfuscates your JavaScript code using `javascript-obfuscator`. This plugin is written in TypeScript and provides type definitions for better development experience.

## Installation

You can install the plugin using npm or yarn:

```shell
npm i vite-plugin-obfuscator-ts -D
```

or

```shell
yarn add vite-plugin-obfuscator-ts --dev
```

## Usage

To use the plugin, add it to your `vite.config.ts` file:

```ts
import { defineConfig } from "vite";
import obfuscator from "vite-plugin-obfuscator-ts";

export default defineConfig({
    plugins: [
        obfuscator({
            rootDir: "dist/assets",
            exclude: [/node_modules/],
            obfuscatorOptions: {
                // ...
            }
        })
    ]
    // ...
});
```

## Options

- `rootDir`: the directory where the files that need to be obfuscated are located, and all `js` files in that directory are obfuscated by default
- `exclude`: exclude files that meet the criteria and do not obfuscate them, it is an array, and its members can be string, regular expression and glob string
- `obfuscatorOptions`: the options of `javascript-obfuscator`, The default values are as follows:

```ts
const defaultObfuscatorOptions = {
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    debugProtection: true,
    debugProtectionInterval: 1000,
    disableConsoleOutput: true,
    identifierNamesGenerator: "hexadecimal",
    log: false,
    numbersToExpressions: false,
    renameGlobals: false,
    selfDefending: true,
    simplify: true,
    splitStrings: false,
    stringArray: true,
    stringArrayCallsTransform: false,
    stringArrayEncoding: [],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 1,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 2,
    stringArrayWrappersType: "variable",
    stringArrayThreshold: 0.75,
    unicodeEscapeSequence: false
};
```
