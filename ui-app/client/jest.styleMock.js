// Stub for stylesheet imports. Webpack handles .css via css-loader/style-loader,
// but jest would otherwise try to parse CSS as JavaScript, which fails for any
// suite whose import chain reaches a package that ships its own stylesheet
// (e.g. @fincity/kirun-ui/dist/index.css).
module.exports = {};
