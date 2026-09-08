import { STORE_PREFIX } from '../constants';
import { addListener, getDataFromPath } from '../context/StoreContext';
import { dialTicket, fetchStatus, fetchToken } from './api';
import { LeaderChannel, RelayAction } from './leader';
import { ExotelCallProvider } from './providers/exotel';
import { ICallProvider } from './providers/ICallProvider';
import {
	INITIAL_STATE,
	SoftphoneCallSummary,
	SoftphoneError,
	SoftphoneEvent,
	SoftphoneFacade,
	SoftphoneState,
} from './types';

/**
 * The softphone, as a module singleton.
 *
 * It lives here rather than in React state for three reasons, and the third settles it. A SIP
 * session in component state dies the moment the agent navigates, taking the call with it. A
 * remount, StrictMode's double mount and HMR would each tear down a working WebSocket. And the
 * UIEngine functions that drive the phone are plain classes with no access to hooks or context, so
 * they need a non-React reach point whatever the component does.
 *
 * The component is one subscriber to this, not its owner.
 */

/**
 * One line per provider. The backend picks which by returning `provider` from /browser/status.
 *
 * Keyed lowercase because that is the backend's canonical form, not a formatting choice:
 * `ConnectionSubType.getProvider()` returns `name().toLowerCase()`, and the same value is what the
 * provider columns are queried and stored with. Keying this map on the enum name instead cost an
 * afternoon - the lookup missed, `bringUpPhone` bailed with "no softphone for exotel" before
 * minting a token, and the vendor bundle was never fetched, which reads like a broken integration
 * rather than a typo.
 */
const PROVIDERS: Record<string, () => ICallProvider> = {
	exotel: () => new ExotelCallProvider(),
};

/**
 * Resolves a provider name to its adapter, whatever case it arrives in.
 *
 * The backend's form is lowercase today. Matching case-insensitively means a provider that ever
 * arrives as `EXOTEL` - a different serialiser, a second service, a hand-written connection - still
 * finds its adapter rather than failing in a way that points at the wrong thing.
 */
function providerFor(name: string | undefined): (() => ICallProvider) | undefined {
	if (!name) return undefined;
	return PROVIDERS[name.toLowerCase()];
}

/** The canonical form written to `Store.softphone.provider`, so a page can compare against it. */
function normaliseProvider(name: string | undefined): string | undefined {
	return name ? name.toLowerCase() : undefined;
}

/**
 * Design mode covers two globals that are not interchangeable.
 *
 * `isDesignMode` is set at boot from whether we are in an iframe. `designMode` arrives
 * asynchronously, when the page editor posts EDITOR_TYPE. Checking only the latter leaves a window
 * at mount where the canvas registers a real SIP session - and a Call button dropped on it places
 * a real, billable call on the tenant's account.
 */
function inDesigner(): boolean {
	return !!globalThis.isDesignMode || !!globalThis.designMode;
}

const NOOP_FACADE: SoftphoneFacade = {
	answer: async () => false,
	hangup: async () => false,
	toggleHold: async () => false,
	toggleMute: async () => false,
	sendDtmf: async () => false,
	dial: async () => undefined,
	setAvailability: async () => false,
};

/**
 * How long after a dial an incoming leg is assumed to belong to that dial.
 *
 * PROVISIONAL. On an outbound call the provider rings the customer over PSTN and pushes a SIP
 * INVITE to the agent's browser, so the agent's own outbound call may well arrive as an `incoming`
 * event. Labelling those inbound would get the direction backwards on every outbound call, which
 * is visible on screen and in the call log.
 *
 * Confirm against a live outbound call and then simplify: if the provider distinguishes the two,
 * use whatever it sends and delete this. One open question goes with it - what `callDirection`
 * actually contains.
 *
 * The claim is consumed the first time it matches, so one dial can claim at most one leg. It is
 * also what triggers auto-answering that leg, which is why claiming too eagerly would be worse
 * than a wrong label: it would pick up a customer's inbound call on the agent's behalf.
 */
const OUTBOUND_CLAIM_WINDOW_MS = 20_000;

class SoftphoneRegistry {
	private state: SoftphoneState = { ...INITIAL_STATE };
	private readonly subscribers = new Set<(state: SoftphoneState) => void>();

	private connectionName?: string;
	private autoRegister = true;
	private sdkUrl?: string;
	private started = false;

	private provider?: ICallProvider;
	private channel?: LeaderChannel;

