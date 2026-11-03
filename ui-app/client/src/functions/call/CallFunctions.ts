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
	'## Call state\n\nWritten, whole, to the `statePath` given to Connect on every change:\n\n- `status`: `idle`, `registering`, `ready`, `ringing`, `connected`, `ended` or `error`\n- `callId`: the provider\'s id for the current call\n- `direction`: `inbound` or `outbound`\n- `from`, `to`: the numbers, when the provider reports them\n- `muted`: true while the microphone is muted\n- `startedAt`: epoch milliseconds when the call connected\n- `endedAt`: epoch milliseconds when the call ended\n- `endReason`: `pageClosed` when the tab holding the call closed or reloaded (a browser call cannot outlive its page)\n- `otherTab`: true in a tab that only mirrors the call; its audio is in another tab of the site\n- `soundOn`: the user\'s call sounds setting (see `UIEngine.Call.Sound`)\n- `audioBlocked`: true while a ring is due and the browser blocks audio until the user taps the page; show a "Tap to enable sound" control that runs `UIEngine.Call.Sound` with `unlock` true\n- `ringBack`: true while the call here is the leg of a call the user placed and the far end has not answered\n- `alertsOffer`: true while the user has not answered whether this site may show notifications; the call card can offer \"Allow call alerts\" that runs `UIEngine.Call.Alert` with `allow` true (see Alert). Always true or false, so a page can tell that the engine in this browser has call alerts\n- `error`: the last failure, as text\n\n';

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
	"# UIEngine.Call.Connect\n\nLoads the provider's web SDK (only now, from its CDN), signs the agent in with the credentials and keeps the call state at `statePath`. One connection per browser tab: a second Connect replaces the first, and is refused while a call is in progress. The connection survives navigation between pages.\n\nTabs: the provider keeps one sign in per agent, so only one tab of the site signs in and holds the audio. Every other tab that runs Connect mirrors that tab's call state (with `otherTab: true`) and sends Answer, Mute and Hangup to it; when that tab closes, another one signs in. While a call is up, the tab holding it asks before the page is left or reloaded, ends the call if it is, and after the reload the state shows that call as `ended` with `endReason: pageClosed`. Without Web Locks or BroadcastChannel in the browser every tab signs in on its own.\n\n## Parameters\n\n- **provider** (String, required): `exotel` or `telecmi`\n- **credentials** (Any, required): the agent's SDK credentials, fetched by a server function just before Connect. They are handed to the SDK and never written to the store or to browser storage. Keep them out of page definitions.\n  - Exotel: `userName`, `secret` (SIP password), `sipdomain`, `domain` (host:port of the WebSocket server), optional `authUser` (defaults to userName), `port` (default 443), `displayName`, `security` (default `wss`)\n  - TeleCMI: `userId`, `password`, optional `region` (the SBC host, for example `sbcind.telecmi.com`; the SDK defaults to `sbcsg.telecmi.com`), `name`, `ringTime` (seconds)\n- **statePath** (String, required): where the call state lives, for example `Store.call`\n\n" +
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
	[
		Parameter.ofEntry('callId', Schema.ofString('callId').setDefaultValue('')),
		Parameter.ofEntry('ringBack', Schema.ofBoolean('ringBack').setDefaultValue(false)),
	],
	'Answers the incoming call that is ringing in this browser',
).setDocumentation(
	'# UIEngine.Call.Answer\n\nAnswers the ringing incoming call. Needs a Connect first and a state of `ringing` with direction `inbound`; the state moves to `connected` when the provider confirms. The incoming ring stops when Answer runs.\n\n## Parameters\n\n- **callId** (String, optional): answer only if the ringing call has this id\n- **ringBack** (Boolean, optional, default: false): true when this is the browser leg of a call the user placed (click to call rings the browser first and the page answers it). The ring back then plays, instead of the incoming ring, until `UIEngine.Call.Sound` with `ringBack` false says the far end answered, or the call ends\n\n' +
		EVENTS_DOC,
);

export class Answer extends CallFunction {
	protected run(context: FunctionExecutionParameters): Promise<CallState> {
		const args = context.getArguments();
		return session.answer(args?.get('callId') || undefined, args?.get('ringBack') === true);
	}

	getSignature(): FunctionSignature {
		return ANSWER;
	}
}

