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

const SIGNATURE = new FunctionSignature('AnswerCall')
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
	.setDescription('Answers the incoming call')
	.setDocumentation(
		'# UIEngine.AnswerCall\n\nAnswers the call that is currently ringing.\n\nWorks from any browser tab. When the agent has several tabs open, only one of them holds the phone session; this relays the request to that tab and waits for it to confirm, so the button works wherever the agent happens to be looking. The audio comes out of the tab holding the session, which may be a different one.\n\n## Parameters\n\nNone. There is only ever one call to answer.\n\n## Events\n\n- **output**: Triggered once the call has been answered\n  - `result` (Any): True when the call was answered\n- **error**: Triggered when it could not be answered\n  - `data` (Any): The full error\n  - `code` (String): `NO_ACTIVE_CALL` when nothing is ringing, `RELAY_TIMEOUT` when the tab holding the call did not respond, `NOT_PROVISIONED` when this user cannot take browser calls\n  - `message` (String): Wording suitable for showing to the agent\n\n## Use Cases\n\n- **Accept button** on the incoming-call popup\n- **Keyboard shortcut** for answering without reaching for the mouse',
	);

export class AnswerCall extends AbstractFunction {
	protected async internalExecute(
		_context: FunctionExecutionParameters,
	): Promise<FunctionOutput> {
		return runSoftphoneControl(phone => phone.answer());
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
