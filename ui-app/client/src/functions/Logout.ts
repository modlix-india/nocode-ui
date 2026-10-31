import {
	AbstractFunction,
	Event,
	EventResult,
	FunctionExecutionParameters,
	FunctionOutput,
	FunctionSignature,
	Parameter,
	Schema,
} from '@fincity/kirun-js';
import axios from 'axios';
import { LOCAL_STORE_PREFIX, NAMESPACE_UI_ENGINE } from '../constants';
import { getDataFromPath, setData } from '../context/StoreContext';
import { shortUUID } from '../util/shortUUID';
import { isSsoEnabled, ssoLogoutBeacon } from '../sso/ssoModule';
import { absoluteDestination } from '../util/absoluteDestination';
import { pushMayBeRegistered } from '../util/pushGate';

const SIGNATURE = new FunctionSignature('Logout')
	.setParameters(
		new Map([
			Parameter.ofEntry('ssoLogout', Schema.ofBoolean('ssoLogout').setDefaultValue(false)),
			Parameter.ofEntry('redirectUrl', Schema.ofString('redirectUrl').setDefaultValue('')),
		]),
	)
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setEvents(
		new Map([
			Event.eventMapEntry(Event.OUTPUT, new Map()),
			Event.eventMapEntry(
				Event.ERROR,
				new Map([
					['data', Schema.ofAny('data')],
					['headers', Schema.ofAny('headers')],
					['status', Schema.ofNumber('status')],
				]),
			),
		]),
	)
	.setDescription('Logs out the current user, clears session data, and optionally redirects')
	.setDocumentation(
		"# UIEngine.Logout\n\nLogs out the current user by calling the `/api/security/revoke` endpoint. Clears all authentication data from the store, removes the auth token from local storage, and resets page caches. Optionally supports SSO logout and post-logout redirection.\n\n## Parameters\n\n- **ssoLogout** (Boolean, optional, default: false): Whether to perform SSO logout in addition to local logout\n- **redirectUrl** (String, optional, default: ''): URL to redirect to after successful logout\n\n## Events\n\n- **output**: Triggered on successful logout\n- **error**: Triggered on logout failure\n  - `data` (Any): Error response body\n  - `headers` (Any): Error response headers\n  - `status` (Number): HTTP status code\n\n## Use Cases\n\n- **User Sign Out**: End the user session and clear credentials\n- **SSO Logout**: Sign out from both the app and the identity provider\n- **Session Expiry**: Programmatically log out when a session expires\n- **Security**: Force logout on suspicious activity",
	);

export class Logout extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const token = getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []);

		const application = getDataFromPath('Store.application', []);
		const ssoOn = isSsoEnabled(application);
		const appCode: string = application?.appCode ?? '';

		const headers: any = { AUTHORIZATION: token };
		if (globalThis.isDebugMode)
			headers['x-debug'] = (globalThis.isFullDebugMode ? 'full-' : '') + shortUUID();

		const ssoLogout: boolean = context.getArguments()?.get('ssoLogout');
		const rawRedirect: string = context.getArguments()?.get('redirectUrl');
		// Resolved the way Login resolves its redirect: the SSO beacon rejects a relative
		// URL with a 400, and a path-based host needs its /{app}/{client}/page/ prefix.
		const redirectUrl: string =
			rawRedirect && rawRedirect !== '' ? absoluteDestination(rawRedirect) : '';

		// The revoke goes out BEFORE the store is cleared. Clearing `Store.pageDefinition` and
		// `Store.application` makes the render engine refetch the page, see no app code and
		// reload, and that reload used to abort the revoke in flight: the token stayed valid on
		// the server, the beacon was never told, and `redirectUrl` was never reached, so the
		// user landed on the app's own login page instead of the one the page asked for.
		// The device stops reaching this user while their token still works for the call.
		// Only a browser or phone that registered for push has anything to remove.
		if (pushMayBeRegistered()) {
			const { disablePush } = await import(
				/* webpackChunkName: "PushRegistration" */ '../util/pushRegistration'
			);
			await disablePush();
		}

		let failure: any = undefined;
		try {
			await axios({
				url: `api/security/revoke?ssoLogout=${ssoLogout ? 'true' : 'false'}`,
				method: 'GET',
				headers,
			});
		} catch (err: any) {
			failure = err;
		}

		setData('Store.auth', undefined, undefined, true);
		setData(`${LOCAL_STORE_PREFIX}.AuthToken`, undefined, undefined, true);
		// The expiry was being left behind. On its own that is only litter, but the pair
		// is what every reader treats as "there is a session here", so clear both.
		setData(`${LOCAL_STORE_PREFIX}.AuthTokenExpiry`, undefined, undefined, true);
		setData('Store.pageDefinition', {});
		setData('Store.messages', []);
		setData('Store.validations', {});
		setData('Store.validationTriggers', {});
		setData('Store.pageData', {});
		setData('Store.application', undefined, undefined, true);
		setData('Store.functionExecutions', {});

		if (failure) {
			return new FunctionOutput([
				EventResult.of(
					Event.ERROR,
					new Map([
						['data', failure.response?.data],
						['headers', failure.response?.headers],
						['status', failure.response?.status],
					]),
				),
				EventResult.outputOf(new Map([['data', null]])),
			]);
		}

		// Clearing this origin is only half of signing out. The beacon holds its own
		// session on its own origin, and while it does, the next cold load bounces there
		// and is handed a fresh token, i.e. the user is signed straight back in. Go and
		// forget it, then continue to wherever logout was headed anyway. It runs in the same
		// tick as the clearing above, so the render engine sees the hop and does not reload.
		if (ssoOn && appCode) {
			ssoLogoutBeacon(appCode, redirectUrl && redirectUrl !== '' ? redirectUrl : undefined);
			return new FunctionOutput([EventResult.outputOf(new Map([['data', {}]]))]);
		}

		if (redirectUrl && redirectUrl !== '') {
			setTimeout(() => {
				globalThis.location.href = redirectUrl;
			}, 100);
		}

		return new FunctionOutput([EventResult.outputOf(new Map([['data', {}]]))]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
