import axios from 'axios';
import { authHeaders } from './auth';
import { CallCredentials } from './types';

/**
 * The agent's browser phone credential, fetched by the call engine itself from a server function
 * (LZT-2162). Neither provider offers a short lived per agent credential (TeleCMI's is the
 * agent's durable SIP password), so the only levers are where it travels and revoking it. Fetched
 * here it never passes through a page expression, a KIRun step output or the store: it goes from
 * the response straight to the adapter's sign in, and the session keeps only a way to fetch it
 * again (a closure), never the value.
 *
 * The server function is the only issuer, runs as the signed in agent, and answers with
 * `{ enabled, credential, providerUserId, provider, region, expiresIn }` (the older shape
 * `{ enabled, agentId, password, region }` is read too).
 */

export class CredentialError extends Error {
	/** Not worth asking again: the server refused (not enabled, not allowed), not a network blip. */
	readonly permanent: boolean;
	constructor(message: string, permanent: boolean) {
		super(message);
		this.permanent = permanent;
	}
}

export type CredentialFetcher = (
	fn: string,
	args: Record<string, any>,
) => Promise<Record<string, any>>;

export const CREDENTIAL_TIMEOUT_MS = 20000;

/** The output of a server function execution: the first `output` event's results. */
export function functionOutput(data: any): Record<string, any> {
	const events = Array.isArray(data) ? data : [data];
	const ev = events.find(e => e?.name === 'output') ?? events[0];
	if (!ev || typeof ev !== 'object')
		throw new CredentialError('The credential function returned nothing.', false);
	if (ev.name === 'error')
		throw new CredentialError(
			String(ev.result?.message ?? 'The credential function refused.'),
			true,
		);
	const results = ev.result ?? {};
	// A function that names its one output (`result`) is read through it.
	const inner = results.result;
	return inner && typeof inner === 'object' && !Array.isArray(inner) ? inner : results;
}

const serverFetch: CredentialFetcher = async (fn, args) => {
	const dot = fn.lastIndexOf('.');
	const namespace = fn.slice(0, dot).trim();
	const name = fn.slice(dot + 1).trim();
	if (dot <= 0 || !name || !namespace)
		throw new CredentialError(`"${fn}" is not a Namespace.name function.`, true);
	let data: any;
	try {
		// Relative on purpose: the gateway reads the app and client from the page's own path.
		const response = await axios.post(
			`api/core/function/execute/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}`,
			args ?? {},
			{ headers: authHeaders(), timeout: CREDENTIAL_TIMEOUT_MS },
		);
		data = response.data;
	} catch (e: any) {
		// The body is never echoed: only the status says what went wrong.
		const status = Number(e?.response?.status) || 0;
		throw new CredentialError(
			`The calling credential could not be fetched${status ? ` (${status})` : ''}.`,
			status >= 400 && status < 500 && status !== 408 && status !== 429,
		);
	}
	return functionOutput(data);
};

let fetcher: CredentialFetcher = serverFetch;

/** For tests: a fake fetcher, or undefined for the server's. */
export function setCredentialFetcher(f: CredentialFetcher | undefined) {
	fetcher = f ?? serverFetch;
}

const text = (v: any) => (v === undefined || v === null || v === '' ? undefined : String(v));

/**
 * What the server function answered, as the adapter's credentials for `provider`. Refuses an
 * answer that says browser calling is off for this agent, or that carries no credential.
 */
export function toCredentials(provider: string, raw: Record<string, any>): CallCredentials {
	if (!raw || typeof raw !== 'object')
		throw new CredentialError('The credential function returned nothing.', false);
	if (raw.enabled === false)
		throw new CredentialError('Browser calling is not turned on for this user.', true);
	const {
		enabled,
		credential,
		token,
		providerUserId,
		agentId,
		expiresIn,
		provider: _provider,
		connectionName,
		extension,
		...rest
	} = raw;
	const secret = text(credential) ?? text(rest.password) ?? text(token);
	const user = text(providerUserId) ?? text(rest.userId) ?? text(agentId);
	if (!secret) throw new CredentialError('The credential function returned no credential.', true);
	const out: CallCredentials = { ...rest };
	if (provider === 'exotel') {
		out.secret = text(rest.secret) ?? secret;
		if (user && !out.userName) out.userName = user;
	} else {
		out.password = secret;
		if (user) out.userId = user;
	}
	return out;
}

/** Asks the server function for the agent's credential, once. */
export async function fetchCredentials(
	provider: string,
	fn: string,
	args: Record<string, any>,
): Promise<CallCredentials> {
	return toCredentials(provider, await fetcher(fn, args ?? {}));
}