	private unsubscribeProvider?: () => void;
	private unsubscribeAuth?: () => void;

	/*
	 * The agent's credential is deliberately not a field here.
	 *
	 * It is handed straight to the adapter and held in its closure. Keeping a copy would extend the
	 * lifetime of a ~90-day credential in memory for no reader - there is no token refresh to feed
	 * (page-load minting is the whole policy), so the copy would be pure exposure.
	 */

	private outboundClaimUntil = 0;
	/** The deal the current outbound call was placed against, for the summary and for a redial. */
	private pendingTicketId?: string;

	// -------------------------------------------------------------- lifecycle

	/**
	 * Brings the softphone up for a connection. Safe to call on every mount.
	 *
	 * Does nothing at all when the agent is not provisioned: no token is minted, no bundle is
	 * fetched, and no microphone prompt appears. Most users in a tenant are not agents, and none of
	 * that should happen to them.
	 */
	async start(connectionName: string, autoRegister = true, sdkUrl?: string): Promise<void> {
		if (inDesigner()) return;
		if (!connectionName) return;

		// The library URL is part of what identifies this session, not just a detail of it: a
		// changed one has to bring the phone up again rather than be quietly noted. That is the
		// case an author hits while getting the URL right, when the first load 404d.
		if (this.started && this.connectionName === connectionName && this.sdkUrl === sdkUrl) {
			this.autoRegister = autoRegister;
			return;
		}

		if (this.started) this.stop();

		this.started = true;
		this.connectionName = connectionName;
		this.autoRegister = autoRegister;
		this.sdkUrl = sdkUrl;

		this.watchAuth();

		let status;
		try {
			status = await fetchStatus(connectionName);
		} catch {
			this.fail({
				code: 'NOT_PROVISIONED',
				message: 'Calling could not be checked for this user.',
			});
			return;
		}

		// Raced against a stop() - a logout or a connection change while the request was in
		// flight. Dropping the response is the whole handling.
		if (!this.started || this.connectionName !== connectionName) return;

		this.patch({
			provisioned: status.provisioned,
			// Normalised here rather than passed through, so everything downstream - the adapter
			// lookup, `Store.softphone.provider`, and any page binding to it - agrees on one form.
			provider: normaliseProvider(status.provider),
			providerUserId: status.providerUserId,
			virtualNumber: status.virtualNumber,
		});

		if (!status.provisioned) return;

		this.channel = new LeaderChannel();
		this.channel.start({
			onBecameLeader: () => {
				this.patch({ isLeader: true });
				void this.bringUpPhone();
			},
			onEvent: event => this.applyEvent(event),
			onStateRequest: () => this.state,
			onAction: (action, arg) => this.performLocally(action, arg),
			onSnapshot: snapshot => this.adoptSnapshot(snapshot),
			onOutboundPlaced: ticketId => this.claimOutbound(ticketId),
			onLeaderStale: () =>
				this.patch({
					lastError: {
						code: 'REGISTRATION_FAILED',
						message:
							'The tab holding the phone has stopped responding. Reload this page if calls are not arriving.',
					},
				}),
		});

		if (!this.channel.isLeader) this.channel.requestSnapshot();
	}

	/**
	 * Puts the phone down and forgets the credential.
	 *
	 * Called on logout, on a connection change, and never from a component unmount - the session is
	 * meant to outlive the component.
	 */
	stop(): void {
		this.started = false;
		this.connectionName = undefined;
		this.sdkUrl = undefined;
		this.outboundClaimUntil = 0;
		this.pendingTicketId = undefined;

		this.unsubscribeProvider?.();
		this.unsubscribeProvider = undefined;

		this.unsubscribeAuth?.();
		this.unsubscribeAuth = undefined;

		try {
			this.provider?.destroy();
		} catch {
			/* Nothing useful to do about a provider that will not shut down. */
		}
		this.provider = undefined;

		this.channel?.stop();
		this.channel = undefined;

		this.state = { ...INITIAL_STATE };
		this.notify();
	}

	/**
	 * Ends the session when the user's own session ends.
	 *
	 * Logout clears `Store.auth` and the auth token, but it cannot reach a module singleton, and
	 * without this the browser stays registered as the agent who just left: their calls keep
	 * arriving, on a login screen, for whoever sits down next. Watching the store rather than
	 * editing `Logout.ts` keeps the teardown beside the thing being torn down, and covers every
	 * other path that ends a session.
	 */
	private watchAuth(): void {
		this.unsubscribeAuth = addListener(
			undefined,
			() => {
				if (!getDataFromPath(`${STORE_PREFIX}.auth`, [])) this.stop();
			},
			`${STORE_PREFIX}.auth`,
		);
	}

