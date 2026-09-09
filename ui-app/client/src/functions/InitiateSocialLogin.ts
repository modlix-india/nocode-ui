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
import { NAMESPACE_UI_ENGINE } from '../constants';
import { getDataFromPath } from '../context/StoreContext';
import { buildSocialLoginURL } from '../sso/ssoModule';
import { absoluteDestination } from '../util/absoluteDestination';

const SIGNATURE = new FunctionSignature('InitiateSocialLogin')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			Parameter.ofEntry('platform', Schema.ofString('platform')
				.setEnums(['GOOGLE', 'META'].map(e => e as any))),
			Parameter.ofEntry('redirectUrl', Schema.ofString('redirectUrl').setDefaultValue('')),
			Parameter.ofEntry('appCode', Schema.ofString('appCode').setDefaultValue('')),
			Parameter.ofEntry('clientCode', Schema.ofString('clientCode').setDefaultValue('')),
			Parameter.ofEntry(
				'clientType',
				Schema.ofString('clientType')
					.setEnums(['', 'BUSINESS', 'INDIVIDUAL'].map(e => e as any))
					.setDefaultValue(''),
			),
		]),
	)
	.setEvents(
		new Map([
			Event.eventMapEntry(Event.OUTPUT, new Map()),
			Event.eventMapEntry(
				Event.ERROR,
				new Map([['message', Schema.ofString('message')]]),
			),
		]),
	)
	.setDescription('Navigates to authzump social-login (Google/Meta) for the current or specified app')
	.setDocumentation('# UIEngine.InitiateSocialLogin\n\nStarts social login by doing a top-level redirect to the platform\'s social-register evoke endpoint on authzump, which holds the Google and Meta OAuth credentials for every app. The user goes through the provider, and the callback brings them back to `redirectUrl` on THIS app with the provider-verified profile and a single-use state.\n\nThe return leg needs no page wiring: the client bootstrap redeems that state against this app\'s own origin, signing the user in or registering them here first, then continues to `redirectUrl`. Do not add a `SocialLogin` step of your own after this one.\n\n## Parameters\n\n- **platform** (String, required): `GOOGLE` or `META`\n- **redirectUrl** (String, optional): Where to land once social login completes. A relative path is resolved the way page links are, so `/accountHome` works. Defaults to the current page URL.\n- **appCode** (String, optional): Override the target app code. Defaults to the current app from `Store.application.appCode`.\n- **clientCode** (String, optional): Override the target client code. Defaults to the current app\'s client code or `SYSTEM`.\n- **clientType** (String, optional): `BUSINESS` or `INDIVIDUAL`, for a first-time user who has to be registered. Same choice you make when calling the registration endpoint from a page, and you can bind it to whatever the user picked on your form. **Send it.** An app\'s registration rules grant profiles and roles per client type, so the wrong one, or none, creates an account that is active and signed in and granted nothing, which the user sees as "you don\'t have access to this page". Left empty, nothing is sent and the registration endpoint behaves as it does for any other caller that omits it.\n\n## Events\n\n- **output**: Fires after navigation is initiated\n- **error**: Fires when social login is not configured (no `__SOCIAL_LOGIN_HOST__` injected) or no app code is available\n\n## Notes\n\nIndependent of `application.properties.sso3`: an app can offer social login without taking part in cross-app SSO. The app does need a Google or Meta integration registered for it, and `redirectUrl` must be one of the app\'s own hosts, which is what resolving a relative path gives you.');

export class InitiateSocialLogin extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const args = context.getArguments();
		const platformArg: string = args?.get('platform');
		const redirectUrlArg: string = args?.get('redirectUrl');
		const appCodeArg: string = args?.get('appCode');
		const clientCodeArg: string = args?.get('clientCode');
		const clientTypeArg: string = args?.get('clientType');

		if (platformArg !== 'GOOGLE' && platformArg !== 'META') {
			return new FunctionOutput([
				EventResult.of(
					Event.ERROR,
					new Map([['message', `Unsupported platform: ${platformArg}`]]),
				),
			]);
		}

		const application = getDataFromPath('Store.application', []);
		const appCode = appCodeArg || application?.appCode;
		const clientCode = clientCodeArg || application?.clientCode || 'SYSTEM';

		if (!appCode) {
			return new FunctionOutput([
				EventResult.of(
					Event.ERROR,
					new Map([['message', 'No appCode available — application definition not loaded']]),
				),
			]);
		}

		// The redirect has to leave here ABSOLUTE. The platform's callback refuses a
		// scheme-less destination as an open redirect and falls back to the OAuth broker's own
		// login page, which is a different app on a different host: the user lands somewhere
		// that knows nothing about this app and the sign-in silently ends there. Pages write
		// `/accountHome`, the way every other link in a page is written, so resolving it is
		// this function's job, not the page author's.
		//
		// `clientType` rides along untouched. It is the app's call, and on some apps the user's
		// own choice on the form, so it is carried from this click through the provider and
		// back rather than decided anywhere in the platform.
		const url = buildSocialLoginURL(
			platformArg,
			{ appCode, clientCode },
			redirectUrlArg ? absoluteDestination(redirectUrlArg) : undefined,
			clientTypeArg,
		);

		if (!url) {
			return new FunctionOutput([
				EventResult.of(
					Event.ERROR,
					new Map([
						['message', 'Social login is not configured (window.__SOCIAL_LOGIN_HOST__ missing)'],
					]),
				),
			]);
		}

		window.location.href = url;

		return new FunctionOutput([EventResult.outputOf(new Map())]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
