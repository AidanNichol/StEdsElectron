module.exports = {
  plugins: [
    require('postcss-import')({}),
    require('postcss-inline-comment')({}),
    require('postcss-cssnext')(),
    require('postcss-nested')({}),
  ],
  dir: "app/styles/",
  // verbose: true,
}
