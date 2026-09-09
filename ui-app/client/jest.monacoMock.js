// monaco-editor's "main" field points at min/vs/index.js, an AMD bundle that
// needs a `define` global, so requiring it under jest's CJS runtime throws
// "define is not defined". Webpack avoids this via mainFields: ['source',
// 'module', 'main'], which picks monaco's ESM build instead.
//
// Monaco cannot run under jsdom anyway, and it is only reached transitively
// (src/functions -> @fincity/kirun-ui -> monaco-editor), so it is stubbed here.
// Any suite that needs real monaco behaviour would have to run in a browser.
module.exports = {};
