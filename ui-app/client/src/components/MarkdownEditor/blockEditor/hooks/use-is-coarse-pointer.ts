import { useEffect, useState } from 'react';

/**
 * Detects coarse pointers (touch screens) so the editor can swap its
 * hover-based affordances for a tap-anchored layout. Re-evaluates on
 * media-query change so a docked tablet that gains a mouse keeps working.
 */
export function useIsCoarsePointer(): boolean {
	const get = () => {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
		return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
	};
	const [isCoarse, setIsCoarse] = useState<boolean>(get);
	useEffect(() => {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
		const mq = window.matchMedia('(hover: none) and (pointer: coarse)');
		const onChange = () => setIsCoarse(mq.matches);
		if (mq.addEventListener) mq.addEventListener('change', onChange);
		else (mq as any).addListener?.(onChange);
		return () => {
			if (mq.removeEventListener) mq.removeEventListener('change', onChange);
			else (mq as any).removeListener?.(onChange);
		};
	}, []);
	return isCoarse;
}
