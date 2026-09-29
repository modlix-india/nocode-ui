import { useEffect, useRef, useState } from 'react';

/**
 * Types out a live reply's text at a steady pace. A tool can post a whole
 * question in one piece, so without this a live reply jumps in instead of
 * typing (live 2026-09-29). Text that was never live shows at once; once a
 * reply starts typing it finishes, even after the reply itself has ended.
 */
export function useTypedText(text: string, live: boolean): string {
	const [shown, setShown] = useState(() => (live ? 0 : text.length));
	const typedRef = useRef(live);

	useEffect(() => {
		if (live) typedRef.current = true;
	}, [live]);

	useEffect(() => {
		if (shown > text.length) {
			setShown(text.length);
			return;
		}
		if (shown === text.length) return;
		if (!typedRef.current) {
			setShown(text.length);
			return;
		}
		const frame = requestAnimationFrame(() =>
			setShown(s => Math.min(text.length, s + typingStep(text.length - s))),
		);
		return () => cancelAnimationFrame(frame);
	}, [text, shown]);

	return text.slice(0, shown);
}

// Characters revealed per frame: a steady pace for short text, faster when far
// behind, so a long block still lands in about a second.
export function typingStep(behind: number): number {
	return Math.max(2, Math.ceil(behind / 15));
}
