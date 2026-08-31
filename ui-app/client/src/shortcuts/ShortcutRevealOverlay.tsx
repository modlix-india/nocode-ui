import React, { useCallback, useEffect, useRef, useState } from 'react';
import Portal from '../components/Portal';
import { formatCombo, isApplePlatform } from './comboUtil';
import { shortcutRegistry } from './shortcutRegistry';

/** How long the modifier must be held before chips appear. */
const HOLD_MS = 500;

/** Guard against a repeater with hundreds of shortcut-bound rows. */
const MAX_CHIPS = 100;

interface Chip {
	id: string;
	display: string;
	top: number;
	left: number;
}

/**
 * Hold Cmd or Ctrl for half a second and every shortcut on screen flashes its chip.
 *
 * This reads the registry directly, so any component that calls `useShortcut` with an
 * element ref gets it with no rendering of its own. The chips are painted in a fixed
 * layer over the page rather than inline, so nothing shifts position.
 */
export function ShortcutRevealOverlay() {
	const [chips, setChips] = useState<Array<Chip> | undefined>(undefined);
	const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	const cancel = useCallback(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = undefined;
		}
		setChips(current => (current ? undefined : current));
	}, []);

	const measure = useCallback(() => {
		const viewportHeight = window.innerHeight;
		const viewportWidth = window.innerWidth;
		const next: Array<Chip> = [];

		for (const reg of shortcutRegistry.visible()) {
			if (next.length >= MAX_CHIPS) break;

			const el = reg.element?.();
			if (!el) continue;

			const rect = el.getBoundingClientRect();
			if (!rect.width || !rect.height) continue;
			if (rect.bottom < 0 || rect.top > viewportHeight) continue;
			if (rect.right < 0 || rect.left > viewportWidth) continue;

			const display = formatCombo(reg.spec);
			if (!display) continue;

			next.push({ id: reg.id, display, top: rect.top, left: rect.right });
		}

		setChips(next.length ? next : undefined);
	}, []);

	useEffect(() => {
		const isPrimaryModifier = (e: KeyboardEvent) =>
			isApplePlatform() ? e.key === 'Meta' : e.key === 'Control';

		const onKeyDown = (e: KeyboardEvent) => {
			// Only a bare modifier arms the reveal. Anything else cancels it, including
			// the second key of a real shortcut.
			if (!isPrimaryModifier(e) || e.altKey || e.shiftKey) {
				cancel();
				return;
			}
			if (e.repeat || timerRef.current) return;
			timerRef.current = setTimeout(() => {
				timerRef.current = undefined;
				measure();
			}, HOLD_MS);
		};

		const onKeyUp = (e: KeyboardEvent) => {
			if (isPrimaryModifier(e)) cancel();
		};

		// Capture phase on window, so a shortcut that stops propagation in the
		// registry's document handler still cancels the pending reveal.
		window.addEventListener('keydown', onKeyDown, true);
		window.addEventListener('keyup', onKeyUp, true);
		window.addEventListener('blur', cancel);
		window.addEventListener('scroll', cancel, true);
		window.addEventListener('resize', cancel);

		return () => {
			window.removeEventListener('keydown', onKeyDown, true);
			window.removeEventListener('keyup', onKeyUp, true);
			window.removeEventListener('blur', cancel);
			window.removeEventListener('scroll', cancel, true);
			window.removeEventListener('resize', cancel);
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [cancel, measure]);

	if (!chips?.length) return null;

	return (
		<Portal>
			<div className="_shortcutRevealLayer" aria-hidden="true">
				{chips.map(chip => (
					<span
						key={chip.id}
						className="_shortcutRevealChip"
						style={{ top: `${chip.top}px`, left: `${chip.left}px` }}
					>
						{chip.display}
					</span>
				))}
			</div>
		</Portal>
	);
}

export default ShortcutRevealOverlay;
