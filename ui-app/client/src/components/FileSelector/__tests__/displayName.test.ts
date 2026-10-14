import { fileSelectorDisplayName } from '../storedValue';

jest.mock('../../util/getSrcUrl', () => ({ __esModule: true, default: (url: string) => url }));

const BASE = 'api/files/secured/file/FIN/deals/42/';

describe('the name a FileSelector shows', () => {
	it('decodes the form-encoded url segment the files service hands out', () => {
		expect(fileSelectorDisplayName(BASE + 'download+%284%29.pdf', BASE + 'download+%284%29.pdf')).toBe(
			'download (4).pdf',
		);
	});

	it('keeps a literal plus, which the service encodes as %2B', () => {
		const url = BASE + 'a%2Bb+c.png';
		expect(fileSelectorDisplayName(url, url)).toBe('a+b c.png');
	});

	it('prefers the name an upload response carries', () => {
		const value = { url: BASE + 'x+%281%29.pdf', name: 'x (1).pdf' };
		expect(fileSelectorDisplayName(value, value.url)).toBe('x (1).pdf');
	});

	it('falls back to the url when the object has no name', () => {
		const value = { url: BASE + 'report+v2.pdf' };
		expect(fileSelectorDisplayName(value, value.url)).toBe('report v2.pdf');
	});

	it('shows a segment that is not valid percent encoding as it is', () => {
		const url = BASE + '50%off.pdf';
		expect(fileSelectorDisplayName(url, url)).toBe('50%off.pdf');
	});

	it('ignores a query string', () => {
		const url = BASE + 'my+file.pdf?download=true';
		expect(fileSelectorDisplayName(url, url)).toBe('my file.pdf');
	});

	it('is empty for no url', () => {
		expect(fileSelectorDisplayName('', '')).toBe('');
	});
});
