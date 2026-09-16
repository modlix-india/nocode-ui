/**
 * Fetching a secured file for an `<img>`.
 *
 * This was a private helper inside `Image.tsx` that made one request and one
 * object URL per effect run and never revoked either, so a component rendering
 * the same image twice leaked two blobs and kept leaking one per re-render. The
 * chat needed the same behaviour for its attachments, which is what made a
 * second copy of it — and a second place to get the auth header wrong — worth
 * avoiding.
 */

import axios from 'axios';
import secureImage, { isSecuredUrl, revokeSecureImage } from '../secureImage';

jest.mock('axios');
jest.mock('../../../context/StoreContext', () => ({
	getDataFromPath: () => 'Bearer test-token',
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

const SECURED = '/api/files/secured/file/FIN/_withInClient/aichat/appbuilder/s1/t1/a.png';

beforeEach(() => {
	jest.clearAllMocks();
	let n = 0;
	(globalThis.URL.createObjectURL as any) = jest.fn(() => `blob:fake-${++n}`);
	(globalThis.URL.revokeObjectURL as any) = jest.fn();
});

afterEach(() => {
	revokeSecureImage(SECURED);
});

describe('isSecuredUrl', () => {
	it('recognises a secured path', () => {
		expect(isSecuredUrl(SECURED)).toBe(true);
	});

	it('leaves a static path alone — those are servable directly', () => {
		expect(isSecuredUrl('/api/files/static/file/FIN/app/hero.png')).toBe(false);
	});

	it('leaves a blob URL alone — nothing to fetch', () => {
		expect(isSecuredUrl('blob:https://x/abc')).toBe(false);
	});

	it('is false rather than throwing for nothing at all', () => {
		expect(isSecuredUrl(undefined)).toBe(false);
		expect(isSecuredUrl('')).toBe(false);
	});
});

describe('secureImage', () => {
	it('sends the auth token, because an <img src> cannot', () => {
		mockedAxios.get.mockResolvedValue({ data: new Blob() } as any);
		return secureImage(SECURED).then(() => {
			expect(mockedAxios.get).toHaveBeenCalledWith(
				SECURED,
				expect.objectContaining({
					responseType: 'blob',
					headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
				}),
			);
		});
	});

	it('fetches one blob per URL however many times it is asked', async () => {
		mockedAxios.get.mockResolvedValue({ data: new Blob() } as any);
		const [a, b, c] = await Promise.all([
			secureImage(SECURED),
			secureImage(SECURED),
			secureImage(SECURED),
		]);
		expect(mockedAxios.get).toHaveBeenCalledTimes(1);
		expect(globalThis.URL.createObjectURL).toHaveBeenCalledTimes(1);
		expect(a).toBe(b);
		expect(b).toBe(c);
	});

	it('revokes the blob when a caller says it is finished with', async () => {
		mockedAxios.get.mockResolvedValue({ data: new Blob() } as any);
		const url = await secureImage(SECURED);
		revokeSecureImage(SECURED);
		await Promise.resolve();
		expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith(url);
	});

	it('does not cache a failure, so the next render can try again', async () => {
		// A failure is usually the file having expired or been deleted, but it
		// is also what a dropped connection looks like, and those must not be
		// told apart by remembering the first one forever.
		mockedAxios.get.mockRejectedValueOnce(new Error('network error'));
		await expect(secureImage(SECURED)).rejects.toThrow('network error');

		mockedAxios.get.mockResolvedValue({ data: new Blob() } as any);
		await expect(secureImage(SECURED)).resolves.toMatch(/^blob:/);
		expect(mockedAxios.get).toHaveBeenCalledTimes(2);
	});

	it('revoking something it never fetched is harmless', () => {
		expect(() => revokeSecureImage('/never/seen')).not.toThrow();
	});
});
