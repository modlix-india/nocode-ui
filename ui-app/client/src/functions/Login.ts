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
import { NAMESPACE_UI_ENGINE } from '../constants';
import { getDataFromPath, setData } from '../context/StoreContext';
import { shortUUID } from '../util/shortUUID';
import pageHistory from '../components/Page/pageHistory';
import { getHref } from '../components/util/getHref';
import { beginSsoSeed, isSsoEnabled } from '../sso/ssoModule';

const SIGNATURE = new FunctionSignature('Login')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			Parameter.ofEntry('userName', Schema.ofString('userName')),
			Parameter.ofEntry('password', Schema.ofString('password').setDefaultValue('')),
			Parameter.ofEntry('userId', Schema.ofAny('userId').setDefaultValue(null)),
			Parameter.ofEntry('otp', Schema.ofString('otp').setDefaultValue('')),
			Parameter.ofEntry('pin', Schema.ofString('pin').setDefaultValue('')),
			Parameter.ofEntry(
				'identifierType',
				Schema.ofString('identifierType').setDefaultValue(''),
			),
			Parameter.ofEntry('rememberMe', Schema.ofBoolean('rememberMe').setDefaultValue(false)),
			Parameter.ofEntry('cookie', Schema.ofBoolean('cookie').setDefaultValue(false)),
			Parameter.ofEntry('redirectUrl', Schema.ofString('redirectUrl').setDefaultValue('')),
		]),
	)
	.setEvents(
		new Map([
			Event.eventMapEntry(Event.OUTPUT, new Map([['data', Schema.ofAny('data')]])),
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
	.setDescription('Authenticates a user and stores session data in the application store')
	.setDocumentation('# UIEngine.Login\n\nAuthenticates a user by calling the `/api/security/authenticate` endpoint. On success, stores authentication data in `Store.auth`, saves the access token to `LocalStore.AuthToken`, and clears all page caches to ensure a fresh session.\n\n## Parameters\n\n- **userName** (String, required): Username or email for authentication\n- **password** (String, optional, default: \'\'): User password\n- **userId** (Any, optional, default: null): User ID if available\n- **otp** (String, optional, default: \'\'): One-time password for two-factor authentication\n- **pin** (String, optional, default: \'\'): PIN code if required\n- **identifierType** (String, optional, default: \'\'): Type of identifier being used for login\n- **rememberMe** (Boolean, optional, default: false): Whether to persist the session\n- **cookie** (Boolean, optional, default: false): Whether to set an authentication cookie\n- **redirectUrl** (String, optional): Where to send the user on success. Pass this INSTEAD of a following `Navigate` step. A relative path is resolved the way page links are, so `/dashboard` works. When the app has SSO enabled this navigation is routed through the SSO beacon, which seeds the shared session at no extra cost, so other apps can sign the same user in without asking again.\n\n## Events\n\n- **output**: Triggered on successful authentication\n  - `data` (Any): Authentication response containing access token and user details\n- **error**: Triggered on authentication failure\n  - `data` (Any): Error response body\n  - `headers` (Any): Error response headers\n  - `status` (Number): HTTP status code\n\n## Use Cases\n\n- **User Authentication**: Log users into the application\n- **Multi-Factor Auth**: Support OTP and PIN-based authentication flows\n- **Session Management**: Establish and persist user sessions\n- **SSO Integration**: Authenticate via various identifier types');

/**
 * Resolve whatever the page passed into an absolute URL.
 *
 * Relative paths go through `getHref` first, so a link written the way every other link in a
 * page is written resolves the same way: on a `/{app}/{client}/page/{name}` URL it keeps that
 * prefix, and elsewhere it is left alone.
 */
function absoluteDestination(redirectUrl: string): string {
	const href = getHref(redirectUrl, window.location) ?? redirectUrl;
	try {
		return new URL(href, window.location.href).toString();
	} catch {
		return window.location.href;
	}
}

/**
 * Mint a one-time token for the beacon and build the URL that seeds it and then continues to
 * `destination`. Returns null when the token cannot be minted, which is not fatal: the caller
 * navigates straight to the destination instead.
 */
async function seedTarget(
	destination: string,
	headers: any,
	accessToken: string | undefined,
): Promise<string | null> {
	try {
		const response = await axios.post(
			'api/security/makeOneTimeToken',
			{ targetAppCode: 'authzump', targetClientCode: 'SYSTEM' },
			{ withCredentials: true, headers: { ...headers, Authorization: accessToken } },
		);
		const token = response?.data?.token;
		return token ? beginSsoSeed(token, destination) : null;
	} catch {
		return null;
	}
}

export class Login extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const userName: string = context.getArguments()?.get('userName');
		const password: string = context.getArguments()?.get('password');
		const userId: any = context.getArguments()?.get('userId');
		const otp: string = context.getArguments()?.get('otp');
		const pin: string = context.getArguments()?.get('pin');
		const identifierType: string = context.getArguments()?.get('identifierType');
		const rememberMe: string = context.getArguments()?.get('rememberMe');
		const cookieArg: boolean = context.getArguments()?.get('cookie');
		const redirectUrl: string = context.getArguments()?.get('redirectUrl');

		const application = getDataFromPath('Store.application', []);
		const ssoOn = isSsoEnabled(application);
		const cookie: boolean = ssoOn ? true : cookieArg;

		const data: any = { userName, rememberMe, cookie };
		if (userId) data.userId = userId;
		if (identifierType) data.identifierType = identifierType;
		if (password) data.password = password;
		if (otp) data.otp = otp;
		if (pin) data.pin = pin;

		const headers: any = {};
		if (globalThis.isDebugMode) headers['x-debug'] = (globalThis.isFullDebugMode ? 'full-' : '') +shortUUID();

		try {
			const response = await axios({
				url: 'api/security/authenticate',
				method: 'POST',
				data,
				headers,
			});

			// The beacon is NOT seeded here any more. It used to be, through a hidden
			// iframe, which cannot work: storage reached from a third-party context is
			// partitioned by top-level site, so what that iframe wrote was a private copy
			// no other app could ever read. It cost a token mint and an iframe load on
			// every login and bought nothing.
			//
			// Seeding needs a top-level visit to the beacon, which means leaving the page,
			// which would silently drop whatever this page function does next. So the page
			// asks for it explicitly instead: call UIEngine.SsoSeed after Login, passing
			// the page you would have navigated to.

			for (let key of Object.keys(pageHistory)) delete pageHistory[key];

			setData('Store.auth', response.data);
			setData('LocalStore.AuthToken', response.data?.accessToken, undefined, true);
			setData(
				'LocalStore.AuthTokenExpiry',
				response.data?.accessTokenExpiryAt,
				undefined,
				true,
			);

			setData('Store.pageDefinition', {});
			setData('Store.messages', []);
			setData('Store.pageData', {});
			setData('Store.validations', {});
			setData('Store.validationTriggers', {});
			setData('Store.application', undefined, undefined, true);
			setData('Store.functionExecutions', {});

			// Seed the beacon on EVERY successful login when the app is enrolled, not only
			// when the page named a destination. Seeding is what lets the next app sign this
			// user in without asking again, and gating it on a parameter would mean it never
			// happened for any page that had not been edited.
			//
			// It rides the navigation rather than adding one: the hop goes through the beacon,
			// which is top-level there so it writes a genuine first-party session, and lands on
			// `redirectUrl` when the page gave one, otherwise back on this same page.
			//
			// Note the consequence of coming back here: this leaves the page, so a `Navigate`
			// step after Login in the page's own function does NOT run. Pass `redirectUrl`
			// instead of that step.
			const destination = redirectUrl ? absoluteDestination(redirectUrl) : window.location.href;

			if (ssoOn) {
				const seed = await seedTarget(destination, headers, response.data?.accessToken);
				if (seed) {
					window.location.replace(seed);
					return new FunctionOutput([
						EventResult.outputOf(new Map([['data', response.data]])),
					]);
				}
			}

			// SSO off, or the beacon token could not be minted. A login that worked must not
			// strand the user because the beacon did not, so go straight to the destination,
			// and when no destination was named leave the page exactly as it behaved before.
			if (redirectUrl) window.location.replace(destination);

			return new FunctionOutput([EventResult.outputOf(new Map([['data', response.data]]))]);
		} catch (err: any) {
			return new FunctionOutput([
				EventResult.of(
					Event.ERROR,
					new Map([
						['data', err.response.data],
						['headers', err.response.headers],
						['status', err.response.status],
					]),
				),
				EventResult.outputOf(new Map([])),
			]);
		}
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
