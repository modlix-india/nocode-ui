import { useEffect, useRef, useState } from 'react';

// A panel action is a JSON message on the chat channel — the router recognises `type` and
// mutates with no LLM turn. Every panel wrapped it in the same clear/busy/send/catch dance.
export function useWidgetSend(
	type: string,
	onSend: (msg: string, files?: undefined, display?: string) => Promise<void>,
	// Each panel keeps its own wording — a shared default silently rewrote one of them.
	onFailure = 'Action failed — please try again.',
) {
	const [busyId, setBusyId] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Set on mount, not just cleared on unmount: Fast Refresh runs the cleanup and then
	// re-runs the effect, so a cleanup-only body left this false for the rest of the session
	// and every guarded setState below silently stopped working.
	const mountedRef = useRef(true);
	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
		};
	}, []);

	const clearError = (key: string) =>
		setErrors(prev => {
			const next = { ...prev };
			delete next[key];
			return next;
		});

	const setError = (key: string, msg: string) => setErrors(prev => ({ ...prev, [key]: msg }));

	// `id` marks which control spins, `key` where the error shows — one row can hold several
	// buttons but only one error.
	const send = async (
		id: string,
		key: string,
		payload: Record<string, unknown>,
		display: string,
	): Promise<boolean> => {
		clearError(key);
		setBusyId(id);
		try {
			await onSend(JSON.stringify({ type, ...payload }), undefined, display);
			return true;
		} catch {
			if (mountedRef.current) setError(key, onFailure);
			return false;
		} finally {
			if (mountedRef.current) setBusyId(null);
		}
	};

	return { send, busyId, errors, setError, clearError, mountedRef };
}
