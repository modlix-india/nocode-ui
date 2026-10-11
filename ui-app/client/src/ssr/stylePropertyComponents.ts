/**
 * The components whose style properties live in `/styleProperties/<Name>.json` instead of the
 * bundle, and which of them a page needs before its first render.
 *
 * One rule for both sides of a hydrated page: the server render loads exactly these and the
 * browser preloads exactly these before `hydrateRoot`. Loading more on either side changes that
 * side's style output (AppStyle renders a component's style block whenever its properties are
 * present), and hydration then throws the whole tree away.
 */
export const EXTERNAL_STYLE_PROPERTY_COMPONENTS = new Set([
	'Audio',
	'Button',
	'Calendar',
	'ColorPicker',
	'Dropdown',
	'FileUpload',
	'Menu',
	'Otp',
	'PhoneNumber',
	'Stepper',
	'Table',
	'TableColumn',
	'TableColumnHeader',
	'TableColumns',
	'TableEmptyGrid',
	'TableGrid',
	'TablePreviewGrid',
	'TableRow',
	'TextArea',
	'TextBox',
	'Tree',
	'Video',
]);

/** The external style-property components a page definition uses, sorted. */
export function stylePropertyComponentsFor(pageDefinition: any): string[] {
	const types = new Set<string>();
	for (const c of Object.values(pageDefinition?.componentDefinition ?? {}) as any[])
		if (EXTERNAL_STYLE_PROPERTY_COMPONENTS.has(c?.type)) types.add(c.type);
	return [...types].sort();
}
