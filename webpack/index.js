const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

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
            path.join(props.source_directory, 'index.ts'),
        ],
        devtool: props.inProduction? undefined: 'source-map',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/
                },
                {
                    test: /.html$/i,
                    type:'asset/source',
                    exclude: /node_modules/,
                },
                {
                    test: /\.scss$/,
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
        },
        output: {
            filename: '_worker.js',
            path: props.build_directory,
            library: {
                type: 'module'
            }
        },
        optimization: {
            minimize: props.inProduction,
            minimizer: [
                new TerserPlugin()
            ],
            usedExports: true
        },
        ignoreWarnings: [
            {
                module: /Util.js$/
            },
        ],
    };
};