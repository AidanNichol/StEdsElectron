const presets = [
  [
    '@babel/env',
    {
      targets: {
        chrome: 66,
        node: '9.2',
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
  [
    'module-resolver',
    {
      root: ['./src'],
      alias: {
        views: 'components/views',
      },
    },
  ],
];
module.exports = { presets, plugins };
