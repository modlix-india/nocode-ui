import axios from 'axios';
import { dialTicket, fetchStatus, fetchToken } from '../api';

/**
 * That every softphone URL stays relative, and that the auth headers are read the right way.
 *
 * Both are one character away from a failure that blames the backend. A leading slash empties the
 * codes part the gateway reads the application from, so requests arrive scoped to whatever app the
 * hostname resolves to and a connection that exists in this app returns
 * `400 Connection with name … not found`. And `getData` in place of `getDataFromPath` returns
 * undefined for a path string, producing an unauthenticated request and a 401.
 */

jest.mock('axios', () => ({ get: jest.fn(), post: jest.fn() }));
jest.mock('../../context/StoreContext', () => ({
	getDataFromPath: jest.fn((path: string) =>
		path === 'LocalStore.AuthToken'
			? 'a-token'
			: path === 'Store.auth.loggedInClientCode'
				? 'SYSTEM'
				: undefined,
	),
}));

const get = axios.get as unknown as jest.Mock;
const post = axios.post as unknown as jest.Mock;

describe('softphone api', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		get.mockResolvedValue({ data: {} });
		post.mockResolvedValue({ data: {} });
	});

	it('calls every endpoint with a relative URL', async () => {
		await fetchStatus('exotel_connection');
		await fetchToken('exotel_connection');
		await dialTicket('501', 'exotel_connection');

		const urls = [...get.mock.calls, ...post.mock.calls].map(c => c[0] as string);

		expect(urls).toEqual([
			'api/message/call/browser/status',
			'api/message/call/browser/token',
			'api/entity/processor/calls/501/browser-dial',
		]);

		// The assertion that matters: not one of them may start with a slash.
		for (const url of urls) expect(url.startsWith('/')).toBe(false);
	});

	it('sends the auth token and client code on every call', async () => {
		await fetchStatus('exotel_connection');
		await fetchToken('exotel_connection');
		await dialTicket('501', 'exotel_connection');

		const configs = [get.mock.calls[0][1], post.mock.calls[0][2], post.mock.calls[1][2]];

		for (const config of configs)
			expect(config.headers).toEqual({ Authorization: 'a-token', clientCode: 'SYSTEM' });
	});

	it('asks for the cheap status read by default', async () => {
		await fetchStatus('exotel_connection');

		// verify=true makes the backend call the provider. That belongs behind a "test my phone"
		// control, not on every page load.
		expect(get.mock.calls[0][1].params).toEqual({
			connectionName: 'exotel_connection',
			verify: false,
		});
	});

	it('escapes the deal id rather than interpolating it raw', async () => {
		await dialTicket('a/b 501', 'exotel_connection');

		expect(post.mock.calls[0][0]).toBe('api/entity/processor/calls/a%2Fb%20501/browser-dial');
	});
});
