const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const SitemapPlugin = require('sitemap-webpack-plugin').default;
const dotenv = require('dotenv')

const paths = ['/'];

module.exports = (env, argv) => {
    const isDevelopment = argv.mode === 'development';

    const config = {
        entry: {
            index: "./src/index.jsx"
        },
        mode: isDevelopment ? 'development' : 'production',
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/i,
                    exclude: /(node_modules|bower_components)/,
                    use: [
                        {
                            loader: require.resolve('babel-loader'),
                            options: {
                                presets: ["@babel/env"],
                                plugins: [isDevelopment && require.resolve('react-refresh/babel')].filter(Boolean)
                            }
                        }]
                },
                {
                    test: /\.css$/i,
                    use: ["style-loader", "css-loader"]
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: ["style-loader", "css-loader", "sass-loader"]
                },
                {
                    test: /\.(pdf|svg)$/i,
                    loader: 'file-loader',
                    options: {
                        name: '[path][name].[ext]',
                    }
                },
                {
                    test: /\.(txt|html)$/i,
                    use: 'raw-loader'
                }
            ]
        },
        resolve: {extensions: ["*", ".js", ".jsx"]},
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].bundle.js',
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env': JSON.stringify(dotenv.config().parsed)
            }),
            isDevelopment && new webpack.HotModuleReplacementPlugin(),
            isDevelopment && new ReactRefreshWebpackPlugin(),
            !isDevelopment && new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                template: "./src/template.html",
                favicon: "./src/images/thinking.svg"
            }),
            new SitemapPlugin('https://graysonliu.github.io', paths,
                {skipgzip: true})
        ].filter(Boolean)
    };

    if (isDevelopment) {
        config.devServer = {
            contentBase: path.join(__dirname, ""),
            port: 3000,
            hotOnly: true
        }
    }

    return config;
};
