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
import { getDataFromPath } from '../context/StoreContext';
import { shortUUID } from '../util/shortUUID';
import { absoluteDestination } from '../util/absoluteDestination';
import { replaceLocation } from '../util/replaceLocation';
import { isSsoEnabled, ssoSeedBeacon } from '../sso/ssoModule';

const SIGNATURE = new FunctionSignature('SsoSeed')
	.setParameters(
		new Map([
			Parameter.ofEntry('redirectUrl', Schema.ofString('redirectUrl').setDefaultValue('')),
		]),
	)
	.setNamespace(NAMESPACE_UI_ENGINE)
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
	.setDescription(
		'Shares the current session with the other apps on the platform, then continues to redirectUrl',
	)
	.setDocumentation(
		'# UIEngine.SsoSeed\n\n' +
			'Gives the SSO beacon a first-party session for the user who is ALREADY signed in on this app, so the other apps on the platform can sign the same person in without asking again.\n\n' +
			'`UIEngine.Login` does this by itself. This step is for the paths that establish a session WITHOUT going through Login, which in practice means registration: `clients/register` and `clients/socialRegister` both return an authentication, the page writes it to `LocalStore.AuthToken`, and nothing has told the beacon. Call this as the last step of a sign-up and the new account is signed in everywhere, exactly as it would be after a password sign-in.\n\n' +
			'## Parameters\n\n' +
			"- **redirectUrl** (String, optional): Where to land once the beacon has been seeded. Pass this INSTEAD of a following `Navigate` step -- seeding is a top-level visit to the beacon, so this function leaves the page and nothing after it in the page's function runs. A relative path is resolved the way page links are.\n\n" +
			'## Events\n\n' +
			'- **output**: The beacon was seeded, or seeding was not applicable and the user was sent to `redirectUrl` anyway\n' +
			'  - `data` (Any): `true` when the beacon was seeded, `false` when it was skipped\n' +
			'- **error**: Only when something unexpected went wrong; a refused mint is not an error\n\n' +
			'## Notes\n\n' +
			'Best-effort, the way `Login` treats it. A user who has just registered must not be stranded because the beacon could not be reached, so a failed mint still continues to `redirectUrl`. On an app that is not enrolled in SSO (`properties.sso3` is not true) this is just a navigation.\n\n' +
			'## Use Cases\n\n' +
			'- **After sign-up**: Complete an email or social registration so the new session is shared\n' +
			'- **After any non-Login sign-in**: Any flow that writes `LocalStore.AuthToken` itself',
	);

/**
 * Hand the beacon a session the page established without `UIEngine.Login`.
 *
 * Login seeds the beacon itself, on every successful sign-in. Registration does not go through
 * Login: `clients/register` and `clients/socialRegister` each return an authentication that the
 * page stores by hand, so a freshly signed-up user is known on this origin and anonymous on
 * every other app until they sign in a second time. That is the whole of the "SSO does not work
 * across the zump apps" report -- the bounce chain is fine, nobody had told the beacon.
 *
 * Navigates on success, so this must be the LAST step of the function that calls it; say where
 * to land with `redirectUrl` rather than following it with a `Navigate`.
 */
export class SsoSeed extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const redirectUrl: string = context.getArguments()?.get('redirectUrl');
		const destination = redirectUrl ? absoluteDestination(redirectUrl) : window.location.href;

		const skip = (reason: unknown) => {
			// Seeding is an optimisation on top of a session that already exists. Never let it
			// cost the user the page they were going to.
			if (reason)
				console.error(
					'Could not seed the SSO beacon; continuing signed in here only:',
					reason,
				);
			if (redirectUrl) replaceLocation(destination);
			return new FunctionOutput([EventResult.outputOf(new Map([['data', false]]))]);
		};

		const application = getDataFromPath('Store.application', []);
		if (!isSsoEnabled(application)) return skip(undefined);

		const accessToken = getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []);
		if (!accessToken) return skip('there is no session on this origin to share');

		const headers: any = { Authorization: accessToken };
		if (globalThis.isDebugMode)
			headers['x-debug'] = (globalThis.isFullDebugMode ? 'full-' : '') + shortUUID();

		let token: string | undefined;
		try {
			const response = await axios.post(
				'api/security/makeOneTimeToken',
				{ targetAppCode: 'authzump', targetClientCode: 'SYSTEM' },
				{ withCredentials: true, headers },
			);
			token = response?.data?.token;
		} catch (err) {
			return skip(err);
		}

		if (!token) return skip('the beacon token could not be minted');

		// Leaves the page.
		ssoSeedBeacon(token, destination);
		return new FunctionOutput([EventResult.outputOf(new Map([['data', true]]))]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
