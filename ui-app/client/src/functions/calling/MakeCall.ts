import {
	AbstractFunction,
	Event,
	FunctionExecutionParameters,
	FunctionOutput,
	FunctionSignature,
	Parameter,
	isNullValue,
	Schema,
	SchemaType,
} from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../../constants';
import { runSoftphoneControl } from './callFunctionUtil';

const SIGNATURE = new FunctionSignature('MakeCall')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			// A deal's id is a number (`Page.ticket.id`) while its `code` is a string; the backend
			// accepts either.
			Parameter.ofEntry(
				'ticketId',
				Schema.of('ticketId', SchemaType.STRING, SchemaType.INTEGER, SchemaType.LONG),
			),
			Parameter.ofEntry(
				'connectionName',
				Schema.ofString('connectionName').setDefaultValue(''),
			),
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
	.setDescription("Calls a deal's customer from the agent's browser softphone")
	.setDocumentation(
		"# UIEngine.MakeCall\n\nPlaces a call to the customer on a deal, using the agent's browser softphone.\n\n**Takes a deal, not a phone number.** There is no way to dial an arbitrary number, and that is deliberate: the server reads the customer's number from the deal under the signed-in agent's own access, so an agent can only ring customers of deals they can already see. The number never passes through the page.\n\nThe call is recorded against the deal before it is dialled, so the duration and the recording land on the right deal even if the agent closes the tab mid-call.\n\n## Parameters\n\n- **ticketId** (String or Number, required): The deal to call. Bind it straight to `Page.ticket.id`, which is a number - no conversion needed. The deal's `code` string is accepted too\n- **connectionName** (String, optional): The calling connection to use. Defaults to the Softphone's own - the one its component is configured with or, when that is left empty, the signed-in agent's - which is almost always what you want\n\n## Events\n\n- **output**: Triggered once the provider has accepted the call\n  - `result` (Any): The call record, including its status\n- **error**: Triggered when the call could not be placed\n  - `data` (Any): The full error\n  - `code` (String): `DIAL_REJECTED` when the deal has no number or the provider refused, `NOT_PROVISIONED` when this user cannot make browser calls\n  - `message` (String): Wording suitable for showing to the agent\n\n## Notes\n\nAudio arrives in whichever browser tab holds the phone session, which may not be the tab the agent clicked in. Bind to `Store.softphone.isLeader` if the page needs to say so.\n\nThe recording is **not** available when the call ends - it reaches the server minutes later. Read it from the deal's call log instead.\n\n## Use Cases\n\n- **Call button on a deal**: The ordinary case, bound to the deal on screen\n- **Call from a list**: Pass the row's deal id\n- **Follow-up actions**: Dial as one step of a larger flow, branching on the error event when it fails",
	);

/**
 * Dials through our backend, never the provider's SDK, whose calls carry no deal or caller ID.
 * Not a security boundary (the browser holds a provider credential); it keeps calls attributable.
 */
export class MakeCall extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const ticketId = context.getArguments()?.get('ticketId');
		const connectionName: string = context.getArguments()?.get('connectionName');

		return runSoftphoneControl(phone =>
			phone.dial(isNullValue(ticketId) ? '' : String(ticketId), connectionName || undefined),
		);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
