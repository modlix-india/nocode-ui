/**
 * Utility for throttling and debouncing postMessage calls to iframes
 * Reduces overhead when sending large payloads (10MB+) to multiple iframes
 */

interface PendingMessage {
	type: string;
	payload: any;
	targets: Array<'desktop' | 'tablet' | 'mobile' | 'template'>;
	timestamp: number;
	iframeRefGetter: () => IframeRefs; // Function to get current refs dynamically
}

interface IframeRefs {
	desktop?: HTMLIFrameElement | null;
	tablet?: HTMLIFrameElement | null;
	mobile?: HTMLIFrameElement | null;
	template?: HTMLIFrameElement | null;
}

class MessageThrottler {
	private pendingMessages: Map<string, PendingMessage> = new Map();
	private rafHandle: number | null = null;
	private debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
	private lastSentPayloads: Map<string, any> = new Map();

	// Configuration
	private readonly DEBOUNCE_MS = 50; // Debounce rapid updates
	private readonly RAF_BATCH_MS = 16; // Batch within one frame (~60fps)
	private readonly MAX_PAYLOAD_SIZE_MB = 1; // Compress if larger

	/**
	 * Schedule a message to be sent to iframes
	 * Messages are debounced and batched for efficiency
	 */
	scheduleMessage(
		messageKey: string,
		type: string,
		payload: any,
		targets: Array<'desktop' | 'tablet' | 'mobile' | 'template'>,
		iframeRefGetter: () => IframeRefs,
		immediate: boolean = false, // If true, send immediately without debounce
	): void {
		// For immediate messages (like initial setup), skip debounce and deduplication
		if (immediate) {
			const iframeRefs = iframeRefGetter();
			const msg = { type, payload };
			for (const target of targets) {
				const iframe = this.getIframeForTarget(target, iframeRefs);
				if (iframe?.contentWindow) {
					try {
						iframe.contentWindow.postMessage(msg, '*');
					} catch (e) {
						console.error(`[MessageThrottler] Failed to send ${type} to ${target}:`, e);
					}
				}
			}
			this.lastSentPayloads.set(messageKey, payload);
			return;
		}

		// Check if payload actually changed (shallow comparison)
		// Disable for now to ensure messages are sent - can re-enable later for optimization
		// const lastPayload = this.lastSentPayloads.get(messageKey);
		// if (this.payloadsEqual(lastPayload, payload)) {
		// 	// Skip if payload hasn't changed
		// 	return;
		// }

		// Store the pending message with ref getter
		this.pendingMessages.set(messageKey, {
			type,
			payload,
			targets,
			timestamp: Date.now(),
			iframeRefGetter,
		});

		// Clear existing debounce timer
		const existingTimer = this.debounceTimers.get(messageKey);
		if (existingTimer) {
			clearTimeout(existingTimer);
		}

		// Set up debounce timer
		const timer = setTimeout(() => {
			this.flushMessage(messageKey);
			this.debounceTimers.delete(messageKey);
		}, this.DEBOUNCE_MS);

		this.debounceTimers.set(messageKey, timer);

		// Also schedule RAF flush for immediate updates (if needed)
		if (this.rafHandle === null) {
			this.rafHandle = requestAnimationFrame(() => {
				this.flushAllPending();
				this.rafHandle = null;
			});
		}
	}

	/**
	 * Flush a specific message immediately
	 */
	private flushMessage(messageKey: string): void {
		const message = this.pendingMessages.get(messageKey);
		if (!message) return;

		const iframeRefs = message.iframeRefGetter();
		this.sendToIframes(message, iframeRefs);
		this.pendingMessages.delete(messageKey);
		this.lastSentPayloads.set(messageKey, message.payload);
	}

	/**
	 * Flush all pending messages (called on RAF)
	 */
	private flushAllPending(): void {
		const now = Date.now();
		const messagesToFlush: Array<{ key: string; message: PendingMessage }> = [];

		// Collect messages that are ready to send
		for (const [key, message] of this.pendingMessages.entries()) {
			// Flush if debounce time has passed
			if (now - message.timestamp >= this.DEBOUNCE_MS) {
				messagesToFlush.push({ key, message });
			}
		}

		// Send all ready messages
		for (const { key, message } of messagesToFlush) {
			const iframeRefs = message.iframeRefGetter();
			this.sendToIframes(message, iframeRefs);
			this.pendingMessages.delete(key);
			this.lastSentPayloads.set(key, message.payload);
		}
	}

