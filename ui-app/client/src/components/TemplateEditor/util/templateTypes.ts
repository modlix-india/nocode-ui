// Template type + part model for the Template Editor.
//
// A backend Template stores content as templateParts[language][partName] = string, rendered with
// FreeMarker. Different template types read different parts (e.g. email uses subject+body, pdf uses
// body). This module declares, per type, which parts exist and how each should be edited/previewed.

export type TemplateTypeKey = 'email' | 'pdf' | 'inapp' | 'whatsapp' | 'sms';

export type PartEditorKind = 'text' | 'html' | 'expression';
export type PreviewFormat = 'html' | 'pdf' | 'text';

export interface TemplatePartDef {
	key: string;
	label: string;
	editor: PartEditorKind;
	placeholder?: string;
}

export interface TemplateTypeDef {
	key: TemplateTypeKey;
	displayName: string;
	parts: TemplatePartDef[];
	previewFormat: PreviewFormat;
	// The part that renders as the visual preview body.
	previewPart: string;
	// If set, this part is edited inline in the preview's subject line (not as a tab).
	subjectKey?: string;
}

export const TEMPLATE_TYPES: Record<TemplateTypeKey, TemplateTypeDef> = {
	email: {
		key: 'email',
		displayName: 'Email',
		parts: [{ key: 'body', label: 'Body', editor: 'html' }],
		previewFormat: 'html',
		previewPart: 'body',
		subjectKey: 'subject',
	},
	pdf: {
		key: 'pdf',
		displayName: 'PDF',
		parts: [
			{
				key: 'body',
				label: 'Body (HTML)',
				editor: 'html',
				placeholder:
					'<html><head><style>@page { size: A4; margin: 20mm; }</style></head><body>...</body></html>',
			},
		],
		previewFormat: 'pdf',
		previewPart: 'body',
	},
	inapp: {
		key: 'inapp',
		displayName: 'In-App',
		parts: [
			{ key: 'title', label: 'Title', editor: 'text' },
			{ key: 'url', label: 'URL', editor: 'text' },
			{ key: 'body', label: 'Body', editor: 'html' },
		],
		previewFormat: 'html',
		previewPart: 'body',
	},
	whatsapp: {
		key: 'whatsapp',
		displayName: 'WhatsApp',
		parts: [{ key: 'body', label: 'Message', editor: 'text' }],
		previewFormat: 'text',
		previewPart: 'body',
	},
	sms: {
		key: 'sms',
		displayName: 'SMS',
		parts: [{ key: 'body', label: 'Message', editor: 'text' }],
		previewFormat: 'text',
		previewPart: 'body',
	},
};

export const TEMPLATE_TYPE_LIST: TemplateTypeDef[] = Object.values(TEMPLATE_TYPES);

export const DEFAULT_TEMPLATE_TYPE: TemplateTypeKey = 'email';

export function isTemplateTypeKey(v: any): v is TemplateTypeKey {
	return typeof v === 'string' && !!TEMPLATE_TYPES[v as TemplateTypeKey];
}

// Resolve the active type: the template's own field wins, else the (optional) locked/default type.
export function resolveTemplateType(template: any, fallback?: string): TemplateTypeKey {
	if (isTemplateTypeKey(template?.templateType)) return template.templateType;
	if (isTemplateTypeKey(fallback)) return fallback;
	return DEFAULT_TEMPLATE_TYPE;
}

export function getPartValue(template: any, lang: string, part: string): string {
	return template?.templateParts?.[lang]?.[part] ?? '';
}

// Immutably set a single part value, returning a new template object.
export function setPartValue(template: any, lang: string, part: string, value: string): any {
	const next = { ...(template ?? {}) };
	const parts = { ...(next.templateParts ?? {}) };
	const langParts = { ...(parts[lang] ?? {}) };
	langParts[part] = value;
	parts[lang] = langParts;
	next.templateParts = parts;
	return next;
}

// Languages already present in the template, always including the default and 'en'.
export function getTemplateLanguages(template: any): string[] {
	const set = new Set<string>();
	if (template?.defaultLanguage) set.add(template.defaultLanguage);
	Object.keys(template?.templateParts ?? {}).forEach(l => set.add(l));
	if (set.size === 0) set.add('en');
	return Array.from(set);
}
