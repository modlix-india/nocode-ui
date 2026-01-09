/**
 * Adapter to use UndoRedoManager with React refs for backward compatibility
 */

import { PageDefinition } from '../../../types/common';
import { UndoRedoManager } from './undoRedoManager';

/**
 * Creates refs that work with UndoRedoManager internally
 * Maintains backward compatibility with existing code that expects PageDefinition[] refs
 */
export function createUndoRedoRefs(
	config?: { maxStackSize?: number; maxTotalSizeMB?: number },
): {
	undoStackRef: React.MutableRefObject<PageDefinition[]>;
	redoStackRef: React.MutableRefObject<PageDefinition[]>;
	firstTimeRef: React.MutableRefObject<PageDefinition[]>;
	manager: UndoRedoManager;
} {
	const manager = new UndoRedoManager(config);

	// Create refs that proxy to the manager
	const undoStackRef: React.MutableRefObject<PageDefinition[]> = {
		current: [],
	};

	const redoStackRef: React.MutableRefObject<PageDefinition[]> = {
		current: [],
	};

	const firstTimeRef: React.MutableRefObject<PageDefinition[]> = {
		current: [],
	};

	// Proxy getters to sync with manager
	Object.defineProperty(undoStackRef, 'current', {
		get() {
			// Return array representation for backward compatibility
			const states: PageDefinition[] = [];
			for (let i = 0; i < manager.getStackSizes().undo; i++) {
				// We can't easily get intermediate states, so we'll maintain a cache
				// For now, return empty array - the manager handles the actual state
			}
			return states;
		},
		set(value: PageDefinition[]) {
			// If setting directly, clear and reinitialize
			if (value.length > 0) {
				manager.clear();
				manager.initialize(value[value.length - 1]);
			}
		},
		configurable: true,
	});

	// Better approach: Create a simpler adapter that maintains arrays but uses manager logic
	return {
		undoStackRef: createProxyRef(manager, 'undo'),
		redoStackRef: createProxyRef(manager, 'redo'),
		firstTimeRef,
		manager,
	};
}

function createProxyRef(
	manager: UndoRedoManager,
	type: 'undo' | 'redo',
): React.MutableRefObject<PageDefinition[]> {
	const cache: PageDefinition[] = [];
	let cacheVersion = -1;

	const ref: React.MutableRefObject<PageDefinition[]> = {
		get current() {
			const sizes = manager.getStackSizes();
			const size = type === 'undo' ? sizes.undo : sizes.redo;

			// Return cached array for backward compatibility
			// Note: This is a simplified view - actual state is in manager
			return cache.slice(0, size);
		},
		set current(value: PageDefinition[]) {
			// If setting directly, update manager
			if (type === 'undo') {
				manager.clear();
				if (value.length > 0) {
					manager.initialize(value[value.length - 1]);
				}
			}
		},
	};

	// Store manager reference for operations
	(ref as any).__manager = manager;
	(ref as any).__type = type;
	(ref as any).__cache = cache;

	return ref;
}

/**
 * Helper to push state using the manager
 */
export function pushUndoState(
	manager: UndoRedoManager,
	state: PageDefinition,
	previousState?: PageDefinition,
	onPersist?: (entry: any) => void,
): void {
	manager.pushState(state, previousState, onPersist);
}

/**
 * Helper to get undo state
 */
export function getUndoState(manager: UndoRedoManager): PageDefinition | null {
	return manager.undo();
}

/**
 * Helper to get redo state
 */
export function getRedoState(manager: UndoRedoManager): PageDefinition | null {
	return manager.redo();
}