	/** Leader only: mint a credential, load the adapter, register. */
	private async bringUpPhone(): Promise<void> {
		const connectionName = this.connectionName;
		const providerName = this.state.provider;
		if (!connectionName || !providerName) return;

		// Checked before a token is minted, not at the point of use: every mint is a call to the
		// provider, and burning one to then fail on a missing URL is waste with a worse error.
		if (!this.sdkUrl?.trim()) {
			this.fail({
				code: 'SDK_LOAD_FAILED',
				message:
					'No calling library URL is configured. Set the Softphone component\'s "Calling Library URL".',
			});
			return;
		}

		const create = providerFor(providerName);
		if (!create) {
			this.fail({
				code: 'INIT_FAILED',
				message: `This app has no softphone for "${providerName}".`,
			});
			return;
		}

		try {
			const credential = await fetchToken(connectionName);
			if (!this.started || this.connectionName !== connectionName) return;

			const provider = create();
			this.unsubscribeProvider = provider.on(event => {
				this.applyEvent(event);
				this.channel?.broadcastEvent(event);
			});

			await provider.init({
				token: credential.token,
				providerUserId: credential.providerUserId ?? this.state.providerUserId ?? '',
				autoRegister: this.autoRegister,
				sdkUrl: this.sdkUrl,
			});

			if (!this.started || this.connectionName !== connectionName) {
				provider.destroy();
				return;
			}

			this.provider = provider;
		} catch (e) {
			this.fail(asError(e, 'TOKEN_FAILED', 'The phone could not be started.'));
		}
	}

	// -------------------------------------------------------------- state

	subscribe(listener: (state: SoftphoneState) => void): () => void {
		this.subscribers.add(listener);
		listener(this.state);
		return () => this.subscribers.delete(listener);
	}

	getState(): SoftphoneState {
		return this.state;
	}

	private patch(partial: Partial<SoftphoneState>): void {
		this.state = { ...this.state, ...partial };
		this.notify();
	}

	private notify(): void {
		this.subscribers.forEach(l => l(this.state));
	}

	private fail(error: SoftphoneError): void {
		this.patch({
			lastError: error,
			micDenied: error.code === 'MIC_DENIED' ? true : this.state.micDenied,
		});
	}

	private adoptSnapshot(snapshot: SoftphoneState): void {
		// Leadership and provisioning are this tab's own facts; everything about the call belongs
		// to the tab holding it.
		this.patch({
			...snapshot,
			isLeader: this.state.isLeader,
			provisioned: this.state.provisioned,
			provider: this.state.provider,
		});
	}

	/**
	 * Records that an outbound call was placed, in whichever tab is reading this.
	 *
	 * Called directly by the tab that dialled and over the channel in every other tab, so the
	 * leader - the only tab the SIP INVITE reaches - knows the next incoming leg is the agent's own
	 * even when the click happened somewhere else. Without it, dialling from a second tab labelled
	 * the call inbound and made the agent answer their own dial by hand.
	 */
	private claimOutbound(ticketId: string): void {
		this.outboundClaimUntil = Date.now() + OUTBOUND_CLAIM_WINDOW_MS;
		this.pendingTicketId = ticketId;
		this.patch({ direction: 'outbound', lastError: null });
	}

	/**
	 * Answers the agent's own leg of a call they just placed, so dialling is one click.
	 *
	 * The provider rings the customer over PSTN and, in parallel, pushes a SIP INVITE to the
	 * agent's browser. The SDK reports that as an ordinary `incoming` call, so without this the
	 * agent clicks Call and is then asked to answer the call they just asked for.
	 *
	 * Only in the leader tab: `applyEvent` also runs in followers, from the broadcast, and a
	 * follower has no provider to answer with.
	 *
	 * Failures are swallowed on purpose. This runs inside the vendor's own event callback, and
	 * `answer()` throws; letting it escape would surface as an exception inside the SDK rather than
	 * as anything a page could act on. The call is still ringing and still answerable by hand, so
	 * recording the reason is worth more than propagating it.
	 */
	private answerOwnDial(): void {
		if (!this.channel?.isLeader || !this.provider) return;
		try {
			this.provider.answer();
		} catch (e) {
			console.error('Could not auto-answer the agent leg of an outbound call', e);
		}
	}

