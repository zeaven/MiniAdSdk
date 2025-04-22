module.exports = {
  compact: true,
  controlFlowFlattening: true,
  deadCodeInjection: true,
  debugProtection: true,
  identifierNamesGenerator: 'mangled-shuffled', // Changed from 'hexadecimal'
  identifiersPrefix: 'obf_', // Add prefix to avoid conflicts
  reservedStrings: ['^_'], // Changed from reservedNames
  simplify: true, // Add this to simplify the output
  log: false,
  renameGlobals: true,
  reservedNames: ['^_'],
  rotateStringArray: true,
  selfDefending: true,
  shuffleStringArray: true,
  splitStrings: true,
  stringArray: true,
  stringArrayEncoding: ['rc4'],
  stringArrayThreshold: 0.75,
  target: 'browser',
  transformObjectKeys: true,
  unicodeEscapeSequence: true,
  mangle: {
    properties: {
      regex: /^_/,
      reserved: []
    }
  },
  exclude: [
    '**/AdConfig.ts',
    '**/AdSdk.ts',
    '**/creator.ts',
    '**/Types.ts',
    '**/*.d.ts',
    '**/tsconfig.json'
  ]
}