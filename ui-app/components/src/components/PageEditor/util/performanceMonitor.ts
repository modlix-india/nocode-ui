/**
 * Performance monitoring utility for PageEditor
 * Tracks render times, postMessage payload sizes, and undo stack metrics
 */

export interface PerformanceMetrics {
	renderTimes: Array<{ timestamp: number; duration: number }>;
	postMessageMetrics: Array<{
		timestamp: number;
		type: string;
		payloadSize: number;
		target: string;
	}>;
	undoStackMetrics: Array<{
		timestamp: number;
		stackSize: number;
		totalSizeMB: number;
	}>;
	storeUpdateCount: number;
	lastStoreUpdateTime: number;
}

class PerformanceMonitor {
	private metrics: PerformanceMetrics = {
		renderTimes: [],
		postMessageMetrics: [],
		undoStackMetrics: [],
		storeUpdateCount: 0,
		lastStoreUpdateTime: 0,
	};

	private enabled: boolean = false;
	private maxMetricsHistory: number = 100;

	constructor() {
		// Enable monitoring in development or when explicitly enabled
		this.enabled =
			typeof window !== 'undefined' &&
			(globalThis.isDebugMode || localStorage.getItem('pageEditor_perfMonitoring') === 'true');
	}

	/**
	 * Start measuring render time
	 */
	startRenderMeasure(): number {
		if (!this.enabled) return 0;
		return performance.now();
	}

	/**
	 * End render measurement and log if threshold exceeded
	 */
	endRenderMeasure(startTime: number, componentName: string = 'LazyPageEditor'): void {
		if (!this.enabled || startTime === 0) return;

		const duration = performance.now() - startTime;
		this.metrics.renderTimes.push({
			timestamp: Date.now(),
			duration,
		});

		// Keep only recent history
		if (this.metrics.renderTimes.length > this.maxMetricsHistory) {
			this.metrics.renderTimes.shift();
		}

		// Log slow renders (>16ms for 60fps)
		if (duration > 16) {
			console.warn(
				`[PageEditor Perf] Slow render in ${componentName}: ${duration.toFixed(2)}ms`,
			);
		}
	}

	/**
	 * Measure postMessage payload size
	 */
	measurePostMessage(
		type: string,
		payload: any,
		target: 'desktop' | 'tablet' | 'mobile' | 'template',
	): void {
		if (!this.enabled) return;

		try {
			const payloadStr = JSON.stringify(payload);
			const payloadSize = new Blob([payloadStr]).size;
			const payloadSizeMB = payloadSize / (1024 * 1024);

			this.metrics.postMessageMetrics.push({
				timestamp: Date.now(),
				type,
				payloadSize,
				target,
			});

			// Keep only recent history
			if (this.metrics.postMessageMetrics.length > this.maxMetricsHistory) {
				this.metrics.postMessageMetrics.shift();
			}

			// Log large payloads (>1MB)
			if (payloadSizeMB > 1) {
				console.warn(
					`[PageEditor Perf] Large postMessage: ${type} to ${target} - ${payloadSizeMB.toFixed(2)}MB`,
				);
			}
		} catch (e) {
			console.error('[PageEditor Perf] Failed to measure postMessage payload:', e);
		}
	}

	/**
	 * Measure undo stack size
	 */
	measureUndoStack(stack: Array<any>, stackName: 'undo' | 'redo' = 'undo'): void {
		if (!this.enabled) return;

		try {
			const stackSize = stack.length;
			let totalSize = 0;

			// Sample first, middle, and last items to estimate size
			if (stackSize > 0) {
				const sampleIndices = [
					0,
					Math.floor(stackSize / 2),
					stackSize - 1,
				].filter((idx, pos, arr) => arr.indexOf(idx) === pos);

				for (const idx of sampleIndices) {
					const itemStr = JSON.stringify(stack[idx]);
					totalSize += new Blob([itemStr]).size;
				}

				// Estimate total size (average * count)
				const avgSize = totalSize / sampleIndices.length;
				const estimatedTotalSize = avgSize * stackSize;
				const totalSizeMB = estimatedTotalSize / (1024 * 1024);

				this.metrics.undoStackMetrics.push({
					timestamp: Date.now(),
					stackSize,
					totalSizeMB,
				});

				// Keep only recent history
				if (this.metrics.undoStackMetrics.length > this.maxMetricsHistory) {
					this.metrics.undoStackMetrics.shift();
				}

				// Log if stack is getting large (>50MB)
				if (totalSizeMB > 50) {
					console.warn(
						`[PageEditor Perf] Large ${stackName} stack: ${stackSize} entries, ~${totalSizeMB.toFixed(2)}MB`,
					);
				}
			}
		} catch (e) {
			console.error('[PageEditor Perf] Failed to measure undo stack:', e);
		}
	}

	/**
	 * Track store update
	 */
	trackStoreUpdate(): void {
		if (!this.enabled) return;
		this.metrics.storeUpdateCount++;
		this.metrics.lastStoreUpdateTime = Date.now();
	}

	/**
	 * Get current metrics summary
	 */
	getMetricsSummary(): {
		avgRenderTime: number;
		maxRenderTime: number;
		avgPostMessageSize: number;
		maxPostMessageSize: number;
		undoStackSize: number;
		storeUpdateCount: number;
	} {
		const renderTimes = this.metrics.renderTimes.map(r => r.duration);
		const postMessageSizes = this.metrics.postMessageMetrics.map(m => m.payloadSize);
		const latestUndoMetric =
			this.metrics.undoStackMetrics[this.metrics.undoStackMetrics.length - 1];

		return {
			avgRenderTime:
				renderTimes.length > 0
					? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length
					: 0,
			maxRenderTime: renderTimes.length > 0 ? Math.max(...renderTimes) : 0,
			avgPostMessageSize:
				postMessageSizes.length > 0
					? postMessageSizes.reduce((a, b) => a + b, 0) / postMessageSizes.length
					: 0,
			maxPostMessageSize: postMessageSizes.length > 0 ? Math.max(...postMessageSizes) : 0,
			undoStackSize: latestUndoMetric?.stackSize ?? 0,
			storeUpdateCount: this.metrics.storeUpdateCount,
		};
	}

	/**
	 * Get full metrics (for debugging)
	 */
	getFullMetrics(): PerformanceMetrics {
		return { ...this.metrics };
	}

	/**
	 * Reset metrics
	 */
	reset(): void {
		this.metrics = {
			renderTimes: [],
			postMessageMetrics: [],
			undoStackMetrics: [],
			storeUpdateCount: 0,
			lastStoreUpdateTime: 0,
		};
	}

	/**
	 * Enable/disable monitoring
	 */
	setEnabled(enabled: boolean): void {
		this.enabled = enabled;
	}

	/**
	 * Check if monitoring is enabled
	 */
	isEnabled(): boolean {
		return this.enabled;
	}
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Expose to window for debugging
if (typeof window !== 'undefined') {
	(window as any).__pageEditorPerfMonitor = performanceMonitor;
}