	/**
	 * Send message to target iframes
	 */
	private sendToIframes(message: PendingMessage, iframeRefs: IframeRefs): void {
		const msg = {
			type: message.type,
			payload: message.payload,
		};

		for (const target of message.targets) {
			const iframe = this.getIframeForTarget(target, iframeRefs);
			if (iframe?.contentWindow) {
				try {
					iframe.contentWindow.postMessage(msg, '*');
				} catch (e) {
					console.error(`[MessageThrottler] Failed to send ${message.type} to ${target}:`, e);
				}
			}
		}
	}

	/**
	 * Get iframe element for target
	 */
	private getIframeForTarget(
		target: 'desktop' | 'tablet' | 'mobile' | 'template',
		iframeRefs: IframeRefs,
	): HTMLIFrameElement | null | undefined {
		switch (target) {
			case 'desktop':
				return iframeRefs.desktop;
			case 'tablet':
				return iframeRefs.tablet;
			case 'mobile':
				return iframeRefs.mobile;
			case 'template':
				return iframeRefs.template;
			default:
				return null;
		}
	}

	/**
	 * Compare two payloads for equality (shallow comparison)
	 * For large objects, we compare a hash or key properties
	 */
	private payloadsEqual(payload1: any, payload2: any): boolean {
		if (payload1 === payload2) return true;
		if (!payload1 || !payload2) return false;

		// For PageDefinition, compare key properties that indicate changes
		if (payload1.name && payload2.name) {
			// Compare version, rootComponent, and componentDefinition keys
			return (
				payload1.name === payload2.name &&
				payload1.version === payload2.version &&
				payload1.rootComponent === payload2.rootComponent &&
				this.componentDefinitionKeysEqual(
					payload1.componentDefinition,
					payload2.componentDefinition,
				)
			);
		}

		// For other objects, do shallow comparison
		try {
			return JSON.stringify(payload1) === JSON.stringify(payload2);
		} catch {
			// If stringification fails, assume different
			return false;
		}
	}

	/**
	 * Compare componentDefinition keys (not full content)
	 */
	private componentDefinitionKeysEqual(def1: any, def2: any): boolean {
		if (!def1 || !def2) return def1 === def2;
		const keys1 = Object.keys(def1).sort();
		const keys2 = Object.keys(def2).sort();
		if (keys1.length !== keys2.length) return false;
		return keys1.every((key, i) => key === keys2[i]);
	}

	/**
	 * Force flush all pending messages immediately
	 */
	flushAll(iframeRefGetter?: () => IframeRefs): void {
		// Clear all timers
		for (const timer of this.debounceTimers.values()) {
			clearTimeout(timer);
		}
		this.debounceTimers.clear();

		// Cancel RAF if pending
		if (this.rafHandle !== null) {
			cancelAnimationFrame(this.rafHandle);
			this.rafHandle = null;
		}

		// Flush all messages
		for (const [key, message] of this.pendingMessages.entries()) {
			const iframeRefs = iframeRefGetter ? iframeRefGetter() : message.iframeRefGetter();
			this.sendToIframes(message, iframeRefs);
			this.lastSentPayloads.set(key, message.payload);
		}
		this.pendingMessages.clear();
	}

	/**
	 * Clear all pending messages
	 */
	clear(): void {
		for (const timer of this.debounceTimers.values()) {
			clearTimeout(timer);
		}
		this.debounceTimers.clear();

		if (this.rafHandle !== null) {
			cancelAnimationFrame(this.rafHandle);
			this.rafHandle = null;
		}

		this.pendingMessages.clear();
	}

	/**
	 * Update debounce delay (for testing or tuning)
	 */
	setDebounceMs(ms: number): void {
		(this as any).DEBOUNCE_MS = ms;
	}
}

// Singleton instance
export const messageThrottler = new MessageThrottler();

