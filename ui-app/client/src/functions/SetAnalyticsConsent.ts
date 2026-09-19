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
import { ConsentCategories, resetConsent, setConsent } from '../App/analyticsConsent';

const SIGNATURE = new FunctionSignature('SetAnalyticsConsent')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			Parameter.ofEntry('granted', Schema.ofBoolean('granted').setDefaultValue(false)),
			Parameter.ofEntry('analytics', Schema.ofAny('analytics').setDefaultValue(null)),
			Parameter.ofEntry('marketing', Schema.ofAny('marketing').setDefaultValue(null)),
			Parameter.ofEntry('reset', Schema.ofBoolean('reset').setDefaultValue(false)),
		]),
	)
	.setEvents(
		new Map([
			Event.eventMapEntry(
				Event.OUTPUT,
				new Map([
					['status', Schema.ofString('status')],
					['decided', Schema.ofBoolean('decided')],
					['categories', Schema.ofAny('categories')],
				]),
			),
		]),
	)
	.setDescription("Records this browser's analytics consent decision and applies it to PostHog.")
	.setDocumentation(
		'# UIEngine.SetAnalyticsConsent\n\nRecords a consent decision for this browser and immediately applies it: granting opts PostHog in, denying opts it out.\n\nThe decision is written to `localStorage` with a cookie fallback and survives sign out, because consent belongs to the browser rather than to the account. `Store.analyticsConsent` is refreshed, so a consent box bound to `Store.analyticsConsent.shouldAsk` hides itself.\n\n## Parameters\n\n- **granted** (Boolean, default false): the headline answer. True grants every category, false grants none; `analytics` and `marketing` below override individual ones.\n- **analytics** (Boolean, optional): override the analytics category alone. This is the one that gates PostHog.\n- **marketing** (Boolean, optional): override the marketing category alone. The choice is stored and readable, but no advertising pixel consumes it yet.\n- **reset** (Boolean, default false): forget the decision instead of recording one, opt out, and let the consent page appear again. Use this for a "change your cookie preferences" link. Every other parameter is ignored.\n\n## Events\n\n- **output**:\n  - **status** (String): `granted`, `denied`, or empty after a reset.\n  - **decided** (Boolean)\n  - **categories** (Object): `{ necessary, analytics, marketing }`\n\n## Notes\n\nGranting with every category turned off is stored as a denial — there is nothing to consent to.\n\n`necessary` is always true and cannot be turned off. It exists so a preferences panel can show it switched on and disabled.\n\n## Use Cases\n\n- **Accept all**: `granted = true`.\n- **Reject all**: `granted = false`.\n- **Save preferences**: `granted = true, analytics = Page.prefs.analytics, marketing = Page.prefs.marketing`.\n- **Change preferences later**: `reset = true`, then show the panel again.',
	);

function asBoolean(v: any): boolean | undefined {
	if (v === null || v === undefined || v === '') return undefined;
	if (typeof v === 'boolean') return v;
	if (typeof v === 'string') return v.toLowerCase() === 'true';
	return !!v;
}

export class SetAnalyticsConsent extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const args = context.getArguments();

		if (args?.get('reset') === true) {
			const cleared = resetConsent();
			return new FunctionOutput([
				EventResult.outputOf(
					new Map<string, any>([
						['status', ''],
						['decided', cleared.decided],
						['categories', cleared.categories],
					]),
				),
			]);
		}

		const granted: boolean = !!args?.get('granted');

		// A parameter left unset means "follow `granted`", which is not the same
		// as an explicit false, so the overrides are only applied when present.
		const overrides: Partial<ConsentCategories> = {};
		const analytics = asBoolean(args?.get('analytics'));
		if (analytics !== undefined) overrides.analytics = analytics;
		const marketing = asBoolean(args?.get('marketing'));
		if (marketing !== undefined) overrides.marketing = marketing;

		const state = setConsent(granted, overrides);

		return new FunctionOutput([
			EventResult.outputOf(
				new Map<string, any>([
					['status', state.status ?? ''],
					['decided', state.decided],
					['categories', state.categories],
				]),
			),
		]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
