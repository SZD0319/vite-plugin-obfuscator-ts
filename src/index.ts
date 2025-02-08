import JavascriptObfuscator from "javascript-obfuscator";
import chalk from "chalk";
import ora from "ora";
import { readFile, writeFile } from "node:fs/promises";
import { statSync, readdirSync } from "node:fs";
import { resolve, join, normalize } from "node:path";
import { minimatch } from "minimatch";
import type { ObfuscatorOptions } from "javascript-obfuscator";
import type { Plugin } from "vite";

export interface ObfuscatorPluginOptions {
    /**
     * @description the directory where the files that need to be obfuscated are located, and all `js` files in that directory are obfuscated by default
     * @default dist/assets
     */
    rootDir?: string;
    /**
     * @description exclude files that meet the criteria and do not obfuscate them, it is an array, and its members can be string, regular expression and glob string
     * @default []
     */
    exclude?: Array<RegExp | string>;
    /**
     * @description the options of `javascript-obfuscator`
     */
    obfuscatorOptions?: ObfuscatorOptions;
}

const defaultRootDir = "dist/assets";
const defaultExclude: Array<RegExp | string> = [];
const defaultObfuscatorOptions: ObfuscatorOptions = {
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

export default function obfuscatorPlugin(
    options: ObfuscatorPluginOptions = {
        rootDir: defaultRootDir,
        exclude: defaultExclude,
        obfuscatorOptions: defaultObfuscatorOptions
    }
): Plugin {
    const { rootDir: _rootDir, obfuscatorOptions: _obfuscatorOptions, exclude: _exclude } = options;
    const rootDir = normalize(_rootDir || defaultRootDir);
    const obfuscatorOptions = _obfuscatorOptions || defaultObfuscatorOptions;
    const exclude = _exclude || defaultExclude;

    return {
        name: "obfuscator",
        apply: "build",
        closeBundle: () => {
            const files: Array<string> = [];
            getFiles(rootDir);
            const startTime = Date.now();
            console.log("\n");
            paralleTask(
                files.map((file) => buildTask(file)),
                3
            ).then(() => {
                const endTime = Date.now();
                const time = ((endTime - startTime) / 1000).toFixed(2);
                console.log("\n", chalk.green(`obfuscated in ${time}s`));
            });

            function paralleTask(
                tasks: Array<(...args: any[]) => Promise<any>>,
                paralleCount: number
            ): Promise<void> {
                return new Promise((resolve) => {
                    if (tasks.length === 0) {
                        resolve();
                        return;
                    }

                    let nextIndex = 0;
                    let finishCount = 0;
                    function _run() {
                        const task = tasks[nextIndex];
                        nextIndex++;
                        task().then(() => {
                            finishCount++;
                            if (nextIndex < tasks.length) {
                                _run();
                            }
                            if (finishCount === tasks.length) {
                                resolve();
                            }
                        });
                    }

                    if (paralleCount <= tasks.length) {
                        for (let i = 0; i < paralleCount; i++) {
                            _run();
                        }
                    } else {
                        for (let i = 0; i < tasks.length; i++) {
                            _run();
                        }
                    }
                });
            }

            function buildTask(path: string) {
                return () => obscureFile(path);
            }

            async function obscureFile(path: string) {
                const filePath = resolve(process.cwd(), path);
                const spinner = ora();
                spinner.start();
                const _path = path.split(rootDir)[1];
                try {
                    const content = await readFile(filePath, "utf-8");
                    const obfuscationResult = JavascriptObfuscator.obfuscate(
                        content,
                        obfuscatorOptions
                    );
                    try {
                        await writeFile(filePath, obfuscationResult.getObfuscatedCode(), {
                            encoding: "utf8"
                        });
                        spinner.succeed(
                            `${chalk.blueBright("obfuscated")} ${chalk.gray(rootDir)}${chalk.yellow(_path)}`
                        );
                    } catch {
                        spinner.fail(
                            `${chalk.blueBright("obfuscated")} ${chalk.gray(rootDir)}${chalk.red(_path)}`
                        );
                    }
                } catch {
                    spinner.fail(
                        `${chalk.blueBright("read file")} ${chalk.gray(rootDir)}${chalk.red(_path)}`
                    );
                }
            }

            function getFiles(path: string) {
                const filestat = statSync(resolve(process.cwd(), path));
                if (filestat.isFile()) {
                    if (path.endsWith(".js")) {
                        const isExcluded = exclude.some((pattern) => {
                            if (typeof pattern === "string") {
                                if (path.includes(pattern)) return true;
                                return minimatch(path, pattern);
                            }
                            return pattern.test(path);
                        });
                        if (!isExcluded) {
                            files.push(path);
                        }
                    }

                    return;
                }
                const pathList = readdirSync(path);
                pathList.forEach((item) => {
                    getFiles(normalize(join(path, item)));
                });
            }
        }
    };
}
