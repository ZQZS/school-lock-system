const path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin.js");
let config = {
  entry: "./src/main.js",
  output: {
    path: path.resolve(__dirname, "dist/dev"),
    filename: "[name].js",
  },
  mode: "development",
  resolve: {
    alias: {
      vue$: "vue/dist/vue.esm.js", // 用 webpack 1 时需用 'vue/dist/vue.common.js'
      Components: path.resolve(__dirname, "src/Components"),
      stores: path.resolve(__dirname, "src/stores"),
    },
  },

  devServer: {
    hot: true,
    static: {
      directory: path.join(__dirname, "dist/dev"),
    },
    // host: "0.0.0.0",
    // port: 8888,
    // open: true,
    // compress: true,
    proxy: {
      "/api": "http://localhost:6000",
      // "/api/users/login": "http://localhost:3000",
      // "/api/users/getUserHours": "http://localhost:3000",
      // "/api/users/getUserOrderList": "http://localhost:3000",
      // "/api/order/selectTimeFindPlace": "http://localhost:3000",
      // "/api/order/getPlaceList": "http://localhost:3000",
      // "/api/order/order": "http://localhost:3000",
      // "/api/order/selectPlaceFindTime": "http://localhost:3000",
      // "/api/order/getBookTimeOptions": "http://localhost:3000",
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: "vue-loader",
      },
      {
        //转换es5语法，但与pinia相冲突
        test: /\.js$/,
        use: {
          loader: "babel-loader",

          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.s?css$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/,
        type: "asset/resource",
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto",
      },
    ],
  },
  plugins: [new VueLoaderPlugin()],
};

module.exports = (env, argv) => {
  if (argv.mode === "development") {
    config.output = {
      path: path.resolve(__dirname, "dist/dev"),
      filename: "[name].js",
    };
  }

  if (argv.mode === "production") {
    config.output = {
      path: path.resolve(__dirname, "dist/build"),
      filename: "[name].js",
    };
    config.mode = "production";
  }
  return config;
};
