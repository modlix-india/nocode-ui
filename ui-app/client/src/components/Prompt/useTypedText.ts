import { useEffect, useState } from 'react';

/**
 * Show a reply's text a little more every frame, so it types out.
 *
 * The model's own words already arrive a few at a time, but a tool can post a
 * whole question in one piece, and that landed on screen all at once. Typing
 * speeds up the further behind it is, so a long block still lands in about a
 * second, and it carries on after the stream ends until it has caught up.
 *
 * With `typeOut` false the text is shown whole: an old chat opened from history
 * should not type itself out again.
 */
export function useTypedText(text: string, typeOut: boolean): string {
	const [typedLength, setTypedLength] = useState(typeOut ? 0 : text.length);

	useEffect(() => {
		if (!typeOut || typedLength === text.length) return;
		// The text got shorter (a card took the start of it): type on from its new end.
		if (typedLength > text.length) {
			setTypedLength(text.length);
			return;
		}
		const frame = requestAnimationFrame(() =>
			setTypedLength(
				Math.min(text.length, typedLength + typingStep(text.length - typedLength)),
			),
		);
		return () => cancelAnimationFrame(frame);
	}, [text, typeOut, typedLength]);

	return typeOut ? text.slice(0, typedLength) : text;
}

/** How many characters to reveal in one frame, when `behind` are still hidden. */
export function typingStep(behind: number): number {
	return Math.max(2, Math.ceil(behind / 15));
}
