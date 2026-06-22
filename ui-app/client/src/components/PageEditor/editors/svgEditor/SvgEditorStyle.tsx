import React from 'react';

// Self-contained styles for the SVG editor modal (rendered into the Portal).
export function SvgEditorStyle() {
	return (
		<style id="SvgEditorCss">{`
		._svgEditorBackdrop {
			position: fixed;
			inset: 0;
			background: rgba(0, 0, 0, 0.45);
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 10000;
		}
		._svgEditorModal {
			display: flex;
			flex-direction: column;
			width: 86vw;
			height: 86vh;
			max-width: 1300px;
			background: #fff;
			border-radius: 6px;
			overflow: hidden;
			font-size: 13px;
			color: #2b2b2b;
		}
		._svgEditorToolbar {
			display: flex;
			align-items: center;
			gap: 12px;
			padding: 8px 12px;
			border-bottom: 1px solid #e5e7eb;
			background: #fafafa;
			flex-wrap: wrap;
		}
		._svgEditorToolbar ._spacer { flex: 1; }
		._svgEditorShapes { display: flex; align-items: center; gap: 4px; }
		._svgEditorShapes ._groupLabel { color: #888; margin-right: 4px; }
		._svgToolButton, ._svgEditorToolbar ._toolBtn {
			border: 1px solid #d1d5db;
			background: #fff;
			border-radius: 4px;
			width: 30px;
			height: 28px;
			cursor: pointer;
			color: #374151;
		}
		._svgToolButton:hover, ._toolBtn:hover { background: #f0f0f0; }
		._svgToolButton:disabled, ._toolBtn:disabled { opacity: 0.4; cursor: not-allowed; }
		._svgEditorBody { flex: 1; display: flex; min-height: 0; }
		._svgEditorTreePane {
			width: 240px;
			border-right: 1px solid #e5e7eb;
			overflow: auto;
			padding: 6px 0;
		}
		._svgEditorCanvas {
			flex: 1;
			position: relative;
			overflow: auto;
			background: repeating-conic-gradient(#f3f4f6 0% 25%, #fff 0% 50%) 50% / 20px 20px;
		}
		/* A concrete stage so SVGs sized with width/height="100%" (or relying on
		   their container's size, like the runtime component) resolve to a real
		   size instead of collapsing to 0. */
		._svgEditorCanvasInner {
			width: 100%;
			height: 100%;
			min-height: 100%;
			padding: 24px;
			box-sizing: border-box;
		}
		._svgEditorCanvasInner svg {
			width: 100%;
			height: 100%;
			max-width: 100%;
			max-height: 100%;
		}
		._svgEditorSidePane {
			width: 320px;
			border-left: 1px solid #e5e7eb;
			overflow: auto;
			display: flex;
			flex-direction: column;
		}
		._svgEditorEmpty { padding: 16px; color: #9ca3af; font-style: italic; }

		._svgEditorTree ._svgTreeRow {
			display: flex;
			align-items: center;
			gap: 6px;
			width: 100%;
			border: none;
			background: none;
			text-align: left;
			padding: 3px 6px;
			cursor: pointer;
			color: #374151;
			font-size: 12px;
		}
		._svgEditorTree ._svgTreeRow:hover { background: #f3f4f6; }
		._svgEditorTree ._svgTreeRow._selected { background: #dbeafe; color: #1e3a8a; }
		._svgEditorTree ._caret { width: 10px; color: #9ca3af; }
		._svgEditorTree ._caretSpacer { display: inline-block; width: 10px; }

		._svgEditorInspector, ._svgEditorAnim { padding: 10px; }
		._svgInspectorHeader {
			display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;
		}
		._svgInspectorHeader ._tag { font-family: monospace; color: #2563eb; }
		._svgSection { border-bottom: 1px solid #eef0f2; padding: 4px 0; }
		._svgSectionTitle {
			display: flex; align-items: center; gap: 6px; width: 100%;
			border: none; background: none; text-align: left; cursor: pointer;
			font-weight: 600; color: #6b7280; text-transform: uppercase; font-size: 10px;
			letter-spacing: 0.05em; margin: 4px 0 6px;
		}
		._svgSectionTitle .fa { color: #9ca3af; }
		._svgSectionBody { padding-bottom: 4px; }
		._svgField { display: flex; flex-direction: column; gap: 2px; margin-bottom: 6px; }
		._svgField > span { color: #6b7280; font-size: 11px; }
		._svgColorRow { display: flex; gap: 6px; align-items: center; }
		._svgColorRow input[type=color] { width: 28px; height: 28px; padding: 0; border: 1px solid #d1d5db; border-radius: 4px; background: none; }
		._svgAttrRow { display: flex; gap: 4px; align-items: center; margin-bottom: 4px; }
		._svgEditor ._peInput, ._svgEditorModal ._peInput {
			border: 1px solid #d1d5db; border-radius: 4px; padding: 4px 6px; width: 100%;
			font-size: 12px; background: #fff;
		}
		._svgIconButton {
			border: 1px solid #d1d5db; background: #fff; border-radius: 4px;
			width: 26px; height: 26px; flex: 0 0 auto; cursor: pointer; color: #6b7280;
		}
		._svgIconButton:hover { background: #f0f0f0; }

		._svgEditorSidePane ._sideTabs { display: flex; border-bottom: 1px solid #e5e7eb; }
		._svgEditorSidePane ._sideTabs button {
			flex: 1; border: none; background: none; padding: 8px; cursor: pointer; color: #6b7280;
			border-bottom: 2px solid transparent;
		}
		._svgEditorSidePane ._sideTabs button._active { color: #2563eb; border-bottom-color: #2563eb; }

		._svgAnimTabs { display: flex; gap: 4px; margin-bottom: 10px; }
		._svgAnimTabs button {
			border: 1px solid #d1d5db; background: #fff; border-radius: 4px; padding: 4px 12px;
			cursor: pointer; color: #374151;
		}
		._svgAnimTabs button._active { background: #2563eb; color: #fff; border-color: #2563eb; }
		._svgFieldWide textarea { font-family: monospace; resize: vertical; }

		._svgPrimaryButton {
			background: #2563eb; color: #fff; border: none; border-radius: 4px;
			padding: 7px 12px; cursor: pointer; margin-top: 8px; width: 100%;
		}
		._svgPrimaryButton:hover { background: #1d4ed8; }
		._svgPrimaryButton:disabled { opacity: 0.5; cursor: not-allowed; }
		._svgDangerButton {
			background: #fff; color: #dc2626; border: 1px solid #fca5a5; border-radius: 4px;
			padding: 4px 8px; cursor: pointer;
		}
		._svgDangerButton:hover { background: #fef2f2; }
		._svgSaveButton {
			background: #16a34a; color: #fff; border: none; border-radius: 4px;
			padding: 7px 16px; cursor: pointer;
		}
		._svgSaveButton:hover { background: #15803d; }

		/* Slider rows */
		._svgSliderRow { display: flex; gap: 6px; align-items: center; }
		._svgSliderRow input[type=range] { flex: 1; }
		._svgSliderNum { width: 64px; flex: 0 0 auto; }

		/* Color quick-token buttons */
		._svgColorRow ._svgTokenBtn {
			border: 1px solid #d1d5db; background: #fff; border-radius: 4px;
			height: 28px; min-width: 28px; cursor: pointer; color: #6b7280; font-size: 11px;
		}
		._svgColorRow ._svgTokenBtn:hover { background: #f0f0f0; }

		/* Quick transform buttons */
		._svgQuickRow { display: flex; gap: 4px; flex-wrap: wrap; }
		._svgToolButton {
			border: 1px solid #d1d5db; background: #fff; border-radius: 4px;
			padding: 3px 8px; min-height: 26px; cursor: pointer; color: #374151; font-size: 11px;
		}
		._svgToolButton:hover { background: #f0f0f0; }

		/* Animation list */
		._svgAnimList { margin-bottom: 8px; display: flex; flex-direction: column; gap: 4px; }
		._svgAnimItem {
			display: flex; align-items: center; justify-content: space-between; gap: 6px;
			background: #f3f4f6; border-radius: 4px; padding: 3px 6px; font-size: 11px;
		}
		._svgAnimItem span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
		._svgAnimSub { margin-top: 8px; }

		/* Editable existing-animation cards */
		._svgAnimEditList { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
		._svgAnimEdit { border: 1px solid #e5e7eb; border-radius: 6px; padding: 6px 8px; }
		._svgAnimEditHead { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
		._svgAnimEditHead ._chip {
			background: #eef2ff; color: #4338ca; border-radius: 4px; padding: 1px 6px; font-size: 10px;
			text-transform: uppercase; letter-spacing: 0.03em;
		}
		._svgAnimField { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
		._svgAnimField > span { color: #6b7280; font-size: 11px; width: 78px; flex: 0 0 auto; }

		/* Simple animation presets */
		._svgPresetGrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; margin-bottom: 8px; }
		._svgPresetBtn {
			border: 1px solid #d1d5db; background: #fff; border-radius: 4px; padding: 6px 4px;
			cursor: pointer; color: #374151; font-size: 11px;
		}
		._svgPresetBtn:hover { background: #eff6ff; border-color: #2563eb; color: #1d4ed8; }
		._svgAdvancedToggle {
			border: none; background: none; cursor: pointer; color: #6b7280; font-size: 11px;
			display: flex; align-items: center; gap: 6px; margin-top: 8px; padding: 2px 0;
		}
		._svgAdvancedAnim { margin-top: 6px; border-top: 1px dashed #e5e7eb; padding-top: 8px; }

		/* Path editor */
		._svgPathEditor { display: flex; flex-direction: column; gap: 6px; }
		._svgPathSeg { border: 1px solid #e5e7eb; border-radius: 6px; padding: 6px; }
		._svgPathSegHead { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
		._svgPathCmd { width: 52px; flex: 0 0 auto; }
		._svgPathIndex { color: #9ca3af; font-size: 11px; flex: 1; }
		._svgPathGroup { display: flex; align-items: center; gap: 4px; margin-bottom: 3px; }
		._svgPathGroup ._grpLabel { color: #6b7280; font-size: 10px; width: 56px; flex: 0 0 auto; }
		._svgPathGroup._anchor ._grpLabel { color: #2563eb; font-weight: 600; }
		._svgPathAppend { display: flex; gap: 4px; flex-wrap: wrap; margin: 4px 0; }

		/* Path point handles overlaid on the canvas */
		._svgPathHandles { position: absolute; inset: 0; pointer-events: none; z-index: 5; }
		._svgPathHandle {
			position: absolute; width: 12px; height: 12px; transform: translate(-50%, -50%);
			pointer-events: all; cursor: grab; box-sizing: border-box;
		}
		._svgPathHandle._anchor { background: #2563eb; border: 2px solid #fff; border-radius: 2px; }
		._svgPathHandle._control { background: #fff; border: 2px solid #f59e0b; border-radius: 50%; }
		`}</style>
	);
}
