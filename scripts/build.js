const esbuild = require('esbuild');
const glob = require('glob');

esbuild
    .build({
        entryPoints: glob.sync('src/*.ts'),
        bundle: true,
        sourcemap: false,
        minify: false,
        outdir: 'assets/',
        format: 'esm',
    })
    .then(() => console.log("⚡ Javascript build complete! ⚡"))
    .catch(() => process.exit(1))
