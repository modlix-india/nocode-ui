import {
	AbstractFunction,
	Event,
	EventResult,
	FunctionExecutionParameters,
	FunctionOutput,
	FunctionSignature,
	Schema,
} from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../constants';
import { getConsentState, publishConsentState } from '../App/analyticsConsent';

const SIGNATURE = new FunctionSignature('GetAnalyticsConsent')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setEvents(
		new Map([
			Event.eventMapEntry(
				Event.OUTPUT,
				new Map([
					['status', Schema.ofString('status')],
					['decided', Schema.ofBoolean('decided')],
					['required', Schema.ofBoolean('required')],
					['enabled', Schema.ofBoolean('enabled')],
					['shouldAsk', Schema.ofBoolean('shouldAsk')],
					['categories', Schema.ofAny('categories')],
				]),
			),
		]),
	)
	.setDescription("Reads this browser's analytics consent decision.")
	.setDocumentation(
		'# UIEngine.GetAnalyticsConsent\n\nReads the analytics consent decision stored for this browser, together with the application-level analytics settings that decide whether a decision is needed at all.\n\nThe same values are mirrored at `Store.analyticsConsent`, which is usually the better thing to bind a component\'s visibility to — it updates on its own when the decision changes, whereas this function returns a snapshot.\n\n## Events\n\n- **output**:\n  - **status** (String): `granted`, `denied`, or empty when nothing has been decided.\n  - **decided** (Boolean): false while the visitor has not answered.\n  - **required** (Boolean): always true. Consent is unconditional — there is no application setting that turns asking off. Kept in the output so pages that bind to it keep working.\n  - **enabled** (Boolean): the app\'s `analytics.enabled`.\n  - **shouldAsk** (Boolean): `enabled && !decided` — the one value a consent page needs.\n  - **categories** (Object): `{ necessary, analytics, marketing }`. Once **decided** is true these are the stored choice. Before that they are the defaults a preferences panel should show — every category on, for the visitor to switch off what they do not want. They are not a statement that anything has been consented to; nothing is captured until `UIEngine.SetAnalyticsConsent` is called.\n\n## Use Cases\n\n- **Show the consent box**: bind the box\'s visibility to `Store.analyticsConsent.shouldAsk`, or branch on this output in an onLoad event.\n- **Pre-tick a preferences panel**: seed the toggles from `categories` when reopening the panel for someone who already chose.\n- **Hide a "manage cookies" link** on apps where `enabled` is false.',
	);

export class GetAnalyticsConsent extends AbstractFunction {
	protected async internalExecute(_: FunctionExecutionParameters): Promise<FunctionOutput> {
		// Republish first: the app definition may have landed after the last
		// publish, which would leave `enabled`/`required` stale.
		publishConsentState();
		const state = getConsentState();

		return new FunctionOutput([
			EventResult.outputOf(
				new Map<string, any>([
					['status', state.status ?? ''],
					['decided', state.decided],
					['required', state.required],
					['enabled', state.enabled],
					['shouldAsk', state.enabled && state.required && !state.decided],
					['categories', state.categories],
				]),
			),
		]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
