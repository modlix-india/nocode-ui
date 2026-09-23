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
	.setDescription('Sends a named analytics event to the analytics engine with optional properties.')
	.setDocumentation(
		'# UIEngine.TrackAnalyticsEvent\n\nCaptures a named analytics event through the page beacon (`window.mlx`). The site, page, session and campaign context are attached by the beacon and by the engine — a page never names its own site, so an event cannot be filed under another tenant.\n\nIf analytics is disabled for the application, or the visitor has not consented where consent is required, the call is a no-op.\n\n## Parameters\n\n- **eventName** (String, required): The event name to capture (e.g. `checkout_started`, `cta_clicked`). Stored exactly as given; only the page-view spellings are folded onto `$pageview`.\n- **properties** (Any, optional): Object/Map of additional properties to attach.\n\n## Events\n\n- **output**: Triggered after the capture call (always — capture is fire-and-forget).\n\n## Use Cases\n\n- **Funnel tracking**: Emit `signup_started`, `signup_completed`, `checkout_completed` from event flows, then read them with the Conversion Funnel widget.\n- **Feature instrumentation**: Tag specific KIRun-driven actions with stable event names.\n- **A/B test metrics**: Pair with an experiment and variant to measure impact.',
	);

export class TrackAnalyticsEvent extends AbstractFunction {
	protected async internalExecute(
		context: FunctionExecutionParameters,
	): Promise<FunctionOutput> {
		const eventName: string = context.getArguments()?.get('eventName');
		const properties = context.getArguments()?.get('properties');
		// The beacon installs a queue before it loads, so a capture fired during the first
		// paint is held rather than dropped. Absent entirely means analytics is off for this
		// app and there is nothing to send to.
		const mlx = (globalThis as any).mlx;
		if (eventName && typeof mlx === 'function') {
			mlx('capture', eventName, properties);
		}
		return new FunctionOutput([EventResult.outputOf(new Map())]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
