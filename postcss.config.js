module.exports = {
  plugins: [
    require('postcss-import')({}),
    require('postcss-inline-comment')({}),
    require('postcss-preset-env')(),
    require('postcss-nested')({}),
  ],
  dir: 'app/styles/',
  // verbose: true,
};
