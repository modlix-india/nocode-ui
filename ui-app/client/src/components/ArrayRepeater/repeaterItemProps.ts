/**
 * The focus attributes of one repeated item's wrapper. By default every item is a Tab stop announced as a
 * button (the old behaviour). With the opt-in `plainItems` property the wrapper is a plain container: no Tab
 * stop and no role, so an item that holds its own buttons or links is not a button inside a button, and an
 * item that renders nothing is not an invisible, nameless Tab stop.
 */
export function repeaterItemProps(plainItems: boolean | undefined): Record<string, any> {
	if (plainItems) return {};
	return { tabIndex: 0, role: 'button', onKeyDown: () => {} };
}
