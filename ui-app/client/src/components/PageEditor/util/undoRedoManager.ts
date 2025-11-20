/**
 * Optimized undo/redo manager with size limits and diff-based storage
 * Reduces memory usage for large (10MB+) page definitions
 */

import { deepEqual, duplicate } from '@fincity/kirun-js';
import { PageDefinition } from '../../../types/common';

interface UndoRedoEntry {
	version: number;
	timestamp: number;
	// Store either full snapshot (for first entry) or diff
	snapshot?: PageDefinition;
	diff?: {
		componentDefinition?: { [key: string]: any };
		rootComponent?: string;
		properties?: any;
		eventFunctions?: any;
		version?: number;
	};
}

interface UndoRedoConfig {
	maxStackSize: number; // Maximum number of entries in stack
	maxTotalSizeMB: number; // Maximum total size in MB
	useDiffs: boolean; // Whether to use diff-based storage
	asyncPersistence: boolean; // Whether to persist to localStorage asynchronously
}

class UndoRedoManager {
	private undoStack: UndoRedoEntry[] = [];
	private redoStack: UndoRedoEntry[] = [];
	private firstSnapshot: PageDefinition | null = null;
	private config: UndoRedoConfig;

	constructor(config: Partial<UndoRedoConfig> = {}) {
		this.config = {
			maxStackSize: config.maxStackSize ?? 20,
			maxTotalSizeMB: config.maxTotalSizeMB ?? 100, // 100MB default limit
			useDiffs: config.useDiffs ?? true,
			asyncPersistence: config.asyncPersistence ?? true,
		};
	}

	/**
	 * Initialize with first snapshot
	 */
	initialize(firstSnapshot: PageDefinition): void {
		this.firstSnapshot = duplicate(firstSnapshot);
		this.undoStack = [];
		this.redoStack = [];
	}

	/**
	 * Push a new state to undo stack
	 */
		pushState(
		state: PageDefinition,
		previousState?: PageDefinition,
		onPersist?: (entry: UndoRedoEntry) => void,
	): void {
		// Clear redo stack when new state is pushed
		this.redoStack = [];

		// Skip if state hasn't changed
		const lastEntry = this.undoStack[this.undoStack.length - 1];
		const lastState = lastEntry
			? this.getStateFromEntry(lastEntry, [...this.undoStack])
			: this.firstSnapshot;

		if (lastState && deepEqual(state, lastState)) {
			return;
		}

		let entry: UndoRedoEntry;

		// Store full snapshot every 5 entries to ensure we have checkpoints
		// This makes reconstruction simpler and more reliable
		const shouldStoreSnapshot = 
			!this.config.useDiffs || 
			!lastState ||
			this.undoStack.length % 5 === 0;

		if (shouldStoreSnapshot) {
			// Store full snapshot
			entry = {
				version: state.version ?? 0,
				timestamp: Date.now(),
				snapshot: duplicate(state),
			};
		} else if (this.config.useDiffs && lastState) {
			// Create diff entry
			const diff = this.computeDiff(lastState, state);
			entry = {
				version: state.version ?? 0,
				timestamp: Date.now(),
				diff,
			};
		} else {
			// Fallback: store full snapshot
			entry = {
				version: state.version ?? 0,
				timestamp: Date.now(),
				snapshot: duplicate(state),
			};
		}

		this.undoStack.push(entry);

		// Enforce size limits
		this.enforceLimits();

		// Persist asynchronously if configured
		if (onPersist && this.config.asyncPersistence) {
			// Use requestIdleCallback or setTimeout for async persistence
			if ('requestIdleCallback' in window) {
				requestIdleCallback(() => onPersist(entry), { timeout: 2000 });
			} else {
				setTimeout(() => onPersist(entry), 0);
			}
		} else if (onPersist) {
			onPersist(entry);
		}
	}

