module.exports = {
  compact: true,
  controlFlowFlattening: false, // 避免影响广告SDK功能
  deadCodeInjection: false,     // 排除文件不需要死代码注入
  debugProtection: false,       // 调试保护可能影响广告SDK
  identifierNamesGenerator: 'mangled',
  log: true,
  renameGlobals: true, // 新增：混淆全局变量
  renameProperties: true, // 新增：混淆属性名
  reservedNames: [], // 确保不保留任何名称
  rotateStringArray: true,
  selfDefending: true,
  stringArray: true,
  stringArrayThreshold: 0.5, // 降低阈值增加混淆
  target: 'browser', // 明确目标环境
  transformObjectKeys: true, // 新增：混淆对象键名
  unicodeEscapeSequence: true, // 使用unicode转义
  exclude: [
    '**/AdConfig.ts',
    '**/AdSdk.ts', 
    '**/creator.ts',
    '**/Types.ts',
    '**/*.d.ts',       // 排除所有类型声明文件
    '**/tsconfig.json' // 排除配置
  ]
}