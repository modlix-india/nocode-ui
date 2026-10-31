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

const SIGNATURE = new FunctionSignature('GetPushStatus')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setEvents(
		new Map([
			Event.eventMapEntry(Event.OUTPUT, new Map([['status', Schema.ofString('status')]])),
		]),
	)
	.setDescription('Whether push notifications are on for this device, without asking the user.')
	.setDocumentation(
		'# UIEngine.GetPushStatus\n\nReads whether this browser or phone shows push notifications, without asking the user anything.\n\n## Events\n\n- **output**:\n  - **status** (String): `granted` (on), `denied` (turned off by the user), `default` (not asked yet) or `unsupported` (no push here).\n\n## Use Cases\n\n- **Show an Enable notifications button** only while the status is `default` (or `denied`, with a hint to change it in the settings).',
	);

export class GetPushStatus extends AbstractFunction {
	protected async internalExecute(_: FunctionExecutionParameters): Promise<FunctionOutput> {
		let status = 'unsupported';
		try {
			const { pushStatus } = await import(
				/* webpackChunkName: "PushRegistration" */ '../util/pushRegistration'
			);
			status = await pushStatus();
		} catch (e) {
			// A shell without the push handler, or no push at all: unsupported.
		}
		return new FunctionOutput([EventResult.outputOf(new Map([['status', status]]))]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
