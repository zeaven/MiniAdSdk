const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const JavaScriptObfuscator = require('webpack-obfuscator');

module.exports = {
  entry: './temp/vscode-dist/AdSdk.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'AdSdk.core.js',
    libraryTarget: 'umd',
    library: 'AdSdk',  // 添加library名称
    globalObject: 'this',  // 确保在不同环境都能正确加载
    umdNamedDefine: true // 添加命名定义
  },
  mode: 'production',
  optimization: {
    minimize: false,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            dead_code: true
          },
          mangle: {
            reserved: ['AdSdk'], // 保留AdSdk对象名
            properties: {
              regex: /^[^_].*/,
              reserved: [ // 保留AdSdk的所有方法名
                'AdSdk',
                'instance',
                'on',
                'setWhitePackage',
                'showBox',
                'showBanner',
                'hideBanner',
                'showInsert',
                'showReward',
                'showNative',
                'showCustom',
                'hideCustom',
                'showToast',
                'short',
              ]
            }
          },
          output: {
            comments: false
          }
        }
      })
    ]
  },
  plugins: [
    new JavaScriptObfuscator({
      unicodeEscapeSequence: true,
      rotateStringArray: true,
      stringArray: true,
      stringArrayThreshold: 0.75,
      stringArrayEncoding: ['base64'], 
      identifierNamesGenerator: 'hexadecimal',
      transformObjectKeys: true,
      unicodeEscapeSequence: true,
      controlFlowFlattening: true,
      deadCodeInjection: true,
      selfDefending: false,
      reservedNames: [ // 保留AdSdk及其所有方法名
        '^AdSdk$',
        '^AdSdk\\..*',
        'AdSdk',
        'instance',
        'on',
        'setWhitePackage',
        'showBox',
        'showBanner',
        'hideBanner',
        'showInsert',
        'showReward',
        'showNative',
        'showCustom',
        'hideCustom',
        'showToast',
        'short',
      ],
      exclude: [
        '**/AdConfig.js',
        '**/AdSdk.js',
        '**/Types.js'
      ]
    })
  ]
};