	/**
	 * Snapshots the call that is ending.
	 *
	 * Duration is computed here rather than at render time. Measured when the card is drawn it
	 * would drift with however long the page took to get there, and keep drifting if the card
	 * stays open - so it is taken once, at the only moment it is correct.
	 *
	 * The authoritative duration is still the server's, from the provider's callback. This is what
	 * the browser saw, which is enough for a wrap-up card and is available immediately.
	 */
	private summarise(callId?: string, endReason?: string): SoftphoneCallSummary {
		const state = this.state;
		const startedAt = state.startedAt;

		return {
			callId: callId || state.callId,
			direction: state.direction,
			phoneNumber: state.direction === 'outbound' ? state.to : state.from,
			ticketId: this.pendingTicketId,
			agent: state.providerUserId,
			startedAt,
			endedAt: new Date().toISOString(),
			durationSeconds: startedAt
				? Math.max(0, Math.round((Date.now() - Date.parse(startedAt)) / 1000))
				: 0,
			answered: !!startedAt,
			endReason,
		};
	}

	/** The one place a call event becomes state, in the leader and in every follower alike. */
	private applyEvent(event: SoftphoneEvent): void {
		switch (event.type) {
			case 'REGISTRATION':
				this.patch({ registered: event.registered });
				return;

			case 'INCOMING': {
				// The provider delivers each call event twice. A repeated INCOMING would reset
				// isMuted, isOnHold and - worst - startedAt, stopping the live timer on a call
				// that is already connected.
				if (this.state.inCall && this.state.callId === event.callId) return;

				const claimedByDial = Date.now() < this.outboundClaimUntil;

				// Consume the claim. Without this, any genuinely inbound call arriving inside the
				// window would also be treated as ours and auto-answered - a customer's call picked
				// up without the agent choosing to. One dial can claim at most one leg.
				if (claimedByDial) this.outboundClaimUntil = 0;

				this.patch({
					inCall: true,
					callId: event.callId,
					direction: claimedByDial ? 'outbound' : 'inbound',
					from: claimedByDial ? undefined : event.from,
					// Always undefined: the server never sends the customer's number here.
					to: undefined,
					remoteName: event.displayName,
					isMuted: false,
					isOnHold: false,
					startedAt: undefined,
					lastError: null,
				});

				if (claimedByDial) this.answerOwnDial();
				return;
			}

			case 'CONNECTED':
				this.patch({
					inCall: true,
					callId: event.callId || this.state.callId,
					// First one wins. A repeated CONNECTED carries a later timestamp, which would
					// silently restart the agent's call timer mid-conversation.
					startedAt: this.state.startedAt ?? event.startedAt,
				});
				return;

			case 'ENDED': {
				// Only the first ENDED counts. The provider sends two, and the second arrives
				// after this handler has already cleared the call - so re-summarising would
				// overwrite a good record with one missing the direction, the caller's number and
				// the duration, making every call look unanswered and zero-length.
				if (!this.state.inCall) return;

				// Summarised before the reset, because everything it needs is about to be cleared
				// and a page has no moment of its own to read it.
				const lastCall = this.summarise(event.callId, event.reason);

				this.outboundClaimUntil = 0;
				this.pendingTicketId = undefined;
				this.patch({
					inCall: false,
					callId: undefined,
					direction: undefined,
					from: undefined,
					to: undefined,
					remoteName: undefined,
					startedAt: undefined,
					isMuted: false,
					isOnHold: false,
					lastCall,
				});
				return;
			}

			case 'HOLD':
				this.patch({ isOnHold: event.onHold });
				return;

			case 'MUTE':
				this.patch({ isMuted: event.muted });
				return;

			case 'ERROR':
				this.fail(event.error);
				return;

			default: {
				// Exhaustiveness. Adding a member to SoftphoneEvent without a case above is a
				// compile error here, which is the only thing that catches it: this returns void,
				// so a missing case would otherwise be a silent no-op.
				const unhandled: never = event;

				// Reachable at run time for one reason: events cross a BroadcastChannel, so a tab
				// running older code can be sent an event type it has no case for after a deploy.
				// Ignoring it is right - throwing would surface inside the provider's own callback.
				console.warn('Ignoring an unrecognised softphone event', unhandled);
				return;
			}
		}
	}

