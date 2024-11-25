const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const fs = require("fs");
const json5 = require("json5");
const {DefinePlugin} = require("webpack");

//Import TSConfig File
const tsconfigFileName = path.join(process.cwd(), "tsconfig.json");
const tsconfig = fs.existsSync(tsconfigFileName)? fs.readFileSync(tsconfigFileName).toString(): "";

//Import Package File
const package  = fs.readFileSync(path.join(process.cwd(), "package.json")).toString();
const {version} = json5.parse(package);

//Export path Front End File.
module.exports.BundlePath = path.resolve(__dirname, "..", "lib", "View", "Web.js");

/** Get Typescript Aliases
 * 
 * @returns {Object}
 */
function getAliases(){
    const alias = {};

    try {
        const {paths} = json5.parse(tsconfig).compilerOptions;
    
        for(let item in paths) {
            const key = item.replace("/*", "");
            const name = paths[item][0].replace("/*", "");
        
            alias[key] = path.resolve(process.cwd(), name);
        }
    } catch (e){
        //Do nothing!
    }
    
    return alias;
}

/** ZimEngine Webpack
 * 
 * @param {{
 *      inProduction:boolean,
 *      typescript:boolean,
 *      sourceFile:string,
 *      buildTarget:string,
 *      alias:Object, 
 *      definitions:Object,
 *      terserOptions:Object
 *  }} args 
 * @returns {Object}
 */
module.exports = (args) => {
    const {
        typescript = args.sourceFile? args.sourceFile.includes(".ts"): false,
        inProduction = false,
        buildTarget = path.resolve(process.cwd(), "build"),
        sourceFile = path.resolve(process.cwd(), "src", `worker.${typescript? "ts": "js"}`),
        alias = getAliases(),
        definitions = {},
        terserOptions = {}
    } = args;

    if(terserOptions.mangle === undefined){
        terserOptions.mangle = {}
    }
    if(terserOptions.mangle.reserved === undefined){
        terserOptions.mangle.reserved = ["env", "event"];
    } else {
        terserOptions.mangle.reserved.push("env", "event");
    }

    return {
        mode: inProduction? "production": "development",
        target: "es2020",
        entry: sourceFile,
        devtool: inProduction? undefined: 'source-map',
        module: {
            rules: [
                {
                    test: typescript? /\.ts$/: /\.js$/,
                    exclude: /node_modules/,
                    use: typescript? 'ts-loader': undefined
                },
                {
                    test: /.html$/i,
                    type:'asset/source',
                    exclude: /node_modules/,
                },
                {
                    test: /.md$/i,
                    type:'asset/source',
                    exclude: /node_modules/,
                },
                {
                    test: /\.s?css$/,
                    type:'asset/source',
                    exclude: /node_modules/,
                    use: 'sass-loader'
                },
            ]
        },
        experiments: {
            outputModule: true
        },
        resolve: {
            extensions: ['.ts', '.js', ".md", ".scss"],
            alias: alias
        },
        output: {
            filename: '_worker.js',
            path: buildTarget,
            library: {
                type: 'module'
            }
        },
        plugins: [
            new DefinePlugin({
                ...definitions,
                VERSION: JSON.stringify(version)
            })
        ],
        optimization: {
            minimize: inProduction,
            minimizer: [
                new TerserPlugin({terserOptions})
            ],
            usedExports: true
        },
        externals: {
            'node:assert': 'node:assert',
            'node:async_hooks': 'node:async_hooks',
            'node:buffer': 'node:buffer',
            'node:crypto': 'node:crypto',
            'node:diagnostics_channel': 'node:diagnostics_channel',
            'node:events': 'node:events',
            'node:path': 'node:path',
            'node:process': 'node:process',
            'node:stream': 'node:stream',
            'node:string_decoder': 'node:string_decoder',
            'node:test': 'node:test',
            'node:util': 'node:util'
        },
        ignoreWarnings: [
            {
                module: /\/Node/
            }
        ]
    };
};