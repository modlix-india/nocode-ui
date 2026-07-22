import React from 'react';
import { processStyleDefinition, processStyleValueWithFunction } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './TemplateEditorStyleProperties';
import { StyleResolution } from '../../types/common';

const PREFIX = '.comp.compTemplateEditor';
export default function TemplateEditorStyle({
	theme,
}: Readonly<{
	theme: Map<string, Map<string, string>>;
}>) {
	const values = new Map([...(theme.get(StyleResolution.ALL) ?? []), ...styleDefaults]);
	const border = processStyleValueWithFunction(values.get('fontColorEight'), values) || '#e0e0e0';
	// Lighter hairline for internal dividers, to keep the editor from looking busy.
	const line = '#eef0f3';

	const css =
		`
	${PREFIX} {
		display: flex;
		flex-direction: column;
		min-height: 480px;
		height: 100%;
		flex: 1;
	}

	${PREFIX} ._templateEditorLoading {
		padding: 20px;
	}

	${PREFIX} ._templateEditor {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
		border-radius: 8px;
		overflow: hidden;
		background: #fff;
	}

	/* Toolbar */
	${PREFIX} ._teToolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		padding: 10px 14px;
		border-bottom: 1px solid ${line};
		flex-wrap: wrap;
	}
	${PREFIX} ._teToolbarLeft { display: flex; gap: 12px; align-items: center; }
	${PREFIX} ._teToolbarRight { display: flex; gap: 6px; align-items: center; }
	${PREFIX} ._teSelect {
		display: flex;
		flex-direction: column;
		font-size: 11px;
		gap: 3px;
		color: #666;
	}
	${PREFIX} ._teSelect select {
		padding: 5px 8px;
		border: 1px solid ${border};
		border-radius: 4px;
		font-size: 13px;
		min-width: 120px;
	}
	${PREFIX} ._teTab {
		padding: 6px 12px;
		border: 1px solid transparent;
		border-radius: 6px;
		background: transparent;
		cursor: pointer;
		font-size: 13px;
		color: #6b7280;
	}
	${PREFIX} ._teTab:hover { background: #f3f4f6; }
	${PREFIX} ._teTab._active { background: #eef2ff; color: #4338ca; }

	/* Body: editor | preview | right panel */
	${PREFIX} ._teBody {
		display: flex;
		flex: 1;
		min-height: 0;
	}
	${PREFIX} ._teEditorColumn {
		display: flex;
		flex-direction: column;
		flex: 1 1 45%;
		min-width: 0;
		border-right: 1px solid ${line};
	}
	${PREFIX} ._tePreviewColumn {
		display: flex;
		flex-direction: column;
		flex: 1 1 45%;
		min-width: 0;
	}
	${PREFIX} ._teRightPanel {
		flex: 0 0 330px;
		border-left: 1px solid ${line};
		overflow: auto;
		padding: 16px;
	}

	/* Part tabs (underline style, no boxes) */
	${PREFIX} ._partTabs {
		display: flex;
		gap: 14px;
		padding: 8px 14px 0 14px;
	}
	${PREFIX} ._partTab {
		padding: 6px 2px;
		border: none;
		border-bottom: 2px solid transparent;
		background: transparent;
		cursor: pointer;
		font-size: 13px;
		color: #6b7280;
	}
	${PREFIX} ._partTab._active { color: #4338ca; border-bottom-color: #6366f1; font-weight: 600; }

	${PREFIX} ._partEditor {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
	}
	${PREFIX} ._partToolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 8px;
		gap: 8px;
	}
	${PREFIX} ._partLabel { font-size: 12px; color: #666; font-weight: 600; }
	${PREFIX} ._htmlEditor { flex: 1; min-height: 0; }
	${PREFIX} ._textPart {
		flex: 1;
		margin: 0 8px 8px 8px;
		padding: 8px;
		border: 1px solid ${border};
		border-radius: 4px;
		font-family: inherit;
		font-size: 13px;
		resize: none;
	}
	${PREFIX} ._editorLoading { padding: 12px; color: #888; }

	/* Variable picker */
	${PREFIX} ._varPicker { position: relative; }
	${PREFIX} ._varButton {
		padding: 4px 10px;
		border: 1px solid ${border};
		border-radius: 4px;
		background: #fff;
		cursor: pointer;
		font-size: 12px;
	}
	${PREFIX} ._varDropdown {
		position: absolute;
		right: 0;
		top: 110%;
		z-index: 20;
		background: #fff;
		border: 1px solid ${border};
		border-radius: 4px;
		box-shadow: 0 4px 16px rgba(0,0,0,0.12);
		max-height: 260px;
		overflow: auto;
		min-width: 220px;
	}
	${PREFIX} ._varItem {
		display: flex;
		justify-content: space-between;
		gap: 10px;
		width: 100%;
		text-align: left;
		padding: 6px 10px;
		border: none;
		background: transparent;
		cursor: pointer;
		font-size: 12px;
	}
	${PREFIX} ._varItem:hover { background: #f2f6ff; }
	${PREFIX} ._varPath { font-family: monospace; }
	${PREFIX} ._varType { color: #999; font-size: 11px; }
	${PREFIX} ._varEmpty { padding: 10px; font-size: 12px; color: #888; max-width: 240px; }

	/* Preview */
	${PREFIX} ._previewPane {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
	}
	${PREFIX} ._previewToolbar {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 6px 10px;
		border-bottom: 1px solid ${border};
	}
	${PREFIX} ._previewTitle { font-size: 12px; font-weight: 600; color: #666; }
	${PREFIX} ._refreshButton {
		padding: 4px 10px;
		border: 1px solid ${border};
		border-radius: 4px;
		background: #fff;
		cursor: pointer;
		font-size: 12px;
	}
	${PREFIX} ._previewLoading { font-size: 12px; color: #3b82f6; }
	${PREFIX} ._previewError {
		padding: 8px 10px;
		background: #fef2f2;
		color: #b91c1c;
		font-size: 12px;
		white-space: pre-wrap;
	}
	${PREFIX} ._deviceSizes { display: flex; align-items: center; gap: 6px; }
	${PREFIX} ._deviceSizes ._icon {
		padding: 4px; border-radius: 4px; height: 28px;
		display: flex; align-items: center; cursor: pointer;
		background: transparent; border: none;
	}
	${PREFIX} ._deviceSizes ._icon._selected,
	${PREFIX} ._deviceSizes ._icon:hover { background-color: #f0f0f0; }

	${PREFIX} ._previewBody { flex: 1; min-height: 0; overflow: auto; background: #f5f5f5; display: flex; justify-content: center; }
	${PREFIX} ._pdfPreview { width: 100%; height: 100%; border: none; }
	${PREFIX} ._htmlPreviewWrap { display: flex; flex-direction: column; width: 100%; }
	${PREFIX} ._previewSubject { padding: 8px 12px; background: #fff; border-bottom: 1px solid ${border}; font-size: 13px; }
	${PREFIX} ._previewSubject span { color: #999; margin-right: 6px; }
	${PREFIX} ._htmlPreview { border: none; background: #fff; flex: 1; width: 100%; height: 100%; }
	${PREFIX} ._htmlPreview.DESKTOP { }
	${PREFIX} ._htmlPreviewWrap.TABLET { max-width: 768px; }
	${PREFIX} ._htmlPreviewWrap.MOBILE { max-width: 400px; }
	${PREFIX} ._textPreview {
		padding: 16px; margin: 16px; background: #fff; border-radius: 8px;
		white-space: pre-wrap; font-size: 14px; align-self: flex-start; max-width: 400px;
		box-shadow: 0 1px 4px rgba(0,0,0,0.1);
	}
	${PREFIX} ._previewPlaceholder { padding: 20px; color: #999; font-size: 13px; }

	/* Right panels */
	${PREFIX} ._panelHint { font-size: 12px; color: #777; margin-bottom: 10px; }
	${PREFIX} ._jsonEditor { height: 320px; border: 1px solid ${border}; border-radius: 4px; }
	${PREFIX} ._sampleDataError { color: #b91c1c; font-size: 12px; margin-top: 6px; }
	${PREFIX} ._settingsPanel { display: flex; flex-direction: column; gap: 12px; }
	${PREFIX} ._field { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #666; }
	${PREFIX} ._field input {
		padding: 6px 8px; border: 1px solid ${border}; border-radius: 4px; font-size: 13px;
	}
	${PREFIX} ._pdfHint { font-size: 12px; color: #666; }
	${PREFIX} ._pdfHint pre {
		background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto; font-size: 11px;
	}

	/* Mode toggle (Visual / Code) */
	${PREFIX} ._modeToggle { display: flex; gap: 4px; padding: 8px 8px 0 8px; }
	${PREFIX} ._modeBtn {
		padding: 5px 12px; border: 1px solid ${border}; border-radius: 4px;
		background: #fff; cursor: pointer; font-size: 12px;
	}
	${PREFIX} ._modeBtn._active { background: #111827; color: #fff; border-color: #111827; }

	/* Visual area = palette + canvas */
	${PREFIX} ._visualArea { display: flex; flex: 1; min-height: 0; }
	${PREFIX} ._blockPalette {
		flex: 0 0 132px; border-right: 1px solid ${border}; padding: 8px; overflow: auto;
		display: flex; flex-direction: column; gap: 6px; background: #fafafa;
	}
	${PREFIX} ._paletteTitle { font-size: 11px; text-transform: uppercase; color: #999; margin-bottom: 2px; }
	${PREFIX} ._paletteItem {
		display: flex; align-items: center; gap: 8px; padding: 8px; border: 1px solid ${border};
		border-radius: 4px; background: #fff; cursor: grab; font-size: 12px;
	}
	${PREFIX} ._paletteItem:hover { border-color: #3b82f6; }
	${PREFIX} ._paletteItem i { width: 14px; text-align: center; color: #555; }

	${PREFIX} ._blockCanvas { flex: 1; min-height: 0; overflow: auto; padding: 8px 16px; background: #f5f5f5; }
	${PREFIX} ._canvasEmpty, ${PREFIX} ._canvasNote {
		padding: 20px; text-align: center; color: #888; font-size: 13px;
		border: 1px dashed ${border}; border-radius: 6px; background: #fff; margin: 8px 0;
	}
	${PREFIX} ._canvasNote p { margin: 0 0 12px; line-height: 1.6; }
	${PREFIX} ._importBtn {
		display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; cursor: pointer;
		border: 1px solid #6366f1; border-radius: 6px; background: #eef2ff; color: #4338ca;
		font-size: 13px; font-weight: 600;
	}
	${PREFIX} ._importBtn:hover { background: #6366f1; color: #fff; }
	${PREFIX} ._dropGap { height: 8px; border-radius: 4px; transition: all 0.08s; }
	${PREFIX} ._dropGap._active { height: 20px; background: #bfdbfe; border: 1px dashed #3b82f6; }
	${PREFIX} ._blockRow {
		position: relative; background: #fff; border: 1px solid transparent; border-radius: 6px;
		cursor: pointer; overflow: hidden;
	}
	${PREFIX} ._blockRow:hover { border-color: #cbd5e1; }
	${PREFIX} ._blockRow._selected { border-color: #3b82f6; box-shadow: 0 0 0 1px #3b82f6; }
	${PREFIX} ._blockPreview { pointer-events: none; }
	${PREFIX} ._blockActions {
		position: absolute; top: 4px; right: 4px; display: none; gap: 4px; align-items: center;
		background: rgba(255,255,255,0.95); border: 1px solid ${border}; border-radius: 4px; padding: 2px 4px;
	}
	${PREFIX} ._blockRow:hover ._blockActions, ${PREFIX} ._blockRow._selected ._blockActions { display: flex; }
	${PREFIX} ._blockActions button {
		border: none; background: transparent; cursor: pointer; color: #555; padding: 2px 4px; font-size: 12px;
	}
	${PREFIX} ._blockActions button:hover { color: #111; }
	${PREFIX} ._blockTypeTag { font-size: 10px; color: #999; text-transform: uppercase; margin-right: 4px; }

	/* Block properties panel */
	${PREFIX} ._blockProps { display: flex; flex-direction: column; gap: 10px; }
	${PREFIX} ._bpHeader {
		display: flex; align-items: center; justify-content: space-between;
		font-weight: 600; font-size: 13px; padding-bottom: 6px; border-bottom: 1px solid ${border};
	}
	${PREFIX} ._bpClose { border: none; background: transparent; cursor: pointer; color: #888; }
	${PREFIX} ._bpField { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #666; }
	${PREFIX} ._bpInput { padding: 6px 8px; border: 1px solid ${border}; border-radius: 4px; font-size: 13px; }
	${PREFIX} ._bpTextarea { min-height: 70px; resize: vertical; font-family: inherit; }
	${PREFIX} ._bpColor { display: flex; gap: 6px; align-items: center; }
	${PREFIX} ._bpColor input[type=color] { width: 34px; height: 30px; padding: 0; border: 1px solid ${border}; border-radius: 4px; }
	${PREFIX} ._bpColor ._bpInput { flex: 1; }
	${PREFIX} ._bpCode { border: 1px solid ${border}; border-radius: 4px; overflow: hidden; }
	${PREFIX} ._bpVars { margin-top: 4px; }
	${PREFIX} ._bpVarsToggle { border: none; background: transparent; color: #3b82f6; cursor: pointer; font-size: 12px; padding: 4px 0; }
	${PREFIX} ._bpVarsList { display: flex; flex-direction: column; gap: 2px; max-height: 180px; overflow: auto; }
	${PREFIX} ._bpVarItem {
		display: flex; justify-content: space-between; gap: 8px; border: none; background: transparent;
		cursor: pointer; padding: 4px 6px; font-size: 12px; text-align: left; border-radius: 3px;
	}
	${PREFIX} ._bpVarItem:hover { background: #f2f6ff; }
	${PREFIX} ._bpCodeArea {
		min-height: 160px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 12px; line-height: 1.5;
	}
	${PREFIX} ._bpSection {
		display: flex; flex-direction: column; gap: 10px;
		border-top: 1px solid ${border}; padding-top: 10px; margin-top: 2px;
	}
	${PREFIX} ._bpSectionToggle {
		border: none; background: transparent; color: #374151; cursor: pointer;
		font-size: 12px; font-weight: 600; padding: 2px 0; text-align: left;
	}
	${PREFIX} ._rootSettings ._panelHint { margin-bottom: 2px; }

	/* AI tab: prompt-driven authoring */
	${PREFIX} ._aiPanel { display: flex; flex-direction: column; gap: 10px; height: 100%; box-sizing: border-box; padding: 12px 14px; }
	${PREFIX} ._aiHistory { flex: 1; overflow: auto; display: flex; flex-direction: column; gap: 8px; padding: 2px; min-height: 120px; }
	${PREFIX} ._aiExamples { display: flex; flex-direction: column; gap: 6px; }
	${PREFIX} ._aiExample {
		text-align: left; border: 1px dashed ${border}; background: #fafbfc; border-radius: 8px;
		padding: 8px 10px; font-size: 12px; color: #555; cursor: pointer;
	}
	${PREFIX} ._aiExample:hover { background: #f2f6ff; border-color: #c7d2fe; }
	${PREFIX} ._aiMsg {
		padding: 8px 12px; border-radius: 10px; font-size: 13px; line-height: 1.5;
		max-width: 92%; white-space: pre-wrap; word-break: break-word;
	}
	${PREFIX} ._aiMsg._user { align-self: flex-end; background: #eef2ff; color: #3730a3; }
	${PREFIX} ._aiMsg._assistant { align-self: flex-start; background: #f3f4f6; color: #374151; }
	${PREFIX} ._aiMsg._aiLoading { color: #6b7280; font-style: italic; }
	${PREFIX} ._aiComposer { display: flex; flex-direction: column; gap: 8px; border-top: 1px solid ${line}; padding-top: 10px; }
	${PREFIX} ._aiInput {
		min-height: 72px; resize: vertical; border: 1px solid ${border}; border-radius: 8px;
		padding: 8px 10px; font-family: inherit; font-size: 13px;
	}
	${PREFIX} ._aiSend {
		align-self: flex-end; display: inline-flex; align-items: center; gap: 6px;
		background: #4338ca; color: #fff; border: none; border-radius: 8px;
		padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer;
	}
	${PREFIX} ._aiSend:disabled { opacity: 0.5; cursor: default; }

	/* Monaco loads its editor CSS from a CDN; before/if that CSS applies, its internal input
	   textareas (.inputarea / .ime-text-area) fall back to the browser default border + resize
	   handle and show as stray boxes over the code. Force them inert so that never happens,
	   regardless of CSS load timing. These elements only need to receive keystrokes. */
	${PREFIX} .monaco-editor textarea,
	${PREFIX} .monaco-editor .inputarea,
	${PREFIX} .monaco-editor .ime-text-area {
		border: 0 !important;
		outline: 0 !important;
		resize: none !important;
		box-shadow: none !important;
		background: transparent !important;
		padding: 0 !important;
		margin: 0 !important;
	}

	/* ---- Look & feel refresh ---- */
	${PREFIX} ._teToolbar { background: #fbfbfd; }
	${PREFIX} ._teType, ${PREFIX} ._teTypeChip {
		display: inline-flex; align-items: center; gap: 6px;
		padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 600;
		background: #eef2ff; color: #4338ca; border: 1px solid #e0e7ff;
	}
	${PREFIX} ._teTypeChip i { font-size: 12px; }

	/* Side panels */
	${PREFIX} ._panel { display: flex; flex-direction: column; gap: 12px; height: 100%; }
	${PREFIX} ._panelHint { font-size: 12px; color: #6b7280; line-height: 1.5; margin: 0; }
	${PREFIX} ._panelError { color: #b91c1c; font-size: 12px; background: #fef2f2; padding: 6px 8px; border-radius: 4px; }
	${PREFIX} ._muted { color: #9ca3af; font-size: 12px; }

	/* Segmented control */
	${PREFIX} ._segmented { display: inline-flex; background: #f3f4f6; border-radius: 8px; padding: 3px; gap: 2px; }
	${PREFIX} ._segmented button {
		border: none; background: transparent; padding: 6px 14px; border-radius: 6px;
		font-size: 12px; cursor: pointer; color: #6b7280; font-weight: 500;
	}
	${PREFIX} ._segmented button._on { background: #fff; color: #111827; box-shadow: 0 1px 2px rgba(0,0,0,0.08); }

	${PREFIX} ._modeBody { display: flex; flex-direction: column; gap: 8px; flex: 1; min-height: 0; }

	/* Fields */
	${PREFIX} ._fld {
		width: 100%; padding: 8px 10px; border: 1px solid ${border}; border-radius: 6px;
		font-size: 13px; background: #fff; box-sizing: border-box;
	}
	${PREFIX} ._fld:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
	${PREFIX} ._kvRow { display: flex; gap: 6px; align-items: center; }
	${PREFIX} ._kvRow ._fld { flex: 1; }
	${PREFIX} ._fldType { flex: 0 0 110px; }

	/* Buttons */
	${PREFIX} ._addBtn {
		align-self: flex-start; display: inline-flex; align-items: center; gap: 6px;
		padding: 6px 12px; border: 1px dashed ${border}; border-radius: 6px; background: #fff;
		cursor: pointer; font-size: 12px; color: #4b5563;
	}
	${PREFIX} ._addBtn:hover { border-color: #6366f1; color: #4338ca; }
	${PREFIX} ._iconBtn { border: none; background: transparent; cursor: pointer; color: #9ca3af; padding: 6px; }
	${PREFIX} ._iconBtn:hover { color: #ef4444; }
	${PREFIX} ._ghostBtn {
		display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border: 1px solid ${border};
		border-radius: 5px; background: #fff; cursor: pointer; font-size: 12px; color: #4b5563;
	}
	${PREFIX} ._ghostBtn:hover { border-color: #6366f1; color: #4338ca; }

	/* Field summary + nested note */
	${PREFIX} ._fieldSummary { display: flex; flex-direction: column; gap: 4px; }
	${PREFIX} ._fieldRow { display: flex; justify-content: space-between; padding: 5px 8px; background: #f9fafb; border-radius: 4px; font-size: 12px; }
	${PREFIX} ._fieldRow code { font-family: monospace; color: #111827; }
	${PREFIX} ._nestedNote { font-style: italic; }

	/* JSON editor box */
	${PREFIX} ._jsonBox { flex: 1; min-height: 240px; border: 1px solid ${border}; border-radius: 6px; overflow: hidden; }

	/* Part toolbar actions */
	${PREFIX} ._partToolbarActions { display: flex; align-items: center; gap: 8px; }

	/* Softer preview divider + editable subject line */
	${PREFIX} ._previewToolbar { border-bottom: 1px solid ${line}; }
	${PREFIX} ._subjectLine {
		display: flex; align-items: center; gap: 10px; padding: 9px 14px;
		border-bottom: 1px solid ${line}; background: #fff;
	}
	${PREFIX} ._subjectLine span { font-size: 11px; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.04em; }
	${PREFIX} ._subjectLine input {
		flex: 1; border: none; outline: none; font-size: 14px; font-weight: 600; color: #111827; background: transparent;
	}

	/* Embedded schema builder (Custom variables) */
	${PREFIX} ._schemaBuilderBox { overflow: auto; }
	${PREFIX} ._schemaBuilderBox .comp.compSchemaBuilder { padding: 0; }
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TemplateEditorCss">{css}</style>;
}
