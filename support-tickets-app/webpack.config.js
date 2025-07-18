// const ModuleFederationPlugin = require('@module-federation/webpack')
// const HtmlWebpackPlugin = require('html-webpack-plugin')
// const path = require('path')

// module.exports = {
//   mode: 'development',
  
//   entry: './src/index.js',
  
//   devServer: {
//     port: 3003,
//     host: 'localhost',
//     hot: true,
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
//       'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
//     }
//   },
  
//   resolve: {
//     extensions: ['.js', '.jsx'],
//     alias: {
//       '@': path.resolve(__dirname, 'src')
//     }
//   },
  
//   module: {
//     rules: [
//       {
//         test: /\.(js|jsx)$/,
//         exclude: /node_modules/,
//         use: {
//           loader: 'babel-loader',
//           options: {
//             presets: ['@babel/preset-react'],
//             plugins: ['@babel/plugin-transform-runtime']
//           }
//         }
//       },
//       {
//         test: /\.css$/,
//         use: ['style-loader', 'css-loader', 'postcss-loader']
//       }
//     ]
//   },
  
//   plugins: [
//     new ModuleFederationPlugin({
//       name: 'supportTickets',
//       filename: 'remoteEntry.js',
//       exposes: {
//         './App': './src/App',
//         './TicketList': './src/components/TicketList',
//         './TicketForm': './src/components/TicketForm'
//       },
//       shared: {
//         react: {
//           singleton: true,
//           requiredVersion: '^18.2.0'
//         },
//         'react-dom': {
//           singleton: true,
//           requiredVersion: '^18.2.0'
//         }
//       }
//     }),
    
//     new HtmlWebpackPlugin({
//       template: './public/index.html',
//       filename: 'index.html'
//     })
//   ]
// }