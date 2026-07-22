// Pure decision logic for the Template Editor's editor-mode (Code vs Visual) and active-language.
//
// The editor is bound to a Template that arrives asynchronously from the page store, and in dev the
// component's state survives Fast Refresh across edits. So the mode decision must be SELF-HEALING,
// not edge-triggered: given the current facts it must always be able to correct a wrong mode, never
// depend on having observed a one-time "content just arrived" transition (which a preserved ref or a
// hot-reload can silently consume, leaving the editor stuck). Keeping the rules here (free of React
// and the DOM) lets us test every branch deterministically.

import { getPartValue } from './templateTypes';

// 'visual' and 'code' are the auto-decidable content modes; 'ai' is a user-only prompt mode that the
// auto-decision never selects (it only ever recovers to visual/code — see decideMode).
export type EditorMode = 'visual' | 'code' | 'ai';

export function partHasDesign(template: any, lang: string, part: string): boolean {
	return (template?.design?.[lang]?.[part]?.length ?? 0) > 0;
}

export function partHasHtml(template: any, lang: string, part: string): boolean {
	return !!getPartValue(template, lang, part);
}

// The mode a target should open in: hand-authored HTML with no block design opens in Code (the
// visual block editor cannot reconstruct arbitrary markup); anything else defaults to Visual.
export function preferredMode(hasHtml: boolean, hasDesign: boolean): EditorMode {
	return hasHtml && !hasDesign ? 'code' : 'visual';
}

export interface ModeDecisionInput {
	targetKey: string; // `${type}|${lang}|${part}` — the thing being edited
	prevTargetKey: string; // the target we last auto-decided for
	currentMode: EditorMode; // the mode the editor is showing right now
	userPicked: boolean; // has the user manually toggled mode for this target
	hasHtml: boolean;
	hasDesign: boolean;
}

export interface ModeDecision {
	mode?: EditorMode; // caller should setMode(...) when present
	targetChanged: boolean; // caller should adopt targetKey + reset user-override + selection
}

// Decide the editor mode from current facts (no persisted edge state):
//   • New target (type/lang/part changed): adopt the content's preferred mode and let the caller
//     clear any user override + block selection.
//   • Same target, no user override, stuck in Visual while the part is raw HTML: heal to Code —
//     the block editor can't hold arbitrary markup, so Visual is simply wrong here. This is the
//     branch that recovers from an async load or a Fast-Refresh-preserved stale mode.
//   • Never force the other direction on the same target: clearing a field mid-edit or an explicit
//     Visual choice must be preserved.
export function decideMode(input: ModeDecisionInput): ModeDecision {
	const preferred = preferredMode(input.hasHtml, input.hasDesign);
	if (input.prevTargetKey !== input.targetKey) {
		return { targetChanged: true, mode: preferred !== input.currentMode ? preferred : undefined };
	}
	if (!input.userPicked && input.currentMode === 'visual' && preferred === 'code') {
		return { targetChanged: false, mode: 'code' };
	}
	return { targetChanged: false };
}

// The language to display: follow the loaded template's default language (or, lacking one, its first
// authored language) until the user explicitly picks a language in the toolbar. Without this a
// template whose parts live under a non-default/non-'en' language would open showing an empty editor.
export function followLanguage(template: any, currentLang: string, userPicked: boolean): string {
	if (userPicked || !template) return currentLang;
	const def = template.defaultLanguage || Object.keys(template.templateParts ?? {})[0];
	return def && def !== currentLang ? def : currentLang;
}