	/**
	 * Get state from undo stack
	 * Returns the PREVIOUS state (before the current one)
	 */
	undo(): PageDefinition | null {
		if (this.undoStack.length === 0) {
			// If no entries, return first snapshot
			return this.firstSnapshot ? duplicate(this.firstSnapshot) : null;
		}

		// Pop the current state entry
		const currentEntry = this.undoStack.pop()!;
		
		// Move current entry to redo stack
		this.redoStack.push(currentEntry);

		// Return the previous state (now the last in undo stack, or first snapshot)
		if (this.undoStack.length === 0) {
			return this.firstSnapshot ? duplicate(this.firstSnapshot) : null;
		}

		// Get state from the previous entry (now the last in undo stack)
		const previousEntry = this.undoStack[this.undoStack.length - 1];
		return this.getStateFromEntry(previousEntry, this.undoStack);
	}

	/**
	 * Get state from redo stack
	 * Returns the state that was just redone
	 */
	redo(): PageDefinition | null {
		if (this.redoStack.length === 0) return null;

		// Pop the entry from redo stack
		const entry = this.redoStack.pop()!;
		
		// Move back to undo stack
		this.undoStack.push(entry);
		
		// Return the state from this entry (which is now the current state)
		const combinedStack = [...this.undoStack];
		return this.getStateFromEntry(entry, combinedStack);
	}

	/**
	 * Get current state (latest from undo stack)
	 */
	getCurrentState(): PageDefinition | null {
		if (this.undoStack.length === 0) {
			return this.firstSnapshot ? duplicate(this.firstSnapshot) : null;
		}

		const lastEntry = this.undoStack[this.undoStack.length - 1];
		return this.getStateFromEntry(lastEntry, this.undoStack);
	}

	/**
	 * Get state from an entry (reconstructing from diff if needed)
	 * For diff entries, find the nearest snapshot and apply all diffs up to this entry
	 */
	private getStateFromEntry(entry: UndoRedoEntry, stackForLookup?: UndoRedoEntry[]): PageDefinition | null {
		if (entry.snapshot) {
			return duplicate(entry.snapshot);
		}

		if (entry.diff) {
			// Use provided stack or default to undo stack
			const stack = stackForLookup || this.undoStack;
			const entryIndex = stack.indexOf(entry);
			
			if (entryIndex === -1) {
				// Entry not in provided stack, try with redo stack
				const redoIndex = this.redoStack.indexOf(entry);
				if (redoIndex !== -1) {
					// Entry is in redo stack - need to reconstruct from undo stack + redo up to this point
					const combinedStack = [...this.undoStack, ...this.redoStack.slice(0, redoIndex + 1)];
					return this.reconstructStateFromStack(combinedStack, combinedStack.length - 1);
				}
				return null;
			}

			// Reconstruct state by finding nearest snapshot and applying all diffs
			return this.reconstructStateFromStack(stack, entryIndex);
		}

		return null;
	}

	/**
	 * Reconstruct state at a given index in the stack
	 */
	private reconstructStateFromStack(stack: UndoRedoEntry[], targetIndex: number): PageDefinition | null {
		// Find the nearest snapshot before or at targetIndex
		let snapshotIndex = -1;
		for (let i = targetIndex; i >= 0; i--) {
			if (stack[i].snapshot) {
				snapshotIndex = i;
				break;
			}
		}

		// Start from first snapshot if no snapshot found in stack
		let state: PageDefinition | null = null;
		if (snapshotIndex >= 0) {
			state = duplicate(stack[snapshotIndex].snapshot!);
		} else if (this.firstSnapshot) {
			state = duplicate(this.firstSnapshot);
		} else {
			return null;
		}

		// Apply all diffs from snapshotIndex + 1 to targetIndex
		for (let i = snapshotIndex + 1; i <= targetIndex; i++) {
			const entry = stack[i];
			if (entry.diff) {
				state = this.applyDiffToState(state, entry);
			} else if (entry.snapshot) {
				state = duplicate(entry.snapshot);
			}
		}

		return state;
	}