	// -------------------------------------------------------------- controls

	/**
	 * What the UIEngine functions call.
	 *
	 * Returns undefined when there is no phone to drive, so a function can say so rather than
	 * failing silently. In the page editor it returns a facade that does nothing, because a
	 * component dropped on a canvas must not ring a customer.
	 */
	current(): SoftphoneFacade | undefined {
		if (inDesigner()) return NOOP_FACADE;
		if (!this.started || !this.state.provisioned) return undefined;
		return this.facade;
	}

	private readonly facade: SoftphoneFacade = {
		answer: () => this.control('answer'),
		hangup: () => this.control('hangup'),
		toggleHold: () => this.control('toggleHold'),
		toggleMute: () => this.control('toggleMute'),
		sendDtmf: (digit: string) => this.control('sendDtmf', digit),
		setAvailability: (available: boolean) => this.control('setAvailability', available),

		/**
		 * Dialling is a call to our own backend, so it works from any tab - but the audio will
		 * arrive in the tab holding the session. The boolean the caller gets back from `isLeader`
		 * is what lets a page say so instead of leaving the agent talking to a silent window.
		 */
		dial: async (ticketId: string, connectionName?: string) => {
			const connection = connectionName ?? this.connectionName;
			if (!connection) throw dialError('No calling connection is configured on this page.');
			if (!ticketId) throw dialError('No deal was given to call.');

			try {
				const call = await dialTicket(ticketId, connection);

				// This tab, then every other one. The leader needs the claim before the INVITE
				// arrives, and it may not be this tab.
				this.claimOutbound(ticketId);
				this.channel?.announceOutboundDial(ticketId);

				return call;
			} catch (e) {
				const error = asError(
					e,
					'DIAL_REJECTED',
					'The call could not be placed for this deal.',
				);
				this.fail(error);
				throw error;
			}
		},
	};

	/** Acts here when this tab holds the session, and asks the tab that does when it does not. */
	private async control(action: RelayAction, arg?: unknown): Promise<boolean> {
		if (!this.channel) throw noPhone();

		if (!this.channel.isLeader) {
			const result = await this.channel.relay(action, arg);
			return result !== false;
		}

		const result = await this.performLocally(action, arg);
		return result !== false;
	}

	/**
	 * The leader's half of a control, whether it originated here or in another tab.
	 *
	 * Returns the resulting state for the toggles. The vendor fires its toggle event synchronously
	 * from inside the toggle call, so our state is already updated by the time this reads it.
	 */
	private async performLocally(action: RelayAction, arg?: unknown): Promise<unknown> {
		const provider = this.provider;
		if (!provider) throw noPhone();

		switch (action) {
			case 'answer':
				provider.answer();
				return true;

			case 'hangup':
				provider.hangup();
				return true;

			case 'toggleHold':
				provider.toggleHold();
				return this.state.isOnHold;

			case 'toggleMute':
				provider.toggleMute();
				return this.state.isMuted;

			case 'sendDtmf':
				provider.sendDtmf(String(arg ?? ''));
				return true;

			case 'setAvailability':
				if (arg === false) provider.unregister();
				else provider.register();
				return arg !== false;

			default: {
				// Exhaustiveness, and here it has to throw rather than warn. `control` reads any
				// result other than `false` as success, so falling through would return undefined
				// and tell the page the control worked. The throw lands in the existing error
				// plumbing either way: `performForFollower` turns it into an ACTION_RESULT the
				// follower rejects on, and a local call surfaces it as the function's error event.
				const unhandled: never = action;
				throw {
					code: 'UNSUPPORTED_CONTROL',
					message: `This build cannot perform "${String(unhandled)}".`,
				} satisfies SoftphoneError;
			}
		}
	}
}

function noPhone(): SoftphoneError {
	return { code: 'NO_ACTIVE_CALL', message: 'No phone is active in this browser.' };
}

function dialError(message: string): SoftphoneError {
	return { code: 'DIAL_REJECTED', message };
}

function asError(
	e: unknown,
	fallbackCode: SoftphoneError['code'],
	fallback: string,
): SoftphoneError {
	if (e && typeof e === 'object' && 'code' in e && 'message' in e) return e as SoftphoneError;
	return { code: fallbackCode, message: e instanceof Error ? e.message : fallback };
}

/** The one instance. Import this; do not construct another. */
export const softphoneRegistry = new SoftphoneRegistry();
