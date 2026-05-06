declare global {
	var __SSO_BEACON_HOST__: string | undefined;
	var __SOCIAL_LOGIN_HOST__: string | undefined;
}

const ATTEMPT_TIMEOUT_MS = 8000;
const BEACON_TIMEOUT_MS = 5000;

// NOTE: ssoModule loads before React mounts. Anything here must avoid touching
// the path-reactive store (StoreContext / getDataFromPath / setData), since
// reading a not-yet-initialised path corrupts the store and triggers spurious
// re-fetches of application/page definitions. Callers pass in any app data
// they have; this module only reads runtime globals and direct localStorage.
export function isSsoEnabled(application?: { properties?: { sso3?: boolean } } | null): boolean {
	if (globalThis.isDesignMode) return false;
	if (!globalThis.__SSO_BEACON_HOST__) return false;
	if (application && application.properties?.sso3 !== true) return false;
	return true;
}

export function getBeaconURL(): string | null {
	const host = globalThis.__SSO_BEACON_HOST__;
	if (!host) return null;
	return `https://${host}`;
}

export function isAlreadyAuthenticated(): boolean {
	const tokenKey = globalThis.isDesignMode ? 'designMode_AuthToken' : 'AuthToken';
	const expiryKey = globalThis.isDesignMode ? 'designMode_AuthTokenExpiry' : 'AuthTokenExpiry';
	const token = localStorage.getItem(tokenKey);
	const expiry = localStorage.getItem(expiryKey);
	if (!token) return false;
	const expiryMs = Number.parseInt(expiry ?? '0', 10) * 1000;
	return expiryMs > Date.now();
}

function buildIframe(src: string): HTMLIFrameElement {
	const iframe = document.createElement('iframe');
	iframe.style.display = 'none';
	iframe.style.width = '0';
	iframe.style.height = '0';
	iframe.style.border = '0';
	iframe.setAttribute('aria-hidden', 'true');
	iframe.src = src;
	document.body.appendChild(iframe);
	return iframe;
}

function removeIframe(iframe: HTMLIFrameElement | null) {
	if (iframe?.parentNode) iframe.parentNode.removeChild(iframe);
}

function awaitSsoMessage(
	iframe: HTMLIFrameElement,
	beaconURL: string,
	timeoutMs: number,
): Promise<{ type: 'token'; token: string } | { type: 'none' }> {
	return new Promise(resolve => {
		let settled = false;
		const settle = (v: { type: 'token'; token: string } | { type: 'none' }) => {
			if (settled) return;
			settled = true;
			window.removeEventListener('message', onMessage);
			clearTimeout(timer);
			resolve(v);
		};

		const onMessage = (event: MessageEvent) => {
			if (event.origin !== beaconURL) return;
			if (event.source !== iframe.contentWindow) return;
			const data = event.data as { type?: string; token?: string } | undefined;
			if (data?.type === 'sso:token' && typeof data.token === 'string') {
				settle({ type: 'token', token: data.token });
			} else if (data?.type === 'sso:none') {
				settle({ type: 'none' });
			}
		};

		window.addEventListener('message', onMessage);
		const timer = setTimeout(() => settle({ type: 'none' }), timeoutMs);
	});
}

export async function ssoAttempt(args: {
	appCode: string;
	clientCode: string;
}): Promise<'success' | 'login_required'> {
	const beaconURL = getBeaconURL();
	if (!beaconURL) return 'login_required';
	if (isAlreadyAuthenticated()) return 'success';

	const parentURL = window.location.href;
	const designMode = !!globalThis.isDesignMode;
	const iframeSrc =
		`${beaconURL}/hassso?parentURL=${encodeURIComponent(parentURL)}` +
		`&targetAppCode=${encodeURIComponent(args.appCode)}` +
		`&targetClientCode=${encodeURIComponent(args.clientCode)}` +
		`&designMode=${designMode}`;

	const iframe = buildIframe(iframeSrc);
	const result = await awaitSsoMessage(iframe, beaconURL, ATTEMPT_TIMEOUT_MS);
	removeIframe(iframe);

	if (result.type === 'token') {
		// Top-level navigation to /sso/{token} on this origin: writes localStorage
		// + cookie, then redirects back to current URL with the session live.
		completeWithToken(result.token, parentURL);
		// completeWithToken navigates the page; the promise never visibly resolves.
		return 'success';
	}
	return 'login_required';
}

export function completeWithToken(token: string, redirectUrl: string): void {
	const target =
		`/sso/${encodeURIComponent(token)}` +
		`?cookie=true&redirectUrl=${encodeURIComponent(redirectUrl)}`;
	window.location.replace(target);
}

/**
 * Build the URL a customer-app's "Sign in with Google/Meta" button should
 * navigate to. Lands on authzump → OAuth consent → callback → chained /sso
 * redirects → user back on `redirectUrl` (defaults to current page) fully
 * authenticated.
 *
 * Uses `window.__SOCIAL_LOGIN_HOST__` (always injected by IndexHTMLService /
 * htmlRenderer), independent of the `sso3` flag. An app can offer social login
 * without participating in the cross-app SSO beacon. Returns null only if the
 * social-login host isn't injected at all (e.g. running outside the platform).
 */
export function buildSocialLoginURL(
	platform: 'GOOGLE' | 'META',
	application: { appCode?: string; clientCode?: string } | null,
	redirectUrl?: string,
): string | null {
	const host = globalThis.__SOCIAL_LOGIN_HOST__;
	if (!host || !application?.appCode) return null;
	const back = redirectUrl ?? window.location.href;
	// Query param names match the platform convention so the existing
	// SocialLogin KIRun function (which reads Store.urlDetails.queryParameters.appCode
	// etc.) keeps working when the legacy /appLogin redirect path fires.
	return (
		`https://${host}/api/security/clients/socialRegister/evoke` +
		`?platform=${platform}` +
		`&appCode=${encodeURIComponent(application.appCode)}` +
		`&clientCode=${encodeURIComponent(application.clientCode ?? 'SYSTEM')}` +
		`&redirectUrl=${encodeURIComponent(back)}`
	);
}

export async function establishBeacon(token: string): Promise<void> {
	const beaconURL = getBeaconURL();
	if (!beaconURL) return;

	// /sso/{token}'s inline JS sets the Authorization cookie + writes localStorage
	// on .authzump.modlix.com synchronously; by the time the iframe fires its
	// first 'load' event, both are done. We tear the iframe down immediately to
	// cancel the post-redirect bounce so it never loads the parent's index
	// (which would trigger a stray bootstrap inside the iframe).
	const designMode = !!globalThis.isDesignMode;
	const iframeSrc =
		`${beaconURL}/sso/${encodeURIComponent(token)}` +
		`?cookie=true&redirectUrl=${encodeURIComponent(beaconURL)}` +
		`&designMode=${designMode}`;

	const iframe = buildIframe(iframeSrc);
	await new Promise<void>(resolve => {
		let resolved = false;
		const settle = () => {
			if (resolved) return;
			resolved = true;
			resolve();
		};
		iframe.addEventListener('load', settle, { once: true });
		setTimeout(settle, BEACON_TIMEOUT_MS);
	});
	removeIframe(iframe);
}
