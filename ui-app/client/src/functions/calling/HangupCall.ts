import {
	AbstractFunction,
	Event,
	FunctionExecutionParameters,
	FunctionOutput,
	FunctionSignature,
	Schema,
} from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../../constants';
import { runSoftphoneControl } from './callFunctionUtil';

const SIGNATURE = new FunctionSignature('HangupCall')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(new Map())
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
	.setDescription('Ends the call in progress')
	.setDocumentation(
		"# UIEngine.HangupCall\n\nEnds the call currently in progress, whether it was answered or is still ringing.\n\nWorks from any browser tab: when the agent has several open, this relays to the one holding the phone session and waits for it to confirm. It reports failure rather than reporting success optimistically, because a hangup that quietly did nothing is indistinguishable to the agent from a call that will not end.\n\n## Parameters\n\nNone.\n\n## Events\n\n- **output**: Triggered once the call has ended\n  - `result` (Any): True when the call was ended\n- **error**: Triggered when it could not be ended\n  - `data` (Any): The full error\n  - `code` (String): `NO_ACTIVE_CALL` when there is no call, `RELAY_TIMEOUT` when the tab holding the call did not respond, `NOT_PROVISIONED` when this user cannot take browser calls\n  - `message` (String): Wording suitable for showing to the agent\n\n## Notes\n\nThe call record, its duration and its recording are written by the server from the provider's own report, which arrives after the call ends. Do not read them in the same flow as this function - read them from the deal's call log.\n\n## Use Cases\n\n- **End call button** on the in-call bar\n- **Reject button** on the incoming-call popup",
	);

export class HangupCall extends AbstractFunction {
	protected async internalExecute(
		_context: FunctionExecutionParameters,
	): Promise<FunctionOutput> {
		return runSoftphoneControl(phone => phone.hangup());
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
