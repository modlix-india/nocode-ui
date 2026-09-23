import { fileSelectorStoredValue } from '../storedValue';

jest.mock('../../util/getSrcUrl', () => ({
	__esModule: true,
	// No CDN configured, which is the local and the common case: getSrcUrl hands
	// its input back and the page's own origin becomes the floor.
	default: (url: string) => url,
}));

const ORIGIN = 'https://site.example';

/** What the upload endpoint actually answers with. */
const uploadResponse = {
	url: 'api/files/static/file/SYSTEM/crumbco/global/favicon.png',
	directory: false,
	name: 'favicon.png',
	size: 4096,
};

describe('what a FileSelector writes to its binding', () => {
	// The bug this exists to stop coming back: uploading stored the whole
	// response object, so `properties.links.<key>.href` held `{url, directory,
	// name, size}` where every reader wants a string. Browsing stored a string
	// from the same component, so the shape depended on the design type.
	it('stores only the url when a file is uploaded', () => {
		expect(fileSelectorStoredValue(uploadResponse, false, ORIGIN)).toBe(
			'api/files/static/file/SYSTEM/crumbco/global/favicon.png',
		);
	});

	it('stores the same string when a file is browsed to', () => {
		const browsed = 'api/files/static/file/SYSTEM/crumbco/global/favicon.png';
		expect(fileSelectorStoredValue(browsed, false, ORIGIN)).toBe(browsed);
	});

	it('agrees between browsing and uploading', () => {
		expect(fileSelectorStoredValue(uploadResponse, false, ORIGIN)).toBe(
			fileSelectorStoredValue(uploadResponse.url, false, ORIGIN),
		);
	});
});

describe('fullUrl', () => {
	it('makes the path absolute against this page origin', () => {
		expect(fileSelectorStoredValue(uploadResponse, true, ORIGIN)).toBe(
			`${ORIGIN}/api/files/static/file/SYSTEM/crumbco/global/favicon.png`,
		);
	});

	it('does not double the slash on a path that already has one', () => {
		expect(fileSelectorStoredValue('/api/files/x.png', true, ORIGIN)).toBe(
			`${ORIGIN}/api/files/x.png`,
		);
	});

	it('leaves an already-absolute url alone', () => {
		const absolute = 'https://cdn.example/files/x.png';
		expect(fileSelectorStoredValue(absolute, true, ORIGIN)).toBe(absolute);
	});

	it('still stores a string, not an object', () => {
		expect(typeof fileSelectorStoredValue(uploadResponse, true, ORIGIN)).toBe('string');
	});
});

describe('values that are not a file', () => {
	// Clearing a selection writes undefined; that must pass through rather than
	// become an empty string, which would leave a key behind holding ''.
	it.each([undefined, null, ''])('passes %p through untouched', value => {
		expect(fileSelectorStoredValue(value, false, ORIGIN)).toBe(value);
	});

	it('hands back an object with no url rather than emptying the binding', () => {
		const odd = { directory: true };
		expect(fileSelectorStoredValue(odd, false, ORIGIN)).toBe(odd);
	});
});