const HANGUP = signature(
	'Hangup',
	[
		Parameter.ofEntry('callId', Schema.ofString('callId').setDefaultValue('')),
		Parameter.ofEntry('dismiss', Schema.ofBoolean('dismiss').setDefaultValue(false)),
	],
	'Ends the current call, or rejects it while it is still ringing',
).setDocumentation(
	"# UIEngine.Call.Hangup\n\nEnds the connected call, or rejects a ringing one. The state moves to `ended`.\n\n## Parameters\n\n- **callId** (String, optional): hang up only if the current call has this id\n- **dismiss** (Boolean, optional, default: false): true from a Close on the ended call's summary. When the call has ended, the call leaves the state (status `ready`) in every tab of the site, so its summary goes away everywhere and does not come back on another page or after a reload. Nothing is hung up: with `dismiss` a call that is up (a new one that started meanwhile) is left alone\n\n" +
		EVENTS_DOC,
);

export class Hangup extends CallFunction {
	protected run(context: FunctionExecutionParameters): Promise<CallState> {
		const args = context.getArguments();
		return session.hangup(args?.get('callId') || undefined, args?.get('dismiss') === true);
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

const SOUND = signature(
	'Sound',
	[
		Parameter.ofEntry('on', Schema.ofAny('on')),
		Parameter.ofEntry('unlock', Schema.ofBoolean('unlock').setDefaultValue(false)),
		Parameter.ofEntry('ringBack', Schema.ofAny('ringBack')),
		Parameter.ofEntry('preview', Schema.ofString('preview').setDefaultValue('')),
		Parameter.ofEntry('ringtone', Schema.ofString('ringtone').setDefaultValue('')),
	],
	'Call sounds: turns them on or off for the user, lets the browser play them, or previews a tone',
).setDocumentation(
	"# UIEngine.Call.Sound\n\nThe call engine plays the call sounds by itself, on every page, from the state of the call in this browser: an incoming ring while an incoming call rings (it starts 0.7 s late and stops when Answer runs or the call is answered, declined or ends), a ring back while a call the user placed is being dialled, and a short tone once when a call ends. Only the tab that holds the call plays them, and only for calls the provider rings in this browser: a call routed to a phone never rings here. This function changes how they play.\n\n## Parameters\n\n- **on** (Boolean, optional): true or false turns call sounds on or off for the signed in user, in every tab, remembered in this browser. The call card still shows the call while sounds are off. Leave empty to keep the setting. The state's `soundOn` shows it\n- **unlock** (Boolean, optional, default: false): browsers block audio until the user interacts with the page; while a ring is due and blocked the state has `audioBlocked: true`. Run Sound with `unlock` true from a click (\"Tap to enable sound\") and the ring starts. In a tab that does not hold the call, the call's sounds then play in this tab\n- **ringBack** (Boolean, optional): false when the far end of a call the user placed answered (the ring back stops); true marks the call here as one the user placed. See also Answer's `ringBack`\n- **preview** (String, optional): `incoming`, `ringBack` or `end` plays that tone with no call (`end` once, the others until `stop`); for test pages\n- **ringtone** (String, optional): the URL of the incoming ring file; default `" +
		'/api/files/static/file/SYSTEM/jslib/exotelBundle/ringtone.wav`. When it cannot be played a generated ring plays\n\n' +
		EVENTS_DOC +
		STATE_DOC,
);

export class Sound extends CallFunction {
	protected run(context: FunctionExecutionParameters): Promise<CallState> {
		const args = context.getArguments();
		const bool = (v: any) =>
			v === true || v === 'true' ? true : v === false || v === 'false' ? false : undefined;
		return session.sound({
			on: bool(args?.get('on')),
			unlock: args?.get('unlock') === true,
			ringBack: bool(args?.get('ringBack')),
			preview: args?.get('preview') || undefined,
			ringtone: args?.get('ringtone') || undefined,
		});
	}

	getSignature(): FunctionSignature {
		return SOUND;
	}
}

const ALERT = signature(
	'Alert',
	[
		Parameter.ofEntry('caller', Schema.ofString('caller').setDefaultValue('')),
		Parameter.ofEntry('deal', Schema.ofString('deal').setDefaultValue('')),
		Parameter.ofEntry('allow', Schema.ofAny('allow')),
	],
	'Hidden tab call alerts: tells the engine who is calling, or asks to allow notifications',
).setDocumentation(
	"# UIEngine.Call.Alert\n\nWhile an incoming call rings in this browser and the tab that holds the call is hidden (another tab or app is in front), the call engine blinks that tab's title between `Incoming call: <caller>` and the page's title and, when the user has already allowed notifications for the site, shows a browser notification \"Incoming call\" with the caller and the deal; clicking it brings the tab forward. Both stop when the call is answered, declined or ends, or the tab is shown. Only the tab that holds the call alerts, only for calls the provider rings in this browser (never for a call routed to a phone, never for the leg of a call the user placed), and the engine never asks for permission during a ring. Without caller details the number from the provider is shown. This function adds what only the page knows.\n\n## Parameters\n\n- **caller** (String, optional): the caller's name (or number) for the call ringing now\n- **deal** (String, optional): a line about the caller's deal, for the notification\n- **allow** (Boolean, optional): true from a click (\"Allow call alerts\"): asks the browser to show notifications when the user has not answered yet; the same answer turns push notifications on when the app has them, so that setting does not ask again. false: the user declined. Either way the state's `alertsOffer` turns false for this user in this browser. Leave empty for neither. Inside the Modlix mobile app there are no browser notifications\n\n## Events\n\n- **output**: The action was accepted\n  - `state` (Any): the call state after it; with `allow`, `alertPermission` is the browser's answer: `granted`, `denied`, `default` (the prompt was closed) or `unsupported`\n- **error**: The action failed; `output` does not fire\n  - `error` (String): why\n  - `state` (Any): the call state, with the same `error`\n\n" +
		STATE_DOC,
);

export class Alert extends CallFunction {
	protected run(context: FunctionExecutionParameters): Promise<CallState> {
		const args = context.getArguments();
		const allow = args?.get('allow');
		return session.callAlert({
			caller: args?.get('caller') || undefined,
			deal: args?.get('deal') || undefined,
			allow:
				allow === true || allow === 'true'
					? true
					: allow === false || allow === 'false'
						? false
						: undefined,
		});
	}

	getSignature(): FunctionSignature {
		return ALERT;
	}
}

const LIVE = signature(
	'Live',
	[
		Parameter.ofEntry('callLogId', Schema.ofString('callLogId')),
		Parameter.ofEntry('status', Schema.ofString('status').setDefaultValue('')),
		Parameter.ofEntry('terminal', Schema.ofAny('terminal')),
		Parameter.ofEntry('dealId', Schema.ofString('dealId').setDefaultValue('')),
		Parameter.ofEntry('direction', Schema.ofString('direction').setDefaultValue('')),
		Parameter.ofEntry('talkDuration', Schema.ofAny('talkDuration')),
		Parameter.ofEntry('at', Schema.ofAny('at')),
		Parameter.ofEntry('answeredAt', Schema.ofAny('answeredAt')),
		Parameter.ofEntry('path', Schema.ofString('path').setDefaultValue('Store.callLive')),
	],
	'Shares what the server says about the call (answered, ended) with every open tab of the site',
).setDocumentation(
	"# UIEngine.Call.Live\n\nThe page runs this when its event stream delivers a call status frame from the server. Each tab of the site has its own stream and a background or freshly opened tab can miss a frame, so the tabs disagreed on the call (one in the call, one still dialling). This merges the frame into one report, forwards it to the other tabs and writes the same report, whole, to `path` in every tab. It only moves forward (ringing, in progress, ended): a late or repeated frame never walks the call back. The tab that holds the call also ends its side of a call the server reports as ended, a couple of seconds after the report, when the browser phone has not (an outgoing call the customer ended). Works without a Connect (it then writes to `path` in this tab only).\n\n## Parameters\n\n- **callLogId** (String, required): the server's id of the call; a frame without one is ignored\n- **status** (String): `INITIATED`, `RINGING`, `IN_PROGRESS` or an end status\n- **terminal** (Boolean): true when the call has ended\n- **dealId**, **direction**, **talkDuration**: as the server sent them\n- **at** (Number): epoch milliseconds when this tab received the frame\n- **answeredAt** (Number, optional): epoch milliseconds when the customer answered, when the page knows it (a status read from the server)\n- **path** (String, default `Store.callLive`): where the report is written\n\nThe report written holds `callLogId`, `dealId`, `direction`, `status`, `terminal`, `talkDuration`, `at` (latest frame) and `answeredAt` (the first frame that said in progress, 0 until then).\n\n" +
		EVENTS_DOC,
);

export class Live extends CallFunction {
	protected async run(context: FunctionExecutionParameters): Promise<CallState> {
		const args = context.getArguments();
		const tve = context.getValuesMap?.()?.get('Page.') as PageStoreExtractor | undefined;
		return session.liveFrame(
			{
				callLogId: args?.get('callLogId') || undefined,
				status: args?.get('status') ?? '',
				terminal: args?.get('terminal'),
				dealId: args?.get('dealId') || undefined,
				direction: args?.get('direction') || undefined,
				talkDuration: args?.get('talkDuration'),
				at: args?.get('at'),
				answeredAt: args?.get('answeredAt'),
			},
			args?.get('path') || undefined,
			tve?.getPageName?.() ?? GLOBAL_CONTEXT_NAME,
		);
	}

	getSignature(): FunctionSignature {
		return LIVE;
	}
}
