/**
 * Every draft host gets the agent without anyone placing it (DraftAgentHost, next
 * to the draft banner). A page that places the component on purpose wants ITS
 * settings, so while one is mounted the automatic copy stands aside rather than
 * putting two buttons on screen.
 *
 * No imports on purpose: index.tsx reaches this through the host, and must not
 * pull the store in while it is still starting up.
 */

let placed = 0;
const listeners = new Set<(n: number) => void>();

export function claimPlacement(): () => void {
	placed++;
	listeners.forEach(fn => fn(placed));
	return () => {
		placed--;
		listeners.forEach(fn => fn(placed));
	};
}

export function placedCount(): number {
	return placed;
}

export function onPlacementChange(fn: (n: number) => void): () => void {
	listeners.add(fn);
	return () => listeners.delete(fn);
}
