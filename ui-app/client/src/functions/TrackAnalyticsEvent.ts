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

const SIGNATURE = new FunctionSignature('TrackAnalyticsEvent')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			Parameter.ofEntry('eventName', Schema.ofString('eventName')),
			Parameter.ofEntry('properties', Schema.ofAny('properties').setDefaultValue(null)),
		]),
	)
	.setEvents(new Map([Event.eventMapEntry(Event.OUTPUT, new Map())]))
	.setDescription('Sends a named analytics event to PostHog with optional properties.')
	.setDocumentation(
		'# UIEngine.TrackAnalyticsEvent\n\nCaptures a named analytics event via the page-level PostHog client (`window.posthog.capture`). The event is augmented with the super properties already registered by the framework (`app_code`, `client_code`, `url_client_code`, `page_name`).\n\nIf analytics is disabled for the application, or the user has not opted in, the call is a no-op.\n\n## Parameters\n\n- **eventName** (String, required): The event name to capture (e.g. `checkout_started`, `cta_clicked`).\n- **properties** (Any, optional): Object/Map of additional properties to attach to the event.\n\n## Events\n\n- **output**: Triggered after the capture call (always — capture is fire-and-forget).\n\n## Use Cases\n\n- **Funnel tracking**: Emit `signup_started`, `signup_completed`, `checkout_completed` from event flows.\n- **Feature instrumentation**: Tag specific KIRun-driven actions with stable event names.\n- **A/B test metrics**: Pair with feature flags to measure variant impact.',
	);

export class TrackAnalyticsEvent extends AbstractFunction {
	protected async internalExecute(
		context: FunctionExecutionParameters,
	): Promise<FunctionOutput> {
		const eventName: string = context.getArguments()?.get('eventName');
		const properties = context.getArguments()?.get('properties');
		const ph = (globalThis as any).posthog;
		if (eventName && ph?.capture) {
			ph.capture(eventName, properties);
		}
		return new FunctionOutput([EventResult.outputOf(new Map())]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
