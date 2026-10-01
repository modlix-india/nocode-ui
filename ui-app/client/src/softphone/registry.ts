import { STORE_PREFIX } from '../constants';
import { addListener, getDataFromPath } from '../context/StoreContext';
import { dialTicket, fetchStatus, fetchToken } from './api';
import { asError, serverMessage } from './errors';
import { LeaderChannel, RelayAction } from './leader';
import { ExotelCallProvider } from './providers/exotel';
import { ICallProvider } from './providers/ICallProvider';
import { TelecmiCallProvider } from './providers/telecmi';
import {
	INITIAL_STATE,
	SoftphoneCallSummary,
	SoftphoneError,
	SoftphoneEvent,
	SoftphoneFacade,
	SoftphoneState,
} from './types';

/**
 * A module singleton, not React state: the SIP session must survive navigation and remounts, and
 * the UIEngine functions that drive it have no access to hooks or context.
 */

/**
 * Keyed lowercase, the backend's canonical form (`ConnectionSubType.getProvider()` returns
 * `name().toLowerCase()`). The backend picks one by returning `provider` from /browser/status.
 */
const PROVIDERS: Record<string, () => ICallProvider> = {
	exotel: () => new ExotelCallProvider(),
	telecmi: () => new TelecmiCallProvider(),
};

function providerFor(name: string | undefined): (() => ICallProvider) | undefined {
	if (!name) return undefined;
	return PROVIDERS[name.toLowerCase()];
}

function normaliseProvider(name: string | undefined): string | undefined {
	return name ? name.toLowerCase() : undefined;
}

/**
 * Both globals: `isDesignMode` is set at boot, `designMode` only when the editor posts
 * EDITOR_TYPE. Checking only the latter lets the canvas briefly register a real SIP session.
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
 * How long after a dial an incoming leg is assumed to be that dial's. The provider pushes the
 * agent's own outbound leg as an `incoming` SIP INVITE. The claim triggers auto-answer, so it is
 * consumed on first match: claiming too eagerly would answer a customer's inbound call.
 */
const OUTBOUND_CLAIM_WINDOW_MS = 20_000;

/** Rides out a briefly unreachable token endpoint without an endless election on bad config. */
const TAKE_UP_ATTEMPTS = 3;
const TAKE_UP_RETRY_MS = 5_000;

class SoftphoneRegistry {
	private state: SoftphoneState = { ...INITIAL_STATE };
	private readonly subscribers = new Set<(state: SoftphoneState) => void>();

	/**
	 * What the page asked for (maybe nothing) and what the backend resolved it to. The first
	 * identifies the session for `isSameSession`; the second is what token and dials use.
	 */
	private requestedConnection?: string;
	private connectionName?: string;
	private autoRegister = true;
	/** The component's "Calling Library URL"; the connection's own wins over it. */
	private sdkUrl?: string;
	private connectionSdkUrl?: string;
	private started = false;

	/**
	 * Bumped by every start and stop, checked after every await. Connection names cannot tell
	 * apart two starts that differ only in library URL.
	 */
	private generation = 0;

	private provider?: ICallProvider;
	private channel?: LeaderChannel;

	private unsubscribeProvider?: () => void;

	/**
	 * A provider still inside `init` (mic prompt, library load: unbounded), so a stop can reach it
	 * before it signs in as an agent who may have logged out.
	 */
	private bringingUp?: { provider: ICallProvider; unsubscribe: () => void };
	private unsubscribeAuth?: () => void;

	/*
	 * The agent's credential is deliberately not a field: it goes straight to the adapter's
	 * closure. There is no refresh to feed, so a copy would only extend its exposure.
	 */

	private takeUpFailures = 0;
	private outboundClaimUntil = 0;
	private pendingTicketId?: string;

	// -------------------------------------------------------------- lifecycle

