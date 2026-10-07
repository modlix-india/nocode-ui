import { SoftphoneEvent } from '../types';

/**
 * Mirrors the backend's `EnumMap<ConnectionSubType, IBrowserCallService>`. No `dial` on purpose:
 * dialling goes through our backend, which reads the number off the deal, and the vendor SDK's
 * own outbound call carries no ticket and no caller ID.
 */
export interface ICallProvider {
	readonly provider: string;

	/** Leader tab only. `autoRegister` false initialises without registering. */
	init(config: ProviderInit): Promise<void>;

	register(): void;
	unregister(): void;

	answer(): void;
	hangup(): void;

	/** Toggle only: no provider SDK in scope exposes a set-hold. */
	toggleHold(): void;
	toggleMute(): void;

	sendDtmf(digit: string): void;

	destroy(): void;

	on(listener: (event: SoftphoneEvent) => void): () => void;
}

export interface ProviderInit {
	/** The agent's credential. Held in closure; never stored, never logged, never re-emitted. */
	token: string;
	providerUserId: string;
	autoRegister: boolean;
	/** Resolved through `getSrcUrl` by the adapter, so a configured CDN applies. */
	sdkUrl?: string;
	/** Regional signalling server, from the token response; ignored by adapters that need none. */
	region?: string;
}
