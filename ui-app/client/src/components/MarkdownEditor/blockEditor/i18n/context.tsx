// ============================================================
// Editor i18n — React context, provider, and hook.
// ============================================================

import React, { createContext, useContext, useMemo } from 'react';
import {
	defaultEditorTranslations,
	makeStaticT,
	type EditorTFunction,
	type EditorTranslations,
} from './keys';

const EditorI18nContext = createContext<EditorTFunction | null>(null);

export interface EditorI18nProviderProps {
	/** Host-supplied translation function. Takes priority over `translations`. */
	t?: EditorTFunction;
	/** Static map of overrides; missing keys fall back to English. */
	translations?: Partial<EditorTranslations>;
	children: React.ReactNode;
}

export function EditorI18nProvider({
	t,
	translations,
	children,
}: Readonly<EditorI18nProviderProps>) {
	const value = useMemo<EditorTFunction>(() => {
		if (t) return t;
		return makeStaticT(translations);
	}, [t, translations]);
	return <EditorI18nContext.Provider value={value}>{children}</EditorI18nContext.Provider>;
}

/** Access the editor's translation function. Falls back to English defaults
 *  if no provider is mounted, so individual feature components stay usable
 *  outside the main editor (e.g. `<SlashCommandMenu>` rendered standalone). */
export function useT(): EditorTFunction {
	const ctx = useContext(EditorI18nContext);
	if (ctx) return ctx;
	return defaultT;
}

const defaultT: EditorTFunction = (key, vars) => {
	const raw = defaultEditorTranslations[key];
	if (!vars) return raw;
	return raw.replaceAll(/\{\{(\w+)\}\}/g, (_, k) => {
		const v = vars[k];
		return v === undefined ? `{{${k}}}` : String(v);
	});
};
