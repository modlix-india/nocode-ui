import axios from 'axios';
import { LOCAL_STORE_PREFIX, STORE_PREFIX } from '../constants';
import { getDataFromPath } from '../context/StoreContext';
import { BrowserCallStatus, BrowserCallToken } from './types';

/**
 * The four backend calls the softphone makes. Nothing else talks to the network from this module.
 *
 * Headers are assembled the way every other authenticated caller in this codebase assembles them:
 * `getDataFromPath` against `LocalStore.AuthToken` and `Store.auth.loggedInClientCode`. Note it is
 * `getDataFromPath` and not `getData` - the latter takes a `ComponentProperty`, not a path string,
 * and handed a string it returns undefined, which produces an unauthenticated request and a 401
 * that reads like a backend fault.
 */
function headers(): Record<string, string> {
	return {
		Authorization: getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []) ?? '',
		clientCode: getDataFromPath(`${STORE_PREFIX}.auth.loggedInClientCode`, []) ?? '',
	};
}

/**
 * Whether this agent can take calls in the browser, and under which provider.
 *
 * `verify` is false on every page load: that path reads our own rows with no provider round trip.
 * Passing true asks the provider whether the agent can actually originate a call, which is a
 * different question and a much more expensive one. It belongs behind a "test my phone" control,
 * never on mount.
 *
 * The distinction is load-bearing rather than an optimisation. A SIP client can register cleanly
 * against an agent who cannot place a single call - registration and origination read different
 * records at the provider - so neither this response nor a connected softphone is evidence that
 * dialling works.
 */
export async function fetchStatus(
	connectionName: string,
	verify = false,
): Promise<BrowserCallStatus> {
	const response = await axios.get<BrowserCallStatus>('/api/message/call/browser/status', {
		params: { connectionName, verify },
		headers: headers(),
	});
	return response.data;
}

/**
 * Mints this agent's browser credential.
 *
 * The agent is taken from the JWT and never from the body, so there is no `userId` to send. Each
 * call reaches the provider, so do not put this behind anything that can loop.
 */
export async function fetchToken(connectionName: string): Promise<BrowserCallToken> {
	const response = await axios.post<BrowserCallToken>(
		'/api/message/call/browser/token',
		{ connectionName },
		{ headers: headers() },
	);
	return response.data;
}

/**
 * Places a call to a deal's customer from this agent's softphone.
 *
 * Takes a ticket and nothing else. entity-processor reads the deal under the caller's own access
 * and takes the number from it, so the browser can neither name a number to dial nor dial as
 * somebody else - and never learns the customer's number from this call.
 */
export async function dialTicket(ticketId: string, connectionName: string): Promise<unknown> {
	const response = await axios.post(
		`/api/entity/processor/calls/${encodeURIComponent(ticketId)}/browser-dial`,
		{ connectionName },
		{ headers: headers() },
	);
	return response.data;
}

/**
 * A deal's call log.
 *
 * The only source of `recordingUrl`. Recordings arrive at the backend on the provider's passthru
 * callback after the call ends, so they are never on a live call event and a player bound to one
 * renders empty every time.
 */
export async function fetchCallLog(ticketId: string, page = 0, size = 20): Promise<unknown> {
	const response = await axios.get(
		`/api/entity/processor/calls/${encodeURIComponent(ticketId)}`,
		{ params: { page, size }, headers: headers() },
	);
	return response.data;
}
