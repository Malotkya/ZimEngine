const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const fs = require("fs");
const json5 = require("json5");
const {DefinePlugin} = require("webpack");

const tsconfig = fs.readFileSync(path.join(process.cwd(), "tsconfig.json")).toString();
const package  = fs.readFileSync(path.join(process.cwd(), "package.json")).toString();

const {version} = json5.parse(package);

function getAliases(){
    const {paths} = json5.parse(tsconfig).compilerOptions;
    const alias = {};

    for(let item in paths) {
        const key = item.replace("/*", "");
        const name = paths[item][0].replace("/*", "");
       
        alias[key] = path.resolve(process.cwd(), name);
    }

    return alias;
}

/** ZimEngine Webpack
 * 
 * @param {{inProduction:boolean, source_directory:string, build_directory:string}} props 
 * @returns {Object}
 */
module.exports = (props) => {
    return {
        mode: props.inProduction? "production": "development",
        target: "es2020",
        entry: [
            path.join(props.source_directory, 'worker.ts'),
        ],
        devtool: props.inProduction? undefined: 'source-map',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: [
                        /node_modules/,
                        /Engine\/Web/,
                        /Engine\/View\/RenderEnvironment/
                    ]
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
            extensions: ['.ts', '.js', ".html", ".scss"],
            alias: getAliases()
        },
        output: {
            filename: '_worker.js',
            path: props.build_directory,
            library: {
                type: 'module'
            }
        },
        plugins: [
            new DefinePlugin({
                VERSION: JSON.stringify(version)
            })
        ],
        optimization: {
            minimize: props.inProduction,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        mangle: {
                            reserved: ["env", "event"]
                        }
                    }
                })
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
        }
    };
};