	/**
	 * Safe to call on every mount. For an unprovisioned user it mints no token, loads no bundle
	 * and shows no mic prompt. With no `connectionName` the agent's own connection is used.
	 */
	async start(connectionName?: string, autoRegister = true, sdkUrl?: string): Promise<void> {
		if (inDesigner()) return;
		const requested = connectionName || undefined;

		if (this.started && this.isSameSession(requested, sdkUrl)) {
			this.autoRegister = autoRegister;
			return;
		}

		if (this.started) this.stop();

		const generation = ++this.generation;
		this.started = true;
		this.requestedConnection = requested;
		this.connectionName = requested;
		this.autoRegister = autoRegister;
		this.sdkUrl = sdkUrl;

		this.watchAuth();

		let status;
		try {
			status = await fetchStatus(requested);
		} catch (e) {
			if (generation !== this.generation) return;
			this.fail({
				code: 'NOT_PROVISIONED',
				message: serverMessage(e) ?? 'Calling could not be checked for this user.',
			});
			return;
		}

		// A stop or newer start happened while the request was in flight.
		if (generation !== this.generation) return;

		this.connectionName = status.connectionName || requested;
		this.connectionSdkUrl = status.sdkUrl?.trim() || undefined;

		this.patch({
			provisioned: status.provisioned,
			provider: normaliseProvider(status.provider),
			providerUserId: status.providerUserId,
			virtualNumber: status.virtualNumber,
		});

		if (!status.provisioned) return;

		this.channel = new LeaderChannel();
		this.channel.start({
			onBecameLeader: () => {
				this.patch({ isLeader: true });
				void this.takeUpPhone();
			},
			onEvent: event => this.applyEvent(event),
			onStateRequest: () => this.state,
			onAction: (action, arg) => this.performLocally(action, arg),
			onSnapshot: snapshot => this.adoptSnapshot(snapshot),
			onOutboundPlaced: ticketId => this.claimOutbound(ticketId),
			onOutboundFailed: () => this.releaseOutboundClaim(),
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
	 * A restart drops a call in progress, so only a start meaning a different phone may cause one.
	 * Blank means the agent's own connection. A changed library URL restarts, unless the
	 * connection names its own library, which wins.
	 */
	private isSameSession(requested: string | undefined, sdkUrl: string | undefined): boolean {
		if (this.sdkUrl !== sdkUrl && !this.connectionSdkUrl) return false;
		if (requested === this.requestedConnection) return true;
		if (!this.state.provisioned) return false;
		return requested === undefined || requested === this.connectionName;
	}

	/** Called on logout and connection change, never on unmount: the session outlives it. */
	stop(): void {
		this.started = false;
		this.generation += 1;
		this.requestedConnection = undefined;
		this.connectionName = undefined;
		this.sdkUrl = undefined;
		this.connectionSdkUrl = undefined;
		this.outboundClaimUntil = 0;
		this.pendingTicketId = undefined;

		this.unsubscribeProvider?.();
		this.unsubscribeProvider = undefined;

		// Destroyed now and again when its `init` returns: now so TeleCMI's can stop part-way;
		// later because Exotel's cannot, and only makes its phone at the end of `init`.
		const bringingUp = this.bringingUp;
		this.bringingUp = undefined;
		if (bringingUp) this.discardProvider(bringingUp.provider, bringingUp.unsubscribe);

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
	 * Logout clears `Store.auth` but cannot reach this singleton; without this the browser stays
	 * registered as the agent who just left. Covers every path that ends a session.
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

	/** Leader only. */
	private async bringUpPhone(): Promise<boolean> {
		const generation = this.generation;
		const connectionName = this.connectionName;
		const providerName = this.state.provider;
		if (!connectionName || !providerName) return false;

		const sdkUrl = this.connectionSdkUrl ?? this.sdkUrl;

		// Checked before minting: every mint is a provider call.
		if (!sdkUrl?.trim()) {
			this.fail({
				code: 'SDK_LOAD_FAILED',
				message:
					'No calling library URL is configured. Set it on the calling connection or on the Softphone component\'s "Calling Library URL".',
			});
			return false;
		}

		const create = providerFor(providerName);
		if (!create) {
			this.fail({
				code: 'INIT_FAILED',
				message: `This app has no softphone for "${providerName}".`,
			});
			return false;
		}

		let provider: ICallProvider | undefined;
		// Kept local until the provider is kept: a restart's bring-up during `init` would otherwise
		// overwrite `unsubscribeProvider`, and discarding this one would unsubscribe the new phone.
		let unsubscribe: (() => void) | undefined;
		try {
			const credential = await fetchToken(connectionName);
			if (generation !== this.generation) return false;

			provider = create();
			unsubscribe = provider.on(event => {
				this.applyEvent(event);
				this.channel?.broadcastEvent(event);
			});
			this.bringingUp = { provider, unsubscribe };

			await provider.init({
				token: credential.token,
				providerUserId: credential.providerUserId ?? this.state.providerUserId ?? '',
				autoRegister: this.autoRegister,
				sdkUrl,
				region: credential.region,
			});

			// Replaced while in `init`: this second destroy unregisters a phone `init` made anyway.
			if (generation !== this.generation) {
				this.releaseBringUp(provider, unsubscribe);
				return false;
			}

			this.bringingUp = undefined;
			this.provider = provider;
			this.unsubscribeProvider = unsubscribe;
			return true;
		} catch (e) {
			// Torn down: this path is retried, and leftovers would stack a SIP stack per attempt.
			this.releaseBringUp(provider, unsubscribe);
			if (generation !== this.generation) return false;
			this.fail(asError(e, 'TOKEN_FAILED', 'The phone could not be started.'));
			return false;
		}
	}

	/**
	 * Runs even when a stop already destroyed the provider: a destroy before `init` finishes
	 * cannot reach a phone `init` makes afterwards. Both adapters' `destroy` is safe to repeat.
	 */
	private releaseBringUp(
		provider: ICallProvider | undefined,
		unsubscribe: (() => void) | undefined,
	): void {
		if (!provider) return;
		if (this.bringingUp?.provider === provider) this.bringingUp = undefined;
		this.discardProvider(provider, unsubscribe);
	}

	private discardProvider(
		provider: ICallProvider | undefined,
		unsubscribe: (() => void) | undefined,
	): void {
		unsubscribe?.();
		try {
			provider?.destroy();
		} catch {
			/* Nothing useful to do about a provider that will not shut down. */
		}
	}

	/** Steps down if the phone cannot come up: a phoneless leader breaks every tab at once. */
	private async takeUpPhone(): Promise<void> {
		const generation = this.generation;
		if (await this.bringUpPhone()) {
			this.takeUpFailures = 0;
			return;
		}

		// Replaced mid bring-up: the channel is the new start's, so do not resign it.
		if (generation !== this.generation) return;

		this.takeUpFailures += 1;

		const steppedDown = this.channel?.resign(
			this.takeUpFailures < TAKE_UP_ATTEMPTS ? TAKE_UP_RETRY_MS : undefined,
		);

		// Without Web Locks the channel keeps leadership, so only patch when it really resigned.
		if (steppedDown) this.patch({ isLeader: false });
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
		this.patch({
			...snapshot,
			isLeader: this.state.isLeader,
			provisioned: this.state.provisioned,
			provider: this.state.provider,
		});
	}

	/** Runs in the dialling tab directly and in every other tab via the channel. */
	private claimOutbound(ticketId: string): void {
		this.outboundClaimUntil = Date.now() + OUTBOUND_CLAIM_WINDOW_MS;
		this.pendingTicketId = ticketId;
		this.patch({ direction: 'outbound', lastError: null });
	}

	private releaseOutboundClaim(): void {
		this.outboundClaimUntil = 0;
		this.pendingTicketId = undefined;
		if (!this.state.inCall) this.patch({ direction: undefined });
	}

	/**
	 * Auto-answers the agent's own outbound leg, which the SDK reports as `incoming`. Leader only.
	 * Failures are swallowed: this runs inside the vendor's event callback, and the call is still
	 * answerable by hand.
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
	 * Duration is taken once, here, rather than at render time where it would drift. The
	 * authoritative duration is the server's, from the provider's callback.
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

	private applyEvent(event: SoftphoneEvent): void {
		switch (event.type) {
			case 'REGISTRATION':
				this.patch({ registered: event.registered });
				return;

			case 'INCOMING': {
				// The provider delivers each call event twice. A repeat would reset startedAt.
				if (this.state.inCall && this.state.callId === event.callId) return;

				const claimedByDial = Date.now() < this.outboundClaimUntil;

				// Consume the claim so a real inbound call in the window is not auto-answered.
				if (claimedByDial) this.outboundClaimUntil = 0;

				this.patch({
					inCall: true,
					callId: event.callId,
					direction: claimedByDial ? 'outbound' : 'inbound',
					from: claimedByDial ? undefined : event.from,
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
				// Duplicates arrive in no guaranteed order, so a CONNECTED can follow its own
				// call's ENDED. Narrowed to that call rather than `!inCall`, which is unverified.
				if (!this.state.inCall && this.state.lastCall?.callId === event.callId) return;

				this.patch({
					inCall: true,
					callId: event.callId || this.state.callId,
					// First wins: a repeat carries a later timestamp and would restart the timer.
					startedAt: this.state.startedAt ?? event.startedAt,
				});
				return;

			case 'ENDED': {
				// Only the first ENDED counts; a second would overwrite lastCall with an empty one.
				if (!this.state.inCall) return;

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
				const unhandled: never = event;

				// Reachable from a newer tab over the BroadcastChannel; throwing would land inside
				// the provider's callback.
				console.warn('Ignoring an unrecognised softphone event', unhandled);
				return;
			}
		}
	}

	// -------------------------------------------------------------- controls

	/** Undefined when there is no phone; a no-op facade in the editor, so a canvas never dials. */
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

		dial: async (ticketId: string, connectionName?: string) => {
			const connection = connectionName ?? this.connectionName;
			if (!connection) throw dialError('No calling connection is configured on this page.');
			if (!ticketId) throw dialError('No deal was given to call.');

			// Claimed before the request: the INVITE can arrive before our HTTP response does.
			this.claimOutbound(ticketId);
			this.channel?.announceOutboundDial(ticketId);

			try {
				return await dialTicket(ticketId, connection);
			} catch (e) {
				this.releaseOutboundClaim();
				this.channel?.announceOutboundFailed();

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

	/**
	 * The result is passed through, not read as success: failure is always a throw, and `false`
	 * means e.g. "off hold".
	 */
	private async control(action: RelayAction, arg?: unknown): Promise<boolean> {
		if (!this.channel) throw noPhone();

		// Narrowed rather than cast: the value crossed a BroadcastChannel from another build.
		if (!this.channel.isLeader) return (await this.channel.relay(action, arg)) === true;

		return this.performLocally(action, arg);
	}

	/**
	 * Toggles return the new state: the vendor fires its toggle event synchronously inside the
	 * toggle call, so state is already updated when read.
	 */
	private async performLocally(action: RelayAction, arg?: unknown): Promise<boolean> {
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
				// Throws rather than warns, so a page never reports a hangup that did not happen.
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

export const softphoneRegistry = new SoftphoneRegistry();
