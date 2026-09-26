import React from 'react';

/**
 * Scoped CSS for the scene editor, following SvgEditorStyle: a plain <style>
 * emitted with the modal rather than an entry in the page editor's stylesheet,
 * so the whole editor arrives and leaves in one chunk.
 */
export function SceneEditorStyle() {
	return (
		<style id="sceneEditorCss">{`
._sceneEditorBackdrop {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.55);
	z-index: 10000;
	display: flex;
	align-items: center;
	justify-content: center;
}

._sceneEditorModal {
	width: 94vw;
	height: 92vh;
	background: #ffffff;
	border-radius: 8px;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	box-shadow: 0 18px 48px rgba(0, 0, 0, 0.35);
	font-size: 12px;
	color: #21252b;
}

._sceneEditorToolbar {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 8px 10px;
	border-bottom: 1px solid #e3e6ea;
	flex: 0 0 auto;
}

._sceneEditorToolbar ._spacer { flex: 1; }

._sceneToolBtn {
	border: 1px solid #d5d9e0;
	background: #f7f8fa;
	border-radius: 4px;
	padding: 4px 9px;
	cursor: pointer;
	font-size: 11px;
	color: #21252b;
}

._sceneToolBtn:hover:not(:disabled) { background: #eceff3; }
._sceneToolBtn._on { background: #fdf1de; border-color: #f0c98a; font-weight: 600; }
._sceneToolDivider {
	width: 1px;
	align-self: stretch;
	background: #e3e6ea;
	margin: 0 3px;
}
._sceneToolBtn:disabled { opacity: 0.45; cursor: not-allowed; }
._sceneToolBtn._danger { color: #b42318; border-color: #f0c2bd; }

._sceneSaveButton {
	border: none;
	background: #f5a623;
	color: #ffffff;
	border-radius: 4px;
	padding: 5px 16px;
	cursor: pointer;
	font-weight: 600;
}

._sceneProblems {
	flex: 0 0 auto;
	background: #fff6ed;
	border-bottom: 1px solid #f5d5b0;
	color: #8a4b08;
	padding: 6px 10px;
	max-height: 96px;
	overflow: auto;
}

._sceneEditorBody {
	flex: 1;
	display: flex;
	min-height: 0;
}

._sceneEditorTreePane {
	width: 240px;
	flex: 0 0 auto;
	border-right: 1px solid #e3e6ea;
	overflow: auto;
}

._sceneEditorCanvasPane {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	/* A mid-grey behind a transparent canvas, so a scene with no background
	   is visible whether its objects are light or dark. */
	background: #2a2f38;
	overflow: auto;
}

._sceneEditorSidePane {
	width: 340px;
	flex: 0 0 auto;
	border-left: 1px solid #e3e6ea;
	display: flex;
	flex-direction: column;
	min-height: 0;
}

._sceneTabs {
	display: flex;
	border-bottom: 1px solid #e3e6ea;
	flex: 0 0 auto;
}

._sceneTab {
	flex: 1;
	border: none;
	background: transparent;
	padding: 7px 4px;
	cursor: pointer;
	font-size: 11px;
	text-transform: capitalize;
	color: #5a6472;
	border-bottom: 2px solid transparent;
}

._sceneTab._selected {
	color: #21252b;
	border-bottom-color: #f5a623;
	font-weight: 600;
}

._sceneEditorSidePane > *:not(._sceneTabs) {
	flex: 1;
	overflow: auto;
	padding: 10px;
	min-height: 0;
}

._sceneViewport { position: relative; flex: 1; min-height: 320px; display: flex; }
._sceneViewportCanvas { flex: 1; min-height: 320px; }
._sceneViewportCanvas > canvas { display: block; width: 100%; height: 100%; }

/* Bottom-left, opposite the error strip, and click-through so it never sits
   between the pointer and a drag handle. */
._sceneViewportHint {
	position: absolute;
	left: 10px;
	bottom: 10px;
	background: rgba(0, 0, 0, 0.45);
	color: #ffffff;
	padding: 3px 7px;
	border-radius: 4px;
	font-size: 10px;
	pointer-events: none;
}

._sceneViewportError {
	position: absolute;
	inset: auto 10px 10px auto;
	max-width: 60%;
	background: #b42318;
	color: #ffffff;
	padding: 6px 8px;
	border-radius: 4px;
}

._sceneTree { padding: 8px; display: flex; flex-direction: column; gap: 2px; }
._sceneTreeActions { display: flex; gap: 4px; margin-bottom: 6px; flex-wrap: wrap; }

._sceneTreeGroup {
	font-size: 10px;
	text-transform: uppercase;
	letter-spacing: 0.06em;
	color: #8a94a3;
	margin: 8px 0 2px;
}

._sceneTreeRow {
	display: flex;
	align-items: center;
	gap: 6px;
	width: 100%;
	border: 1px solid transparent;
	background: transparent;
	border-radius: 4px;
	padding: 4px 6px;
	cursor: pointer;
	text-align: left;
	font-size: 11px;
	color: #21252b;
}

._sceneTreeRow:hover { background: #f1f3f6; }
/* The row is a div carrying role="button", so the focus ring a real button
   would have has to be asked for. */
._sceneTreeRow:focus-visible { outline: 2px solid #f5a623; outline-offset: -2px; }
._sceneTreeRow._selected { background: #fdf1de; border-color: #f0c98a; }
._sceneTreeLabel { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

._sceneEyeBtn {
	border: none;
	background: transparent;
	cursor: pointer;
	color: #5a6472;
	font-size: 12px;
	line-height: 1;
}

._sceneTreeEmpty, ._sceneNote {
	color: #6b7686;
	font-size: 11px;
	line-height: 1.45;
	margin: 4px 0;
	overflow-wrap: anywhere;
	min-width: 0;
}

._sceneInspectorTitle {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	font-weight: 600;
	font-size: 11px;
	text-transform: uppercase;
	letter-spacing: 0.05em;
	color: #5a6472;
	margin: 12px 0 6px;
}

._sceneInspectorTitle:first-child { margin-top: 0; }
._sceneInspectorEmpty { color: #8a94a3; }

/* A 96px label plus three axis fields does not fit a 340px pane: the labels
   were clipped, the z field ran off the edge, and the notes were cut off on
   the left. Labels sit ABOVE their control instead, which fits at any pane
   width and stops the panel depending on one. */
._sceneField {
	display: flex;
	flex-direction: column;
	align-items: stretch;
	gap: 3px;
	margin-bottom: 8px;
	min-width: 0;
}

._sceneField > span {
	color: #5a6472;
	font-size: 10px;
	text-transform: uppercase;
	letter-spacing: 0.04em;
}

._sceneField input[type='text'],
._sceneField input[type='number'],
._sceneField select {
	flex: 1;
	min-width: 0;
	border: 1px solid #d5d9e0;
	border-radius: 4px;
	padding: 4px 6px;
	font-size: 11px;
	background: #ffffff;
	color: #21252b;
}

._sceneField input[type='color'] {
	width: 52px;
	height: 26px;
	padding: 0;
	border: 1px solid #d5d9e0;
	border-radius: 4px;
	background: #ffffff;
}

._sceneCheck { display: flex; gap: 8px; align-items: center; margin-bottom: 6px; }

/* Label on its own line, then the three axes share the width evenly. */
._sceneVecRow {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 5px;
	margin-bottom: 10px;
}

._sceneVecLabel {
	grid-column: 1 / -1;
	color: #5a6472;
	font-size: 10px;
	text-transform: uppercase;
	letter-spacing: 0.04em;
}

._sceneVecRow ._sceneField {
	flex-direction: row;
	align-items: center;
	margin: 0;
	gap: 4px;
	min-width: 0;
}

._sceneVecRow ._sceneField > span {
	flex: 0 0 auto;
	color: #98a1ae;
	text-transform: none;
	font-size: 10px;
}

._sceneVecRow ._sceneField input { min-width: 0; }

._sceneShaderSource {
	width: 100%;
	min-height: 220px;
	font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
	font-size: 11px;
	line-height: 1.45;
	border: 1px solid #d5d9e0;
	border-radius: 4px;
	padding: 8px;
	resize: vertical;
	background: #fbfbfc;
	color: #21252b;
}

._sceneShaderError {
	background: #fdeceb;
	border: 1px solid #f0c2bd;
	color: #8a2018;
	padding: 6px 8px;
	border-radius: 4px;
	white-space: pre-wrap;
	font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
	font-size: 10px;
	max-height: 140px;
	overflow: auto;
}

._sceneShaderMissing {
	background: #fff6ed;
	border: 1px solid #f5d5b0;
	color: #8a4b08;
	padding: 6px 8px;
	border-radius: 4px;
	margin: 6px 0;
	line-height: 1.45;
}

._sceneTimelineBar {
	display: flex;
	align-items: center;
	gap: 8px;
	flex-wrap: wrap;
	margin-bottom: 8px;
}

._sceneTimelineBar ._sceneField { margin: 0; flex-direction: row; align-items: center; }
._sceneTimelineBar ._sceneField > span { flex: 0 0 auto; }
._sceneScrub { flex: 1; min-width: 120px; }
._sceneScrubValue {
	font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
	font-size: 10px;
	color: #5a6472;
	min-width: 42px;
}

._sceneTrack {
	border: 1px solid #e3e6ea;
	border-radius: 5px;
	padding: 6px;
	margin-bottom: 7px;
}

._sceneTrackHead { display: flex; align-items: center; gap: 5px; margin-bottom: 5px; }
._sceneTrackTarget {
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-weight: 600;
}

._sceneTrackHead select {
	border: 1px solid #d5d9e0;
	border-radius: 4px;
	font-size: 10px;
	padding: 2px 4px;
	max-width: 110px;
}

._sceneTrackOrphan {
	background: #fff6ed;
	border: 1px solid #f5d5b0;
	color: #8a4b08;
	padding: 4px 6px;
	border-radius: 4px;
	margin-bottom: 5px;
	line-height: 1.4;
}

._sceneKeys { display: flex; flex-direction: column; gap: 4px; }
._sceneKey { display: flex; align-items: center; gap: 5px; }
._sceneKey label { display: flex; align-items: center; gap: 3px; flex: 1; }
._sceneKey label span { color: #98a1ae; font-size: 10px; }
._sceneKey input {
	flex: 1;
	min-width: 0;
	border: 1px solid #d5d9e0;
	border-radius: 4px;
	padding: 3px 5px;
	font-size: 11px;
}

._sceneKeyDel {
	border: none;
	background: transparent;
	color: #b42318;
	cursor: pointer;
	font-size: 14px;
	line-height: 1;
	padding: 0 4px;
}

._sceneKeyDel:disabled { opacity: 0.3; cursor: not-allowed; }

._sceneInteractionRow {
	border: 1px solid #e3e6ea;
	border-radius: 5px;
	padding: 7px;
	margin-bottom: 7px;
}

/* The prompt pane owns its own scroll: the log grows and the input bar stays
   put at the bottom. The side pane's blanket overflow rule below would
   otherwise scroll the bar off with it. */
._scenePromptPane {
	display: flex;
	flex-direction: column;
	min-height: 0;
	padding: 0 !important;
	overflow: hidden !important;
}

._scenePromptLog {
	flex: 1;
	overflow: auto;
	padding: 10px;
	min-height: 0;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

._scenePromptTurn {
	border-radius: 6px;
	padding: 6px 8px;
	line-height: 1.45;
	overflow-wrap: anywhere;
	max-width: 100%;
}

._scenePromptTurn._user {
	background: #fdf1de;
	border: 1px solid #f0c98a;
	align-self: flex-end;
}

._scenePromptTurn._assistant {
	background: #f4f6f8;
	border: 1px solid #e3e6ea;
	align-self: flex-start;
}

._scenePromptText { white-space: pre-wrap; }

._scenePromptAttached {
	color: #8a94a3;
	font-size: 10px;
	margin-top: 3px;
}

._scenePromptWarnings {
	margin: 6px 0 0;
	padding-left: 16px;
	color: #8a4b08;
	font-size: 10px;
	line-height: 1.5;
}

._scenePromptAttachments {
	display: flex;
	flex-wrap: wrap;
	gap: 5px;
	padding: 6px 10px 0;
	flex: 0 0 auto;
}

._scenePromptChip {
	position: relative;
	border: 1px solid #d5d9e0;
	border-radius: 4px;
	background: #f7f8fa;
	padding: 2px;
	display: flex;
	align-items: center;
}

._scenePromptChip img { width: 44px; height: 44px; object-fit: cover; border-radius: 3px; }
._scenePromptFile { padding: 4px 6px; font-size: 10px; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

._scenePromptChip button {
	border: none;
	background: rgba(0, 0, 0, 0.55);
	color: #ffffff;
	border-radius: 50%;
	width: 15px;
	height: 15px;
	line-height: 1;
	font-size: 11px;
	cursor: pointer;
	position: absolute;
	top: -5px;
	right: -5px;
	padding: 0;
}

._scenePromptBar {
	display: flex;
	align-items: flex-end;
	gap: 5px;
	padding: 8px 10px;
	border-top: 1px solid #e3e6ea;
	flex: 0 0 auto;
}

._scenePromptInput {
	flex: 1;
	min-width: 0;
	resize: none;
	border: 1px solid #d5d9e0;
	border-radius: 4px;
	padding: 5px 6px;
	font-size: 11px;
	line-height: 1.45;
	font-family: inherit;
	color: #21252b;
	background: #ffffff;
}

._scenePromptBar ._sceneSaveButton:disabled { opacity: 0.45; cursor: not-allowed; }

._scenePresetGallery { padding: 12px; overflow: auto; background: #ffffff; flex: 1; }
._scenePresetGalleryGrid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
	gap: 10px;
}
`}</style>
	);
}
