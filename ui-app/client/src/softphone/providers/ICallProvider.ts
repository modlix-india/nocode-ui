import { SoftphoneEvent } from '../types';

/**
 * What a calling provider has to be able to do in a browser.
 *
 * Mirrors the backend's `EnumMap<ConnectionSubType, IBrowserCallService>` deliberately: adding a
 * provider should mean a `ConnectionSubType` entry, a service on the backend, an adapter here, and
 * no page edits in any app.
 *
 * There is no `dial`, and that is the point rather than an omission. Dialling goes to our own
 * backend, which reads the customer's number off the deal under the agent's own access; a `dial`
 * on this interface would put a number in the browser's hands and invite someone to reach for the
 * vendor SDK's own outbound call, which carries no ticket and no caller ID.
 */
export interface ICallProvider {
	readonly provider: string;

	/**
	 * Brings the phone up. Only ever called in the leader tab.
	 *
	 * `autoRegister` false initialises without registering, so an app can offer an explicit
	 * "go online" control.
	 */
	init(config: ProviderInit): Promise<void>;

	register(): void;
	unregister(): void;

	answer(): void;
	hangup(): void;

	/** Toggle only. No provider SDK in scope exposes a set-hold, and a boolean that silently
	 * no-ops half the time would be worse than an honest toggle. */
	toggleHold(): void;
	toggleMute(): void;

	sendDtmf(digit: string): void;

	destroy(): void;

	/** Subscribes to normalised events. Returns an unsubscribe. */
	on(listener: (event: SoftphoneEvent) => void): () => void;
}

export interface ProviderInit {
	/** The agent's credential. Held in closure; never stored, never logged, never re-emitted. */
	token: string;
	providerUserId: string;
	autoRegister: boolean;
}
