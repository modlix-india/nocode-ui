import axios from 'axios';
import { LOCAL_STORE_PREFIX, STORE_PREFIX } from '../constants';
import { getDataFromPath } from '../context/StoreContext';
import { BrowserCallStatus, BrowserCallToken } from './types';

/**
 * The three backend calls the softphone makes. Nothing else talks to the network from this module.
 *
 * Headers are assembled the way every other authenticated caller in this codebase assembles them:
 * `getDataFromPath` against `LocalStore.AuthToken` and `Store.auth.loggedInClientCode`. Note it is
 * `getDataFromPath` and not `getData` - the latter takes a `ComponentProperty`, not a path string,
 * and handed a string it returns undefined, which produces an unauthenticated request and a 401
 * that reads like a backend fault.
 *
 * **Every URL here is relative, and must stay relative.** Adding a leading slash breaks the app
 * context, and it breaks it in a way that reads like a backend or configuration fault rather than a
 * client one. The gateway takes the application from the path: for a request containing `/api/`, it
 * keeps everything before it as the codes part only when `/page/` also appears earlier, then reads
 * appCode and clientCode out of that. A relative `api/...` from a page at
 * `/leadzump/SYSTEM/page/deals` resolves to `/leadzump/SYSTEM/page/api/...` and the application
 * survives; an absolute `/api/...` leaves the codes part empty, so the gateway falls back to
 * resolving the application from the hostname. On a host-addressed deployment that still lands on
 * the right app, which is why the mistake hides in production — but on a path-addressed one, and
 * behind the dev-server proxy that rewrites Host to the proxy target, it resolves to a different
 * app entirely. Requests then arrive scoped to that app, and a connection that exists in this one
 * comes back as `400 Connection with name … not found`.
 *
 * `api/ui/application`, `api/security/verifyToken` and `api/ui/personalization/...` are all
 * relative for the same reason.
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
	const response = await axios.get<BrowserCallStatus>('api/message/call/browser/status', {
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
		'api/message/call/browser/token',
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
		`api/entity/processor/calls/${encodeURIComponent(ticketId)}/browser-dial`,
		{ connectionName },
		{ headers: headers() },
	);
	return response.data;
}
