/**
 * Overlay depth tracking.
 *
 * A shortcut registered while a modal is open belongs to that modal's layer.
 * Dispatch only considers registrations on the current layer, so an open dialog
 * owns Ctrl+S outright instead of competing with the page behind it.
 *
 * Layer 0 is the page. Popup pushes on open and pops on close.
 */

let nextLayerId = 1;
const stack: number[] = [];

const listeners = new Set<() => void>();

function notify() {
	for (const listener of listeners) {
		try {
			listener();
		} catch (err) {
			console.error('Shortcut layer listener failed', err);
		}
	}
}

/** Push a new layer. Keep the returned id and hand it back to popLayer. */
export function pushLayer(): number {
	const id = nextLayerId++;
	stack.push(id);
	notify();
	return id;
}

/**
 * Pop a specific layer. Removing by id rather than by position keeps the stack
 * correct when two overlays unmount out of order.
 */
export function popLayer(id: number): void {
	const index = stack.lastIndexOf(id);
	if (index === -1) return;
	stack.splice(index, 1);
	notify();
}

export function currentLayer(): number {
	return stack.length ? stack[stack.length - 1] : 0;
}

export function subscribeToLayers(listener: () => void): () => void {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

/** Test seam. */
export function __resetLayersForTests(): void {
	stack.length = 0;
	nextLayerId = 1;
	listeners.clear();
}
