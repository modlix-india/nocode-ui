import { ComponentProperty } from '../../types/common';

/**
 * Whether the connection is bound to something not yet resolved. An empty connection means "the
 * agent's own", so starting early would start twice once the binding resolves.
 *
 * Read from the raw definition: a blank property has no `location`. A binding that stays empty
 * (including `''`, which bypasses `getData`'s fallback) deliberately never starts the phone.
 */
export function awaitingConnectionBinding(
	property: ComponentProperty<string> | undefined,
	resolved: string | undefined,
): boolean {
	if (resolved) return false;

	const location = property?.location;
	if (!location) return false;

	return location.type === 'EXPRESSION'
		? !!location.expression?.trim()
		: !!location.value?.trim();
}