	/**
	 * Apply diff to a state (helper for sequential diff application)
	 */
	private applyDiffToState(state: PageDefinition, entry: UndoRedoEntry): PageDefinition {
		if (!entry.diff) return duplicate(state);

		const newState = duplicate(state);

		// Apply componentDefinition diff
		if (entry.diff.componentDefinition) {
			if (!newState.componentDefinition) newState.componentDefinition = {};
			for (const [key, value] of Object.entries(entry.diff.componentDefinition)) {
				if (value === null) {
					delete newState.componentDefinition[key];
				} else {
					newState.componentDefinition[key] = duplicate(value);
				}
			}
		}

		// Apply other diffs
		if (entry.diff.rootComponent !== undefined) {
			newState.rootComponent = entry.diff.rootComponent;
		}
		if (entry.diff.properties !== undefined) {
			newState.properties = duplicate(entry.diff.properties);
		}
		if (entry.diff.eventFunctions !== undefined) {
			newState.eventFunctions = duplicate(entry.diff.eventFunctions);
		}
		if (entry.diff.version !== undefined) {
			newState.version = entry.diff.version;
		}

		return newState;
	}

	/**
	 * Compute diff between two states
	 */
	private computeDiff(oldState: PageDefinition, newState: PageDefinition): any {
		const diff: any = {};

		// Diff componentDefinition (only changed components)
		if (oldState.componentDefinition !== newState.componentDefinition) {
			diff.componentDefinition = {};
			const oldComps = oldState.componentDefinition || {};
			const newComps = newState.componentDefinition || {};

			// Find changed or new components
			for (const key in newComps) {
				if (!(key in oldComps) || !deepEqual(oldComps[key], newComps[key])) {
					diff.componentDefinition[key] = duplicate(newComps[key]);
				}
			}

			// Track deleted components
			for (const key in oldComps) {
				if (!(key in newComps)) {
					diff.componentDefinition[key] = null; // null means deleted
				}
			}

			// If no changes, don't include
			if (Object.keys(diff.componentDefinition).length === 0) {
				delete diff.componentDefinition;
			}
		}

		// Diff rootComponent
		if (oldState.rootComponent !== newState.rootComponent) {
			diff.rootComponent = newState.rootComponent;
		}

		// Diff properties (simplified - could be more granular)
		if (!deepEqual(oldState.properties, newState.properties)) {
			diff.properties = duplicate(newState.properties);
		}

		// Diff eventFunctions (simplified - could be more granular)
		if (!deepEqual(oldState.eventFunctions, newState.eventFunctions)) {
			diff.eventFunctions = duplicate(newState.eventFunctions);
		}

		// Diff version
		if (oldState.version !== newState.version) {
			diff.version = newState.version;
		}

		return diff;
	}

	/**
	 * Enforce size limits
	 */
	private enforceLimits(): void {
		// Limit stack size
		if (this.undoStack.length > this.config.maxStackSize) {
			// Remove oldest entries (keep first snapshot entry if it exists)
			const toRemove = this.undoStack.length - this.config.maxStackSize;
			this.undoStack.splice(0, toRemove);

			// If we removed the first snapshot, convert oldest diff to snapshot
			if (this.undoStack.length > 0 && !this.undoStack[0].snapshot) {
				const firstState = this.getStateFromEntry(this.undoStack[0], this.undoStack);
				if (firstState) {
					this.firstSnapshot = duplicate(firstState);
					this.undoStack[0] = {
						...this.undoStack[0],
						snapshot: duplicate(firstState),
						diff: undefined,
					};
				}
			}
		}

		// TODO: Check total size in MB and remove oldest if exceeded
		// This would require estimating entry sizes
	}

	/**
	 * Clear all stacks
	 */
	clear(): void {
		this.undoStack = [];
		this.redoStack = [];
		this.firstSnapshot = null;
	}

	/**
	 * Get stack sizes
	 */
	getStackSizes(): { undo: number; redo: number } {
		return {
			undo: this.undoStack.length,
			redo: this.redoStack.length,
		};
	}

	/**
	 * Check if undo is available
	 */
	canUndo(): boolean {
		return this.undoStack.length > 0;
	}

	/**
	 * Check if redo is available
	 */
	canRedo(): boolean {
		return this.redoStack.length > 0;
	}
}

export { UndoRedoManager, UndoRedoEntry };

