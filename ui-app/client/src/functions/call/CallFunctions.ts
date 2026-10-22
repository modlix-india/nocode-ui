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
import { GLOBAL_CONTEXT_NAME, NAMESPACE_UI_ENGINE } from '../../constants';
import { PageStoreExtractor } from '../../context/StoreContext';
import * as session from './session';
import { CallState } from './types';

export const NAMESPACE_CALL = `${NAMESPACE_UI_ENGINE}.Call`;

const EVENTS = new Map([
	Event.eventMapEntry(Event.OUTPUT, new Map([['state', Schema.ofAny('state')]])),
	Event.eventMapEntry(
		Event.ERROR,
		new Map([
			['error', Schema.ofString('error')],
			['state', Schema.ofAny('state')],
		]),
	),
]);

const EVENTS_DOC =
	'## Events\n\n- **output**: The action was accepted\n  - `state` (Any): the call state after it\n- **error**: The action failed; `output` does not fire\n  - `error` (String): why\n  - `state` (Any): the call state, with the same `error`\n\n';

const STATE_DOC =
	"## Call state\n\nWritten, whole, to the `statePath` given to Connect on every change:\n\n- `status`: `idle`, `registering`, `ready`, `ringing`, `connected`, `ended` or `error`\n- `callId`: the provider's id for the current call\n- `direction`: `inbound` or `outbound`\n- `from`, `to`: the numbers, when the provider reports them\n- `muted`: true while the microphone is muted\n- `startedAt`: epoch milliseconds when the call connected\n- `error`: the last failure, as text\n\n";

function signature(name: string, parameters: Array<[string, Parameter]>, description: string) {
	return new FunctionSignature(name)
		.setNamespace(NAMESPACE_CALL)
		.setParameters(new Map(parameters))
		.setEvents(EVENTS)
		.setDescription(description);
}

abstract class CallFunction extends AbstractFunction {
	protected abstract run(context: FunctionExecutionParameters): Promise<CallState>;

	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		try {
			const state = await this.run(context);
			return new FunctionOutput([EventResult.outputOf(new Map([['state', state]]))]);
		} catch (error: any) {
			const message = error?.message ?? String(error);
			return new FunctionOutput([
				EventResult.of(
					Event.ERROR,
					new Map<string, any>([
						['error', message],
						['state', session.activeCallState() ?? { status: 'error', error: message }],
					]),
				),
			]);
		}
	}
}

const CONNECT = signature(
	'Connect',
	[
		Parameter.ofEntry('provider', Schema.ofString('provider')),
		Parameter.ofEntry('credentials', Schema.ofAny('credentials')),
		Parameter.ofEntry('statePath', Schema.ofString('statePath')),
	],
	"Signs the agent in to a calling provider's web SDK so this browser can take and place calls",
).setDocumentation(
	"# UIEngine.Call.Connect\n\nLoads the provider's web SDK (only now, from its CDN), signs the agent in with the credentials and keeps the call state at `statePath`. One connection per browser tab: a second Connect replaces the first, and is refused while a call is in progress. The connection survives navigation between pages.\n\n## Parameters\n\n- **provider** (String, required): `exotel` or `telecmi`\n- **credentials** (Any, required): the agent's SDK credentials, fetched by a server function just before Connect. They are handed to the SDK and never written to the store or to browser storage. Keep them out of page definitions.\n  - Exotel: `userName`, `secret` (SIP password), `sipdomain`, `domain` (host:port of the WebSocket server), optional `authUser` (defaults to userName), `port` (default 443), `displayName`, `security` (default `wss`)\n  - TeleCMI: `userId`, `password`, optional `region` (the SBC host, for example `sbcind.telecmi.com`; the SDK defaults to `sbcsg.telecmi.com`), `name`, `ringTime` (seconds)\n- **statePath** (String, required): where the call state lives, for example `Store.call`\n\n" +
		EVENTS_DOC +
		STATE_DOC +
		"## Notes\n\n- The SDK and media domains must be allowed in the app's Content Security Policy when the app sets one.\n- Microphone access needs HTTPS and is asked for on the first call.",
);

export class Connect extends CallFunction {
	protected run(context: FunctionExecutionParameters): Promise<CallState> {
		const args = context.getArguments();
		const tve = context.getValuesMap?.()?.get('Page.') as PageStoreExtractor | undefined;
		return session.connect(
			args?.get('provider'),
			args?.get('credentials'),
			args?.get('statePath'),
			tve?.getPageName?.() ?? GLOBAL_CONTEXT_NAME,
		);
	}

	getSignature(): FunctionSignature {
		return CONNECT;
	}
}

const ANSWER = signature(
	'Answer',
	[Parameter.ofEntry('callId', Schema.ofString('callId').setDefaultValue(''))],
	'Answers the incoming call that is ringing in this browser',
).setDocumentation(
	'# UIEngine.Call.Answer\n\nAnswers the ringing incoming call. Needs a Connect first and a state of `ringing` with direction `inbound`; the state moves to `connected` when the provider confirms.\n\n## Parameters\n\n- **callId** (String, optional): answer only if the ringing call has this id\n\n' +
		EVENTS_DOC,
);

export class Answer extends CallFunction {
	protected run(context: FunctionExecutionParameters): Promise<CallState> {
		return session.answer(context.getArguments()?.get('callId') || undefined);
	}

	getSignature(): FunctionSignature {
		return ANSWER;
	}
}

const HANGUP = signature(
	'Hangup',
	[Parameter.ofEntry('callId', Schema.ofString('callId').setDefaultValue(''))],
	'Ends the current call, or rejects it while it is still ringing',
).setDocumentation(
	'# UIEngine.Call.Hangup\n\nEnds the connected call, or rejects a ringing one. The state moves to `ended`.\n\n## Parameters\n\n- **callId** (String, optional): hang up only if the current call has this id\n\n' +
		EVENTS_DOC,
);

export class Hangup extends CallFunction {
	protected run(context: FunctionExecutionParameters): Promise<CallState> {
		return session.hangup(context.getArguments()?.get('callId') || undefined);
	}

	getSignature(): FunctionSignature {
		return HANGUP;
	}
}

const MUTE = signature(
	'Mute',
	[Parameter.ofEntry('on', Schema.ofBoolean('on').setDefaultValue(true))],
	"Mutes or unmutes the agent's microphone on the connected call",
).setDocumentation(
	'# UIEngine.Call.Mute\n\nMutes (`on` true) or unmutes (`on` false) the microphone on the connected call and sets `muted` in the state.\n\n## Parameters\n\n- **on** (Boolean, optional, default: true)\n\n' +
		EVENTS_DOC,
);

export class Mute extends CallFunction {
	protected run(context: FunctionExecutionParameters): Promise<CallState> {
		return session.mute(context.getArguments()?.get('on') !== false);
	}

	getSignature(): FunctionSignature {
		return MUTE;
	}
}

const DISCONNECT = signature(
	'Disconnect',
	[],
	'Signs the agent out of the calling provider and resets the call state to idle',
).setDocumentation(
	'# UIEngine.Call.Disconnect\n\nSigns out of the provider\'s SDK, releases its connection and writes `{ status: "idle", muted: false }` to the statePath. Does nothing when there is no connection.\n\n' +
		EVENTS_DOC,
);

export class Disconnect extends CallFunction {
	protected run(): Promise<CallState> {
		return session.disconnect();
	}

	getSignature(): FunctionSignature {
		return DISCONNECT;
	}
}
