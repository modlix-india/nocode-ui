import { fileSelectorStoredValue, STORE_FILE_OBJECT, STORE_URL } from '../storedValue';

jest.mock('../../util/getSrcUrl', () => ({
	__esModule: true,
	// No CDN configured, which is the local and the common case: getSrcUrl hands
	// its input back and the page's own origin becomes the floor.
	default: (url: string) => url,
}));

const ORIGIN = 'https://site.example';
const PATH = 'api/files/static/file/SYSTEM/crumbco/global/favicon.png';

/** What the upload endpoint actually answers with. */
const uploadResponse = {
	url: PATH,
	directory: false,
	name: 'favicon.png',
	size: 4096,
};

describe('the file object shape', () => {
	// The default, and what the upload design type has always written. A page
	// that wants the name or the size of what was uploaded reads them here.
	it('keeps the whole upload response', () => {
		expect(fileSelectorStoredValue(uploadResponse, STORE_FILE_OBJECT, false, ORIGIN)).toBe(
			uploadResponse,
		);
	});

	it('stores the string that browsing produced, having no object to keep', () => {
		expect(fileSelectorStoredValue(PATH, STORE_FILE_OBJECT, false, ORIGIN)).toBe(PATH);
	});

	it('is what an unset property falls back to', () => {
		expect(
			fileSelectorStoredValue(uploadResponse, undefined as any, false, ORIGIN),
		).toBe(uploadResponse);
	});
});

describe('the url shape', () => {
	// The bug this exists to stop coming back: a favicon is
	// `properties.links.<key>.href`, a manifest icon is `src`, an image is
	// `src` - each of them a string. An upload put an object there and the page
	// had to unwrap it itself one step later.
	it('flattens an upload response to its url', () => {
		expect(fileSelectorStoredValue(uploadResponse, STORE_URL, false, ORIGIN)).toBe(PATH);
	});

	it('agrees between browsing and uploading', () => {
		expect(fileSelectorStoredValue(uploadResponse, STORE_URL, false, ORIGIN)).toBe(
			fileSelectorStoredValue(PATH, STORE_URL, false, ORIGIN),
		);
	});

	it('still stores a string when the url is made absolute', () => {
		expect(typeof fileSelectorStoredValue(uploadResponse, STORE_URL, true, ORIGIN)).toBe(
			'string',
		);
	});
});

describe('fullUrl', () => {
	it('makes the path absolute against this page origin', () => {
		expect(fileSelectorStoredValue(uploadResponse, STORE_URL, true, ORIGIN)).toBe(
			`${ORIGIN}/${PATH}`,
		);
	});

	it('does not double the slash on a path that already has one', () => {
		expect(fileSelectorStoredValue('/api/files/x.png', STORE_URL, true, ORIGIN)).toBe(
			`${ORIGIN}/api/files/x.png`,
		);
	});

	it('leaves an already-absolute url alone', () => {
		const absolute = 'https://cdn.example/files/x.png';
		expect(fileSelectorStoredValue(absolute, STORE_URL, true, ORIGIN)).toBe(absolute);
	});

	// The two properties are independent: asking for an absolute url must not
	// cost you the name and the size that the file object carries.
	it('rewrites the url key of a file object and leaves the rest alone', () => {
		expect(fileSelectorStoredValue(uploadResponse, STORE_FILE_OBJECT, true, ORIGIN)).toEqual({
			...uploadResponse,
			url: `${ORIGIN}/${PATH}`,
		});
	});

	it('does not mutate the value it was handed', () => {
		fileSelectorStoredValue(uploadResponse, STORE_FILE_OBJECT, true, ORIGIN);
		expect(uploadResponse.url).toBe(PATH);
	});
});

describe('values that are not a file', () => {
	// Clearing a selection writes undefined; that must pass through rather than
	// become an empty string, which would leave a key behind holding ''.
	it.each([undefined, null, ''])('passes %p through untouched', value => {
		expect(fileSelectorStoredValue(value, STORE_URL, false, ORIGIN)).toBe(value);
		expect(fileSelectorStoredValue(value, STORE_FILE_OBJECT, true, ORIGIN)).toBe(value);
	});

	it('hands back an object with no url rather than emptying the binding', () => {
		const odd = { directory: true };
		expect(fileSelectorStoredValue(odd, STORE_URL, false, ORIGIN)).toBe(odd);
		expect(fileSelectorStoredValue(odd, STORE_URL, true, ORIGIN)).toBe(odd);
	});
});
