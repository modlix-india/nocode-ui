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

/** Every component type the given page definitions use, sorted. */
export function componentTypesFor(...pageDefinitions: any[]): string[] {
	const types = new Set<string>();
	for (const pageDefinition of pageDefinitions)
		for (const c of Object.values(pageDefinition?.componentDefinition ?? {}) as any[])
			if (typeof c?.type === 'string' && c.type) types.add(c.type);
	return [...types].sort((a, b) => a.localeCompare(b));
}

/** The external style-property components the given page definitions use, sorted. */
export function stylePropertyComponentsFor(...pageDefinitions: any[]): string[] {
	return componentTypesFor(...pageDefinitions).filter(t =>
		EXTERNAL_STYLE_PROPERTY_COMPONENTS.has(t),
	);
}

/**
 * The shell a page is drawn in, or undefined: the application's `shellPageDefinition` unless the
 * page opts out with `wrapShell: false`.
 */
export function shellDefinitionFor(application: any, pageDefinition: any): any {
	if (pageDefinition?.properties?.wrapShell === false) return undefined;
	return application?.properties?.shellPageDefinition;
}
