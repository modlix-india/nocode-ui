import {
	AbstractFunction,
	Event,
	FunctionExecutionParameters,
	FunctionOutput,
	FunctionSignature,
	Parameter,
	Schema,
} from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../../constants';
import { runSoftphoneControl } from './callFunctionUtil';

const SIGNATURE = new FunctionSignature('SetSoftphoneAvailability')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			Parameter.ofEntry('available', Schema.ofBoolean('available').setDefaultValue(true)),
		]),
	)
	.setEvents(
		new Map([
			Event.eventMapEntry(Event.OUTPUT, new Map([['result', Schema.ofAny('result')]])),
			Event.eventMapEntry(
				Event.ERROR,
				new Map([
					['data', Schema.ofAny('data')],
					['code', Schema.ofString('code')],
					['message', Schema.ofString('message')],
				]),
			),
		]),
	)
	.setDescription('Takes the agent online or offline for browser calls')
	.setDocumentation(
		"# UIEngine.SetSoftphoneAvailability\n\nTakes the agent online or offline for calls in the browser.\n\nGoing offline does not stop the agent being reachable. Calls fall through to their desk phone after the normal ringing wait, which is what should happen when someone has stepped away from their computer. Going back online makes the browser ring first again.\n\nWithout this, the only way for an agent to stop their computer ringing is to close every tab.\n\n## Parameters\n\n- **available** (Boolean, optional, default: true): True to take calls in the browser, false to stop\n\n## Events\n\n- **output**: Triggered once the change has taken effect\n  - `result` (Any): The new availability\n- **error**: Triggered when it could not be changed\n  - `data` (Any): The full error\n  - `code` (String): `NOT_PROVISIONED` when this user cannot take browser calls, `RELAY_TIMEOUT` when the tab holding the phone did not respond\n  - `message` (String): Wording suitable for showing to the agent\n\n## Notes\n\nBind the control to `Store.softphone.registered` rather than tracking availability separately - that is the phone's own account of whether it is online, and it also changes when the connection drops for reasons the agent did not choose.\n\nThis does not end a call in progress.\n\n## Use Cases\n\n- **Available / Away toggle** in the app header\n- **Going offline at the end of a shift** without closing the CRM",
	);

export class SetSoftphoneAvailability extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const available: boolean = context.getArguments()?.get('available');
		return runSoftphoneControl(phone => phone.setAvailability(available !== false));
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
