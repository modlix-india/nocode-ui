/**
 * Pictures added to the markdown editor: where they are uploaded, and how a
 * secured one is shown. A secured file needs the sign-in token, which a plain
 * `<img src>` cannot send, so the editor and the markdown view both fetch it.
 */

import axios from 'axios';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { createRoot, Root } from 'react-dom/client';
import { pastedFilesUploadUrl, uploadPastedFile } from '../uploadPastedFile';
import { parseTextLine } from '../../../commonComponents/Markdown/parseTextLine';
import { makeRefsAndRemove } from '../../../commonComponents/Markdown/utils';
import { SecureImg } from '../../util/useSecureSrc';
import secureImage from '../../util/secureImage';

jest.mock('axios');
jest.mock('../../../context/StoreContext', () => ({
	getDataFromPath: () => 'Bearer test-token',
	UrlDetailsExtractor: { getForContext: () => ({}) },
	PageStoreExtractor: { getForContext: () => ({}) },
}));
jest.mock('../../util/secureImage', () => {
	const actual = jest.requireActual('../../util/secureImage');
	return { __esModule: true, ...actual, default: jest.fn() };
});

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedSecureImage = secureImage as jest.MockedFunction<typeof secureImage>;

const SECURED = 'api/files/secured/file/SYSTEM/loopzump/items/pasted_abc_.png';
const STATIC = 'api/files/static/file/SYSTEM/mdPastedFiles/pasted_abc_.png';

beforeEach(() => jest.clearAllMocks());

describe('upload url', () => {
	test('static is the default, under /mdPastedFiles', () => {
		expect(pastedFilesUploadUrl(undefined, undefined)).toBe('/api/files/static/mdPastedFiles');
		expect(pastedFilesUploadUrl('STATIC', '/notes/')).toBe('/api/files/static/notes');
	});

	test('secured goes to the secured files api', () => {
		expect(pastedFilesUploadUrl('SECURED', 'loopzump/items/')).toBe(
			'/api/files/secured/loopzump/items',
		);
		expect(pastedFilesUploadUrl('SECURED', '/loopzump/items/01ABC')).toBe(
			'/api/files/secured/loopzump/items/01ABC',
		);
	});
});

describe('uploadPastedFile', () => {
	test('posts the file with the sign-in token and returns the stored url', async () => {
		mockedAxios.post.mockResolvedValue({ data: { url: SECURED } } as any);
		const file = new File(['x'], 'shot.png', { type: 'image/png' });
		const url = await uploadPastedFile(file, 'SECURED', 'loopzump/items');
		expect(url).toBe(SECURED);
		const [endpoint, body, config] = mockedAxios.post.mock.calls[0];
		expect(endpoint).toBe('/api/files/secured/loopzump/items');
		expect((body as FormData).get('file')).toBeInstanceOf(File);
		expect(String((body as FormData).get('name'))).toMatch(/^pasted_.+_$/);
		expect((config as any).headers.Authorization).toBe('Bearer test-token');
	});

	test('fails when the server returns no url, so no broken picture is kept', async () => {
		mockedAxios.post.mockResolvedValue({ data: {} } as any);
		const file = new File(['x'], 'shot.png', { type: 'image/png' });
		await expect(uploadPastedFile(file, 'STATIC', undefined)).rejects.toThrow();
	});
});

describe('SecureImg', () => {
	let container: HTMLDivElement;
	let root: Root;

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
		root = createRoot(container);
	});

	afterEach(() => {
		act(() => root.unmount());
		container.remove();
	});

	test('a secured picture is fetched and shown from the blob url', async () => {
		mockedSecureImage.mockResolvedValue('blob:fake-1');
		await act(async () => {
			root.render(<SecureImg src={SECURED} alt="shot" width="300" />);
		});
		const img = container.querySelector('img')!;
		expect(mockedSecureImage).toHaveBeenCalledWith(SECURED);
		expect(img.getAttribute('src')).toBe('blob:fake-1');
		expect(img.getAttribute('width')).toBe('300');
	});

	test('a static picture keeps its url and is not fetched', async () => {
		await act(async () => {
			root.render(<SecureImg src={STATIC} alt="shot" />);
		});
		expect(mockedSecureImage).not.toHaveBeenCalled();
		expect(container.querySelector('img')!.getAttribute('src')).toBe(STATIC);
	});
});

describe('markdown view', () => {
	function images(text: string): React.ReactElement[] {
		const lines = text.split('\n');
		const { footNoteRefs, urlRefs } = makeRefsAndRemove(lines);
		const { comp } = parseTextLine({
			componentKey: 'k',
			lines,
			lineNumber: 0,
			styles: {},
			footNotes: { currentRefNumber: 0, footNoteRefs },
			urlRefs,
			location: { pathname: '/item/1' } as any,
		} as any);
		const out: React.ReactElement[] = [];
		const walk = (n: any) => {
			if (!n || typeof n !== 'object') return;
			if (Array.isArray(n)) return n.forEach(walk);
			if (n.type === 'img' || n.type === SecureImg) out.push(n);
			walk(n.props?.children);
		};
		walk(comp);
		return out;
	}

	test('a secured picture renders through SecureImg and keeps its size', () => {
		const [img] = images(`![image.png](${SECURED}){width="1236" height="1343"}`);
		expect(img.type).toBe(SecureImg);
		expect((img.props as any).width).toBe('1236');
		expect((img.props as any).height).toBe('1343');
		expect((img.props as any).src).toContain('api/files/secured/file/SYSTEM/loopzump/items');
	});

	test('a sized picture still fits a narrow column', () => {
		const [img] = images(`![image.png](${SECURED}){width="1236" height="1343"}`);
		expect((img.props as any).style).toEqual({ maxWidth: '100%', height: 'auto' });
		const [plain] = images(`![image.png](${STATIC})`);
		expect((plain.props as any).style).toBeUndefined();
	});

	test('a static picture is still a plain img', () => {
		const [img] = images(`![image.png](${STATIC}){width="10" height="20"}`);
		expect(img.type).toBe('img');
		expect((img.props as any).width).toBe('10');
	});
});
