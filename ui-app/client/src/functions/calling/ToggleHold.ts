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

const SIGNATURE = new FunctionSignature('ToggleHold')
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
	.setDescription('Puts the call on hold, or takes it off hold')
	.setDocumentation(
		'# UIEngine.ToggleHold\n\nPuts the call on hold if it is not, and takes it off hold if it is.\n\n**A toggle, not a setting.** There is no "put on hold" and no "resume" - the calling provider offers only a toggle, and a parameter that silently did nothing half the time would be worse than an honest one. Bind the button\'s appearance to `Store.softphone.isOnHold`, which is updated as soon as the toggle takes effect.\n\nWorks from any browser tab; it relays to the tab holding the phone session.\n\n## Parameters\n\nNone.\n\n## Events\n\n- **output**: Triggered once the hold state has changed\n  - `result` (Any): The new hold state - true when the call is now on hold\n- **error**: Triggered when the call could not be held\n  - `data` (Any): The full error\n  - `code` (String): `NO_ACTIVE_CALL` when there is no call, `RELAY_TIMEOUT` when the tab holding the call did not respond\n  - `message` (String): Wording suitable for showing to the agent\n\n## Use Cases\n\n- **Hold button** on the in-call bar, with its label bound to `Store.softphone.isOnHold`',
	);

export class ToggleHold extends AbstractFunction {
	protected async internalExecute(
		_context: FunctionExecutionParameters,
	): Promise<FunctionOutput> {
		return runSoftphoneControl(phone => phone.toggleHold());
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
