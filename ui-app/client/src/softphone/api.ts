import axios from 'axios';
import { LOCAL_STORE_PREFIX, STORE_PREFIX } from '../constants';
import { getDataFromPath } from '../context/StoreContext';
import { BrowserCallStatus, BrowserCallToken } from './types';

/**
 * Uses `getDataFromPath`, not `getData`: handed a path string, `getData` returns undefined and the
 * request goes out unauthenticated.
 *
 * Every URL here must stay relative. The gateway reads appCode/clientCode from the path before
 * `/api/` only when `/page/` precedes it; an absolute `/api/...` falls back to the hostname, which
 * on path-addressed deployments (and behind the dev proxy) resolves to a different app.
 */
function headers(): Record<string, string> {
	return {
		Authorization: getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []) ?? '',
		clientCode: getDataFromPath(`${STORE_PREFIX}.auth.loggedInClientCode`, []) ?? '',
	};
}

/**
 * `verify` true asks the provider whether the agent can originate a call: expensive, so never on
 * mount. Registration and origination read different provider records, so a registered
 * softphone is not evidence that dialling works.
 *
 * With no `connectionName` the backend answers for the agent's own connection and names it.
 */
export async function fetchStatus(
	connectionName?: string,
	verify = false,
): Promise<BrowserCallStatus> {
	const response = await axios.get<BrowserCallStatus>('api/message/call/browser/status', {
		params: connectionName ? { connectionName, verify } : { verify },
		headers: headers(),
	});
	return response.data;
}

/** The agent comes from the JWT. Each call reaches the provider, so never call it in a loop. */
export async function fetchToken(connectionName: string): Promise<BrowserCallToken> {
	const response = await axios.post<BrowserCallToken>(
		'api/message/call/browser/token',
		{ connectionName },
		{ headers: headers() },
	);
	return response.data;
}

/**
 * Takes a ticket only: the server reads the number from the deal under the caller's access, so
 * the browser can neither choose a number nor learn the customer's.
 */
export async function dialTicket(ticketId: string, connectionName: string): Promise<unknown> {
	const response = await axios.post(
		`api/entity/processor/calls/${encodeURIComponent(ticketId)}/browser-dial`,
		{ connectionName },
		{ headers: headers() },
	);
	return response.data;
}
