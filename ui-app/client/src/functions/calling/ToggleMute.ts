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

const SIGNATURE = new FunctionSignature('ToggleMute')
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
	.setDescription("Mutes the agent's microphone, or unmutes it")
	.setDocumentation(
		"# UIEngine.ToggleMute\n\nMutes the agent's microphone if it is live, and unmutes it if it is muted. The customer is not muted - only the agent's own audio stops.\n\n**A toggle, not a setting**, for the same reason as hold: the calling provider offers nothing else. Bind the button's appearance to `Store.softphone.isMuted`.\n\nWorks from any browser tab; it relays to the tab holding the phone session.\n\n## Parameters\n\nNone.\n\n## Events\n\n- **output**: Triggered once the microphone state has changed\n  - `result` (Any): The new mute state - true when the microphone is now muted\n- **error**: Triggered when it could not be changed\n  - `data` (Any): The full error\n  - `code` (String): `NO_ACTIVE_CALL` when there is no call, `RELAY_TIMEOUT` when the tab holding the call did not respond\n  - `message` (String): Wording suitable for showing to the agent\n\n## Notes\n\nMute only means anything during a call, and asking for it without one is reported as an error rather than ignored - a mute button that appears to work while the microphone is still live is worth failing loudly for.\n\n## Use Cases\n\n- **Mute button** on the in-call bar, with its icon bound to `Store.softphone.isMuted`",
	);

export class ToggleMute extends AbstractFunction {
	protected async internalExecute(
		_context: FunctionExecutionParameters,
	): Promise<FunctionOutput> {
		return runSoftphoneControl(phone => phone.toggleMute());
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
