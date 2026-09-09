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
	// No cache of the last payload sent. It existed only to feed the dedup
	// removed above, and with nothing reading it, it was a map holding a 1.4MB
	// page definition per key for the lifetime of the editor.

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
			return;
		}

		// There is deliberately no "skip if the payload is unchanged" short circuit
		// here. The obvious cheap comparison for a page definition is name plus
		// version plus the set of component keys, and every property and style
		// edit passes that test unchanged: same keys, same version, different
		// contents. A dedup written that way silently freezes the canvas for the
		// most common edit there is. If this ever needs to become an
		// optimisation, the comparison has to be over the contents.

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

