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

const SIGNATURE = new FunctionSignature('SendDTMF')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(new Map([Parameter.ofEntry('digit', Schema.ofString('digit'))]))
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
	.setDescription('Presses a keypad key on the call in progress')
	.setDocumentation(
		'# UIEngine.SendDTMF\n\nSends one keypad tone down the call, as though the agent had pressed a key on a desk phone. Used to work through an automated menu on the far end - "press 1 for accounts", extension numbers, conference PINs.\n\nOne key per call of this function. To send a sequence, call it once per key.\n\n## Parameters\n\n- **digit** (String, required): A single key. One of `0`-`9`, `*` or `#`. Anything else is rejected\n\n## Events\n\n- **output**: Triggered once the tone has been sent\n  - `result` (Any): True when the tone was sent\n- **error**: Triggered when it could not be sent\n  - `data` (Any): The full error\n  - `code` (String): `NO_ACTIVE_CALL` when there is no call or the key is not a valid one, `RELAY_TIMEOUT` when the tab holding the call did not respond\n  - `message` (String): Wording suitable for showing to the agent\n\n## Use Cases\n\n- **Keypad** on the in-call bar, one button per key\n- **Navigating an IVR** on an outbound call to a business number\n- **Entering a conference PIN** without the agent having to read it out',
	);

/**
 * Worth having despite being absent from the vendor's own documentation.
 *
 * It is the only control that can reach past the far end's automated menu, and on a CRM that dials
 * businesses that is the difference between a call the agent can complete and one they cannot.
 */
export class SendDTMF extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const digit: string = context.getArguments()?.get('digit');
		return runSoftphoneControl(phone => phone.sendDtmf(digit));
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
