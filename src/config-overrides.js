var webpack = require('webpack');
var path = require('path');

module.exports = function override(config, env) {
    config.resolve.fallback = {
        "stream": require.resolve("stream-browserify"),
        "path": require.resolve("path-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "buffer": require.resolve("buffer/")
    };
    config.resolve.aliasFields = ["browser"];
    config.module.rules.push({
        test: /\.m?js$/,
        resolve: {
            fullySpecified: false,
        }
    });
    config.plugins.push(new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
    }));
    return config;
};

