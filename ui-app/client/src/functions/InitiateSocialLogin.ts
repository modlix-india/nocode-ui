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

const SIGNATURE = new FunctionSignature('InitiateSocialLogin')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			Parameter.ofEntry('platform', Schema.ofString('platform')
				.setEnums(['GOOGLE', 'META'].map(e => e as any))),
			Parameter.ofEntry('redirectUrl', Schema.ofString('redirectUrl').setDefaultValue('')),
			Parameter.ofEntry('appCode', Schema.ofString('appCode').setDefaultValue('')),
			Parameter.ofEntry('clientCode', Schema.ofString('clientCode').setDefaultValue('')),
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
	.setDocumentation('# UIEngine.InitiateSocialLogin\n\nKicks off the SSO3 social-login flow by doing a top-level redirect to authzump\'s social-register evoke endpoint. The user is taken through the OAuth provider, and authzump\'s callback redirects them back to this app fully authenticated via the chained `/sso/{token}` flow.\n\n## Parameters\n\n- **platform** (String, required): `GOOGLE` or `META`\n- **redirectUrl** (String, optional): Where to land after social login completes. Defaults to the current page URL.\n- **appCode** (String, optional): Override the target app code. Defaults to the current app from `Store.application.appCode`.\n- **clientCode** (String, optional): Override the target client code. Defaults to the current app\'s client code or `SYSTEM`.\n\n## Events\n\n- **output**: Fires after navigation is initiated\n- **error**: Fires when SSO is not configured (no `__SSO_BEACON_HOST__` injected) or no app code is available\n\n## Notes\n\nRequires `application.properties.sso3 === true` so that `IndexHTMLService` injects the beacon host. If SSO isn\'t configured, this function emits an error event without navigating.');

export class InitiateSocialLogin extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const args = context.getArguments();
		const platformArg: string = args?.get('platform');
		const redirectUrlArg: string = args?.get('redirectUrl');
		const appCodeArg: string = args?.get('appCode');
		const clientCodeArg: string = args?.get('clientCode');

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

		const url = buildSocialLoginURL(
			platformArg,
			{ appCode, clientCode },
			redirectUrlArg || undefined,
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
