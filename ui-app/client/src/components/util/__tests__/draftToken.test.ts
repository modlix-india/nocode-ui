import axios from 'axios';
import { extendDraftToken, heartbeatDelay, mintDraftToken, previewSrc } from '../draftToken';
import { getDataFromPath } from '../../../context/StoreContext';

jest.mock('axios');
jest.mock('../../../context/StoreContext', () => ({
	getDataFromPath: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedGet = getDataFromPath as jest.Mock;

beforeEach(() => {
	jest.clearAllMocks();
	mockedAxios.post = jest.fn().mockResolvedValue({ data: { token: 'abc', host: 't-abc.modlix.com' } });
});

function headersOfCall(index: number) {
	return (mockedAxios.post as jest.Mock).mock.calls[index][2].headers;
}

describe('draft grant calls', () => {
	// The regression this guards: the token used to be captured once when the
	// editor mounted and reused for the whole session. The access token is good
	// for 30 minutes and the refresher revokes the old value when it rotates, so
	// the heartbeat started sending a dead token and every beat was answered 401
	// until the page was reloaded.
	it('reads the session token afresh on every call', async () => {
		mockedGet.mockReturnValueOnce('first');
		await mintDraftToken('someapp');

		mockedGet.mockReturnValueOnce('first');
		await extendDraftToken('abc');

		mockedGet.mockReturnValueOnce('rotated');
		await extendDraftToken('abc');

		expect(headersOfCall(0)).toEqual({ Authorization: 'first' });
		expect(headersOfCall(1)).toEqual({ Authorization: 'first' });
		expect(headersOfCall(2)).toEqual({ Authorization: 'rotated' });
	});

	it('sends no Authorization when there is no session', async () => {
		mockedGet.mockReturnValue(undefined);
		await mintDraftToken('someapp');
		expect(headersOfCall(0)).toBeUndefined();
	});

	it('returns undefined rather than throwing when a call is refused', async () => {
		mockedGet.mockReturnValue('tok');
		mockedAxios.post = jest.fn().mockRejectedValue(new Error('401'));
		jest.spyOn(console, 'error').mockImplementation(() => {});

		await expect(mintDraftToken('someapp')).resolves.toBeUndefined();
		await expect(extendDraftToken('abc')).resolves.toBeUndefined();
	});
});

describe('heartbeatDelay', () => {
	it('beats at half the remaining life, clamped at both ends', () => {
		const inMinutes = (m: number) => new Date(Date.now() + m * 60 * 1000).toISOString();

		expect(heartbeatDelay(inMinutes(10))).toBe(5 * 60 * 1000);
		// Clamped up: a grant with seconds left must not busy-beat.
		expect(heartbeatDelay(inMinutes(0.2))).toBe(30 * 1000);
		// Clamped down: a 30 minute grant beats every 10, not every 15.
		expect(heartbeatDelay(inMinutes(30))).toBe(10 * 60 * 1000);
		expect(heartbeatDelay(undefined)).toBe(5 * 60 * 1000);
	});
});

describe('previewSrc', () => {
	it('holds the frame back until the grant is resolved', () => {
		expect(previewSrc(undefined, '/app/client/page/x')).toBeUndefined();
		expect(previewSrc('', '/app/client/page/x')).toBe('/app/client/page/x');
		expect(previewSrc('https://t-abc.modlix.com', '/app/client/page/x')).toBe(
			'https://t-abc.modlix.com/app/client/page/x',
		);
		expect(previewSrc('https://t-abc.modlix.com', 'https://elsewhere.com/x')).toBe(
			'https://elsewhere.com/x',
		);
		expect(previewSrc('https://t-abc.modlix.com', '')).toBeUndefined();
	});
});
