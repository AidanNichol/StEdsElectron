const presets = [
  [
    '@babel/env',
    {
      targets: {
        chrome: 69,
        node: '10.11',
      },
    },
  ],
  '@babel/preset-typescript',
  '@babel/react',
];

const plugins = [
  '@babel/plugin-transform-spread',
  ['@babel/plugin-proposal-class-properties', { loose: true }],
  '@babel/plugin-transform-flow-strip-types',
  'babel-plugin-styled-components',
  'lodash',
];
module.exports = { presets, plugins };
