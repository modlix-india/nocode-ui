import { asError, serverMessage } from '../errors';

/**
 * The one place a thrown value becomes a `SoftphoneError`, shared by the registry, the leader relay
 * and the UIEngine functions. Only our own codes pass, and only `code` and `message` are copied: an
 * Axios error also has both, and passing it whole would carry its request headers, auth token
 * included, into the store, a BroadcastChannel message or a function's error output.
 */

const axiosError = {
	isAxiosError: true,
	code: 'ERR_BAD_REQUEST',
	message: 'Request failed with status code 400',
	config: { headers: { Authorization: 'a-token' } },
	response: { data: { message: 'This deal has no phone number.' } },
};

describe('asError', () => {
	it('passes one of our errors through with only its code and message', () => {
		const error = { code: 'NO_ACTIVE_CALL', message: 'No call.', extra: 'dropped' };

		expect(asError(error, 'RELAY_TIMEOUT', 'fallback')).toEqual({
			code: 'NO_ACTIVE_CALL',
			message: 'No call.',
		});
	});

	it('gives an Axios error the fallback code and the server message, and nothing of the request', () => {
		expect(asError(axiosError, 'DIAL_REJECTED', 'fallback')).toEqual({
			code: 'DIAL_REJECTED',
			message: 'This deal has no phone number.',
		});
	});

	it('uses the fallback message for an Axios error the server gave no message for', () => {
		expect(asError({ ...axiosError, response: undefined }, 'TOKEN_FAILED', 'fallback')).toEqual(
			{
				code: 'TOKEN_FAILED',
				message: 'fallback',
			},
		);
	});

	it('refuses a code that is not ours, even one found on the prototype', () => {
		expect(asError({ code: 'ERR_NETWORK', message: 'x' }, 'NO_ACTIVE_CALL', 'fb').code).toBe(
			'NO_ACTIVE_CALL',
		);
		expect(asError({ code: 'constructor', message: 'x' }, 'NO_ACTIVE_CALL', 'fb').code).toBe(
			'NO_ACTIVE_CALL',
		);
	});

	it('keeps an ordinary error s message and falls back for anything else', () => {
		expect(asError(new Error('Network is down.'), 'NO_ACTIVE_CALL', 'fb')).toEqual({
			code: 'NO_ACTIVE_CALL',
			message: 'Network is down.',
		});
		expect(asError('a string', 'NO_ACTIVE_CALL', 'fb')).toEqual({
			code: 'NO_ACTIVE_CALL',
			message: 'fb',
		});
	});
});

describe('serverMessage', () => {
	it('reads a non-blank server message only', () => {
		expect(serverMessage(axiosError)).toBe('This deal has no phone number.');
		expect(serverMessage({ response: { data: { message: '  ' } } })).toBeUndefined();
		expect(serverMessage(undefined)).toBeUndefined();
	});
});
