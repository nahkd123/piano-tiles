const path = require("path")

/**
 * @type {import("webpack").Configuration}
 */
const config = {
    entry: "./src/index.ts",
    module: {
        rules: [
            { test: /\.ts$/, use: "ts-loader", exclude: /node_modules/ },
            { test: /\.css$/, use: ["style-loader", "css-loader"] },
        ]
    },
    resolve: {
        extensions: ['.ts', '.js', '.css']
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "html")
    }
}
module.exports = config;