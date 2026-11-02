import { downloadName, handleSecuredLinkClick } from '../openSecuredFile';

jest.mock('../secureImage', () => ({
	__esModule: true,
	default: jest.fn(() => Promise.resolve('blob:x')),
	isSecuredUrl: (url: string | undefined) => !!url && url.includes('api/files/secured'),
}));

const SECURED = '/api/files/secured/file/SYSTEM/loopzump/items/new/1/pasted_ab12_.pdf';

function click(
	over: Partial<{ metaKey: boolean; ctrlKey: boolean; button: number; editing: boolean }> = {},
) {
	const host = document.createElement('div');
	if (over.editing) host.setAttribute('contenteditable', 'true');
	const a = document.createElement('a');
	host.appendChild(a);
	return {
		preventDefault: jest.fn(),
		stopPropagation: jest.fn(),
		metaKey: !!over.metaKey,
		ctrlKey: !!over.ctrlKey,
		button: over.button ?? 0,
		currentTarget: a,
	};
}

describe('downloadName', () => {
	it('keeps the link text and adds the stored extension when missing', () => {
		expect(downloadName(SECURED, 'Spec v2')).toBe('Spec v2.pdf');
		expect(downloadName(SECURED, 'Spec v2.pdf')).toBe('Spec v2.pdf');
		expect(downloadName(SECURED)).toBe('pasted_ab12_.pdf');
	});
});

describe('handleSecuredLinkClick', () => {
	beforeEach(() => {
		jest.spyOn(window, 'open').mockReturnValue(null);
	});
	afterEach(() => jest.restoreAllMocks());

	it('leaves links that are not secured files alone', () => {
		const e = click();
		expect(handleSecuredLinkClick(e, 'https://example.com/a.pdf')).toBe(false);
		expect(e.preventDefault).not.toHaveBeenCalled();
	});

	it('opens a secured file on a plain click outside an editor', () => {
		const e = click();
		expect(handleSecuredLinkClick(e, SECURED, 'Spec')).toBe(true);
		expect(e.preventDefault).toHaveBeenCalled();
		expect(window.open).toHaveBeenCalledWith('', '_blank');
	});

	it('lets a plain click inside an editor place the caret, Cmd click opens', () => {
		expect(handleSecuredLinkClick(click({ editing: true }), SECURED)).toBe(false);
		expect(handleSecuredLinkClick(click({ editing: true, metaKey: true }), SECURED)).toBe(true);
	});

	it('ignores middle clicks', () => {
		expect(handleSecuredLinkClick(click({ button: 1 }), SECURED)).toBe(false);
	});
});
