/**
 * Entry point for the scene editor chunk.
 *
 * The `Lazy` in the filename is load-bearing: webpack.prod.js has an `editors`
 * cache group matching `PageEditor/.*Lazy` with `chunks: 'async'`, so this name
 * is what keeps the editor and everything it drags in (three, the runtime, the
 * thumbnail renderer) out of the page editor's own bundle. Rename it and the
 * whole editor silently moves into the initial download.
 */
export { SceneEditorModal as default } from './SceneEditorModal';
