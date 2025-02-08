import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
    entries: ["src/index.ts"],
    clean: true,
    declaration: true,
    failOnWarn: false,
    rollup: {
        emitCJS: true
    }
});
