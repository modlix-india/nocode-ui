import { withLeadingSlash } from '../LazyFileBrowser';

describe('FileBrowser start location', () => {
	test('adds the missing leading slash', () => {
		expect(withLeadingSlash('eventtracker/invitationDesign')).toBe('/eventtracker/invitationDesign');
	});
	test('keeps a location that has one, and empty ones', () => {
		expect(withLeadingSlash('/eventtracker')).toBe('/eventtracker');
		expect(withLeadingSlash('/')).toBe('/');
		expect(withLeadingSlash(undefined)).toBeUndefined();
		expect(withLeadingSlash('')).toBe('');
	});
});
