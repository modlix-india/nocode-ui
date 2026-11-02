/**
 * What the call session needs from the browser to share one call between the tabs of a site:
 * a lock that only one tab holds (that tab signs in to the provider and holds the audio) and a
 * channel the tabs talk over. A provider SDK keeps ONE registration per agent: when every tab
 * signs in, the newest sign in (a second tab, a reload) logs the call tab out and drops its call.
 *
 * Browser side: Web Locks (navigator.locks) and BroadcastChannel, both same origin only. Without
 * either, getTabSync() answers undefined and every tab works alone, as before.
 */

export interface TabChannel {
	post(message: any): void;
	close(): void;
}

export interface TabSync {
	/** Takes the lock when it is free. Resolves true when this tab now holds it. */
	tryLead(name: string): Promise<boolean>;
	/** Queues for the lock; onLead runs once this tab holds it. Returns a cancel. */
	waitLead(name: string, onLead: () => void): () => void;
	/** Lets the lock go (the browser also lets it go when the tab closes or reloads). */
	release(name: string): void;
	open(name: string, onMessage: (message: any) => void): TabChannel;
}

function browserTabSync(): TabSync | undefined {
	const locks = typeof navigator === 'undefined' ? undefined : (navigator as any).locks;
	if (!locks?.request || typeof BroadcastChannel === 'undefined') return undefined;
	const held = new Map<string, () => void>();

	const hold = (name: string) => new Promise<void>(release => held.set(name, release));

	return {
		tryLead(name) {
			return new Promise<boolean>(resolve => {
				locks
					.request(name, { ifAvailable: true }, (lock: any) => {
						if (!lock) {
							resolve(false);
							return undefined;
						}
						const p = hold(name);
						resolve(true);
						return p;
					})
					.catch(() => resolve(false));
			});
		},
		waitLead(name, onLead) {
			const ac = new AbortController();
			let granted = false;
			locks
				.request(name, { signal: ac.signal }, () => {
					granted = true;
					const p = hold(name);
					onLead();
					return p;
				})
				.catch(() => {
					// Cancelled before it was granted.
				});
			return () => {
				if (!granted) ac.abort();
			};
		},
		release(name) {
			held.get(name)?.();
			held.delete(name);
		},
		open(name, onMessage) {
			const bc = new BroadcastChannel(name);
			bc.onmessage = e => onMessage(e.data);
			return {
				post: m => {
					try {
						bc.postMessage(m);
					} catch {
						// The channel is closed.
					}
				},
				close: () => bc.close(),
			};
		},
	};
}

let override: TabSync | null | undefined;
let detected: TabSync | null | undefined;

export function getTabSync(): TabSync | undefined {
	if (override !== undefined) return override ?? undefined;
	if (detected === undefined) detected = browserTabSync() ?? null;
	return detected ?? undefined;
}

/** For tests: a fake, or null for no sharing between tabs. undefined goes back to the browser's. */
export function setTabSync(sync: TabSync | null | undefined) {
	override = sync;
}
