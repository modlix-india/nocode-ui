import { STORE_PREFIX } from '../constants';
import { addListener, getDataFromPath } from '../context/StoreContext';
import { dialTicket, fetchStatus, fetchToken } from './api';
import { LeaderChannel, RelayAction } from './leader';
import { ExotelCallProvider } from './providers/exotel';
import { ICallProvider } from './providers/ICallProvider';
import {
	INITIAL_STATE,
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

/** One line per provider. The backend picks which by returning `provider` from /browser/status. */
const PROVIDERS: Record<string, () => ICallProvider> = {
	EXOTEL: () => new ExotelCallProvider(),
};

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
 * use whatever it sends and delete this. Two open questions go with it - whether that leg should
 * be answered automatically, since the agent already asked for the call, and what
 * `callDirection` actually contains.
 */
const OUTBOUND_CLAIM_WINDOW_MS = 20_000;

class SoftphoneRegistry {
	private state: SoftphoneState = { ...INITIAL_STATE };
	private readonly subscribers = new Set<(state: SoftphoneState) => void>();

	private connectionName?: string;
	private autoRegister = true;
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
	private pendingTo?: string;

	// -------------------------------------------------------------- lifecycle

	/**
	 * Brings the softphone up for a connection. Safe to call on every mount.
	 *
	 * Does nothing at all when the agent is not provisioned: no token is minted, no bundle is
	 * fetched, and no microphone prompt appears. Most users in a tenant are not agents, and none of
	 * that should happen to them.
	 */
	async start(connectionName: string, autoRegister = true): Promise<void> {
		if (inDesigner()) return;
		if (!connectionName) return;

		if (this.started && this.connectionName === connectionName) {
			this.autoRegister = autoRegister;
			return;
		}

		if (this.started) this.stop();

		this.started = true;
		this.connectionName = connectionName;
		this.autoRegister = autoRegister;

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
			provider: status.provider,
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
		this.outboundClaimUntil = 0;
		this.pendingTo = undefined;

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

		const create = PROVIDERS[providerName];
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

	/** The one place a call event becomes state, in the leader and in every follower alike. */
	private applyEvent(event: SoftphoneEvent): void {
		switch (event.type) {
			case 'REGISTRATION':
				this.patch({ registered: event.registered });
				return;

			case 'INCOMING': {
				const claimedByDial = Date.now() < this.outboundClaimUntil;
				this.patch({
					inCall: true,
					callId: event.callId,
					direction: claimedByDial ? 'outbound' : 'inbound',
					from: claimedByDial ? undefined : event.from,
					to: claimedByDial ? this.pendingTo : undefined,
					remoteName: event.displayName,
					isMuted: false,
					isOnHold: false,
					startedAt: undefined,
					lastError: null,
				});
				return;
			}

			case 'CONNECTED':
				this.patch({
					inCall: true,
					callId: event.callId || this.state.callId,
					startedAt: event.startedAt,
				});
				return;

			case 'ENDED':
				this.outboundClaimUntil = 0;
				this.pendingTo = undefined;
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
				});
				return;

			case 'HOLD':
				this.patch({ isOnHold: event.onHold });
				return;

			case 'MUTE':
				this.patch({ isMuted: event.muted });
				return;

			case 'ERROR':
				this.fail(event.error);
				return;
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
				this.outboundClaimUntil = Date.now() + OUTBOUND_CLAIM_WINDOW_MS;
				this.pendingTo = undefined;
				this.patch({ direction: 'outbound', lastError: null });
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
