const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");

const build_directory = path.resolve(__dirname, "lib", "View");
const source_directory = path.resolve(__dirname, "src", "View");
const inProduction = process.argv.includes('prod');

module.exports =  {
    mode: inProduction? "production": "development",
    entry: path.join(source_directory, "Web.ts"),
    devtool: inProduction? undefined: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: 'Web.js',
        path: build_directory,
    },
    optimization: {
        minimize: inProduction,
        minimizer: [
            new TerserPlugin()
        ]
    }
    
};