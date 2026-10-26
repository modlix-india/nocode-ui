// Base styles for the block editor. Emitted by MarkdownEditorStyle (a CSS
// import would break the SSR bundle, which has no CSS loader). Colors come
// from the --mde-* custom properties the host sets on the editor container.

export const BLOCK_EDITOR_CSS = `
/* Scoped reset. The editor's inline styles assume a clean base (no element
   margins, unstyled buttons and lists, solid zero-width borders); host pages
   carry their own element styles, so the reset is applied here. */
.mde-editor-container *,
.mde-editor-container ::before,
.mde-editor-container ::after,
.mde-cp-pop--portal,
.mde-cp-pop--portal * {
  box-sizing: border-box;
  border-width: 0;
  border-style: solid;
  border-color: var(--mde-border-primary, #e5e5e5);
}
.mde-editor-container :is(h1, h2, h3, h4, h5, h6, p, pre, blockquote, figure, dl, dd, ol, ul, hr) {
  margin: 0;
}
.mde-editor-container :is(h1, h2, h3, h4, h5, h6) {
  font-size: inherit;
  font-weight: inherit;
}
.mde-editor-container :is(ol, ul) {
  list-style: none;
  padding: 0;
}
.mde-editor-container :is(button, input, select, textarea),
.mde-cp-pop--portal :is(button, input, select, textarea) {
  font: inherit;
  color: inherit;
  margin: 0;
}
.mde-editor-container button,
.mde-cp-pop--portal button {
  background-color: transparent;
  background-image: none;
  padding: 0;
  cursor: pointer;
}
.mde-editor-container :is(img, svg, video, canvas) {
  vertical-align: middle;
}
.mde-editor-container img {
  max-width: 100%;
}
.mde-editor-container hr {
  height: 0;
  color: inherit;
  border-top-width: 1px;
}
.mde-editor-container table {
  border-collapse: collapse;
  text-indent: 0;
}
.mde-editor-container a {
  color: inherit;
  text-decoration: inherit;
}

/* Block editor — base styles.
   Colors come from --mde-* custom properties, which the host sets on the
   editor container (see MarkdownEditorStyle.tsx). The literals after each
   var() are only fallbacks. */

.mde-editor {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: var(--mde-text-primary, #1f2328);
  caret-color: var(--mde-accent, #60a5fa);
  padding: 4px 0;
}

.mde-editor:focus {
  outline: none;
}

.mde-editor [data-block-id] {
  position: relative;
}

/* Preserve whitespace so trailing/consecutive spaces are not collapsed by the browser */

.mde-editor [data-content] {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.mde-editor a {
  color: var(--mde-accent, #60a5fa);
  text-decoration: underline;
}

.mde-editor a:hover {
  color: var(--mde-accent-hover, #93bbfc);
}

.mde-editor code {
  font-family: "SF Mono", "Fira Code", "Cascadia Code", Menlo, Consolas, monospace;
}

/* Selection styling */

.mde-editor ::selection {
  background-color: var(--mde-accent-muted, rgba(96, 165, 250, 0.35));
  color: inherit;
}

/* Focused editor selection color */

.mde-editor:focus ::selection {
  background-color: var(--mde-accent-muted, rgba(96, 165, 250, 0.4));
}

/* Block wrapper transitions */

.mde-block-wrapper {
  transition: background-color 150ms ease;
  border-radius: 4px;
}

/* Whole-block selection highlight. Painted on every block in a multi-block
   selection (drag across blocks / shift-click), including the self-managed
   list / table / tabs blocks that native text selection can't span. Uses the
   same accent-muted token as ::selection so the two read as one selection
   model. The text selection is cleared while this is active, so there's no
   double highlight. */

.mde-block-wrapper.mde-block-selected {
  background-color: var(--mde-accent-muted, rgba(96, 165, 250, 0.35));
}

/* Empty block placeholder */

.mde-placeholder {
  position: absolute;
  /* Match the text block's horizontal inset (TEXT_BLOCK_PADDING_X in
     EditorBlockTree.tsx) so the placeholder lines up with the caret, which
     sits inside the padded block wrapper rather than at the editor edge. */
  left: 6px;
  top: 4px;
  color: var(--mde-text-muted, #999);
  pointer-events: none;
  user-select: none;
  font-size: 16px;
  line-height: 1.625;
  padding: 0;
  padding-top: 5px;
}

.mde-trailing-placeholder {
  margin-top: 4px;
  min-height: 32px;
  cursor: text;
  user-select: none;
}

/* Columns layout */

.mde-columns {
  width: 100%;
  margin: 4px 0;
}

/* Each column is a flex item; min-width:0 lets long content wrap. */

.mde-column,
.mde-column-cell {
  min-width: 0;
}

/* Resizable gutter between columns. Cursor + a 1px center line. */

.mde-column-gutter {
  position: relative;
  cursor: col-resize;
}

.mde-column-gutter:hover > .mde-column-gutter-line,
.mde-column-gutter:active > .mde-column-gutter-line {
  background-color: var(--mde-accent, #2563eb) !important;
  opacity: 1 !important;
}

/* ---- Color picker (ColorPicker.tsx) ---------------------------------- */

.mde-cp {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 176px;
}

.mde-cp--compact {
  gap: 6px;
  min-width: 160px;
}

.mde-cp-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mde-cp-label {
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--mde-text-muted, #9ca3af);
}

.mde-cp-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.mde-cp-swatch-wrap {
  position: relative;
  display: inline-flex;
  line-height: 0;
}

.mde-cp-swatch {
  width: 18px;
  height: 18px;
  min-width: 18px;
  padding: 0;
  border: 1px solid var(--mde-border-primary, rgba(0, 0, 0, 0.12));
  border-radius: 50%;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--mde-text-muted, #9ca3af);
  box-sizing: border-box;
}

.mde-cp-swatch.is-selected {
  box-shadow: 0 0 0 2px var(--mde-surface-elevated, #fff), 0 0 0 3.5px var(--mde-accent, #2563eb);
}

.mde-cp-swatch--none {
  background: var(--mde-surface-elevated, #fff);
}

.mde-cp-swatch--add {
  background: transparent;
  border-style: dashed;
}

.mde-cp-swatch--add:hover {
  background: var(--mde-bg-hover, rgba(0, 0, 0, 0.06));
}

.mde-cp-swatch-x {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 13px;
  height: 13px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: var(--mde-text-muted, #6b7280);
  color: #fff;
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.mde-cp-swatch-wrap:hover .mde-cp-swatch-x {
  display: inline-flex;
}

.mde-cp-custom-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.mde-cp-native {
  width: 24px;
  height: 24px;
  min-width: 24px;
  padding: 0;
  border: 1px solid var(--mde-border-primary, #e5e5e5);
  border-radius: 5px;
  background: none;
  cursor: pointer;
}

.mde-cp-hex {
  flex: 1;
  min-width: 0;
  height: 24px;
  padding: 0 6px;
  border: 1px solid var(--mde-border-primary, #e5e5e5);
  border-radius: 5px;
  background: var(--mde-surface, #fff);
  color: var(--mde-text-primary, #1a1a1a);
  font-size: 12px;
}

/* Trigger + popover used in the element panel / background editor. */

.mde-cp-btn-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.mde-cp-btn-label {
  font-size: 12px;
  color: var(--mde-text-secondary, #555);
}

.mde-cp-trigger {
  width: 24px;
  height: 24px;
  min-width: 24px;
  padding: 0;
  border: 1px solid var(--mde-border-primary, #e5e5e5);
  border-radius: 5px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--mde-text-muted, #9ca3af);
}

.mde-cp-trigger--none {
  background: var(--mde-surface-elevated, #fff);
}

.mde-cp-pop {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 60;
  padding: 9px;
  background: var(--mde-surface-elevated, #fff);
  border: 1px solid var(--mde-border-primary, #e5e5e5);
  border-radius: 9px;
  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.16);
}

/* Spinner for in-flight async operations (e.g. image upload). */

@keyframes mde-spin {
  to {
    transform: rotate(360deg);
  }
}

.mde-spin {
  animation: mde-spin 800ms linear infinite;
  transform-origin: center;
}

/* ============================================================
 * @-mention pill — atomic inline chip rendered inside text blocks
 * (the contentEditable=false wrapper lives in TextContent.tsx).
 * Per-kind background tints come from the modifier class. The chip
 * uses inline-block so it flows with surrounding text and breaks at
 * its own boundary on word-wrap.
 * ============================================================ */

.mde-mention {
  display: inline-flex;
  align-items: center;
  vertical-align: baseline;
  padding: 1px 4px;
  margin: 0 1px;
  border-radius: 4px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  background-color: var(--mde-bg-tertiary, #eef2ff);
  color: var(--mde-accent, #2563eb);
  transition: background-color 120ms ease;
  user-select: all;
}

.mde-mention:hover {
  background-color: var(--mde-bg-secondary, #e0e7ff);
}

.mde-mention-page {
  background-color: rgba(37, 99, 235, 0.10);
  color: var(--mde-accent, #2563eb);
}

.mde-mention-user {
  background-color: rgba(16, 185, 129, 0.12);
  color: var(--mde-success, #047857);
}

.mde-mention-date {
  background-color: rgba(234, 179, 8, 0.15);
  color: var(--mde-warning, #a16207);
}

.mde-mention-record {
  background-color: rgba(168, 85, 247, 0.28);
  color: #3b0764;
}

/* Freeform / contact-style chip — muted neutral so users can tell at a
 * glance that this isn't a linked workspace member. */

.mde-mention-person,
.mde-mention-contact {
  background-color: rgba(107, 114, 128, 0.28);
  color: #111827;
}

.mde-mention-deleted {
  opacity: 0.65;
  text-decoration: line-through;
  text-decoration-thickness: 1px;
}

.mde-mention-deleted-suffix {
  font-style: italic;
  font-weight: 400;
  margin-left: 2px;
  opacity: 0.7;
}

/* Hover affordance for removing a mention chip.
 *
 * Rendered inside every chip, but the CSS keeps it hidden in read-only
 * contexts. The "inside an editable surface" check is satisfied by any
 * [contenteditable] ancestor, so the X shows in the main editor, list
 * cells, table cells, and MentionInput — and stays hidden in side panels
 * that render <TitleText> / <CommentBody> read-only views. */

.mde-mention-remove {
  display: none;
  margin-left: 4px;
  width: 14px;
  height: 14px;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 999px;
  background-color: rgba(0, 0, 0, 0.12);
  color: inherit;
  font-size: 10px;
  line-height: 1;
  cursor: pointer;
  user-select: none;
  vertical-align: middle;
  padding: 0;
}

.mde-mention-remove:hover {
  background-color: rgba(0, 0, 0, 0.22);
}

[contenteditable] .mde-mention:hover .mde-mention-remove,
[contenteditable] .mde-mention:focus-within .mde-mention-remove {
  display: inline-flex;
}

/* MentionInput — single-line contentEditable with chip support. Hosts apply
 * their own padding/border via className/style; we only handle placeholder
 * affordance and line constraints. */

.mde-mention-input {
  outline: none;
  white-space: nowrap;
  overflow-x: auto;
  scrollbar-width: thin;
  min-height: 1.4em;
  line-height: 1.4;
  word-break: keep-all;
}

/* Tabs block — kill the contentEditable focus outline on the active panel
 * (the browser default blue ring inherits down through the editor root).
 * The panel still receives focus via inner blocks; the outline just
 * looked like an erroneous box around tab content. */

.mde-tabs-panel {
  outline: none;
}

/* Tab close-button — visible only on hover/focus to keep the strip
 * clean. Reveal on tab hover, on the close itself, and when the tab is
 * active. */

.mde-tabs-tab:hover .mde-tabs-tab-close,
.mde-tabs-tab:focus-within .mde-tabs-tab-close,
.mde-tabs-tab[data-tab-active="true"] .mde-tabs-tab-close {
  opacity: 0.7 !important;
}

.mde-tabs-tab-close:hover {
  opacity: 1 !important;
}

/* Tabs block, print form. Paper has nothing to click, so every tab is laid
 * out stacked with its label above it (see TabsBlock's printMode branch).
 * The label carries the strip's job: telling the reader which tab is which. */

/* No 'break-inside: avoid' here: a tab body has unbounded height, and an
 * avoid-break element taller than the page box prints as an empty rectangle
 * in Chromium. Long tab content breaks across sheets instead. */

.mde-tabs-print-section {
  margin: 12px 0;
}

.mde-tabs-print-label {
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--mde-text-muted, #6b7280);
  padding-bottom: 4px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--mde-border-primary, #e5e7eb);
  break-after: avoid;
}

/* Toggle block — hairline indent guide on the children container. Lighter
 * than --border-primary so the line reads as a faint cue, not a frame. */

.mde-toggle-children {
  border-left: 0.5px solid var(--mde-border-subtle, #ececec);
}
`;
