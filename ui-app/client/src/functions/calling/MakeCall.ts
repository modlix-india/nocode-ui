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

const SIGNATURE = new FunctionSignature('MakeCall')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			Parameter.ofEntry('ticketId', Schema.ofString('ticketId')),
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
		"# UIEngine.MakeCall\n\nPlaces a call to the customer on a deal, using the agent's browser softphone.\n\n**Takes a deal, not a phone number.** There is no way to dial an arbitrary number, and that is deliberate: the server reads the customer's number from the deal under the signed-in agent's own access, so an agent can only ring customers of deals they can already see. The number never passes through the page.\n\nThe call is recorded against the deal before it is dialled, so the duration and the recording land on the right deal even if the agent closes the tab mid-call.\n\n## Parameters\n\n- **ticketId** (String, required): The deal to call. Usually bound to `Page.ticket.id`\n- **connectionName** (String, optional): The calling connection to use. Defaults to the one the Softphone component on this page is configured with, which is almost always what you want\n\n## Events\n\n- **output**: Triggered once the provider has accepted the call\n  - `result` (Any): The call record, including its status\n- **error**: Triggered when the call could not be placed\n  - `data` (Any): The full error\n  - `code` (String): `DIAL_REJECTED` when the deal has no number or the provider refused, `NOT_PROVISIONED` when this user cannot make browser calls\n  - `message` (String): Wording suitable for showing to the agent\n\n## Notes\n\nAudio arrives in whichever browser tab holds the phone session, which may not be the tab the agent clicked in. Bind to `Store.softphone.isLeader` if the page needs to say so.\n\nThe recording is **not** available when the call ends - it reaches the server minutes later. Read it from the deal's call log instead.\n\n## Use Cases\n\n- **Call button on a deal**: The ordinary case, bound to the deal on screen\n- **Call from a list**: Pass the row's deal id\n- **Follow-up actions**: Dial as one step of a larger flow, branching on the error event when it fails",
	);

/**
 * Dialling goes through our own backend, never through the provider's SDK.
 *
 * The SDK can place a call, but its request carries no deal and no caller ID, so a call placed
 * that way arrives in the CRM attached to nothing. Going through the server is also what keeps the
 * deal check: the browser holds a credential that could reach the provider directly, so this is
 * not a security boundary - it is what makes every call placed through the UI attributable.
 */
export class MakeCall extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const ticketId: string = context.getArguments()?.get('ticketId');
		const connectionName: string = context.getArguments()?.get('connectionName');

		return runSoftphoneControl(phone => phone.dial(ticketId, connectionName || undefined));
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
