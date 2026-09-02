import { useEffect } from 'react';

/** How long the modifier must be held before hints appear. */
const HOLD_MS = 500;

/** The bare modifier held, and the class that reveals chips bound to it. */
const MODIFIER_CLASSES: Readonly<{ [key: string]: string }> = {
	Meta: '_modMeta',
	Control: '_modCtrl',
	Alt: '_modAlt',
};

const ALL_CLASSES = Object.values(MODIFIER_CLASSES);

/**
 * Hold a modifier for half a second and every shortcut on screen shows its key.
 *
 * All this does is put one class on the body. The chip itself is rendered inline by
 * the component that owns the shortcut and is hidden by CSS until the class it needs
 * appears, so nothing here measures or positions anything: a chip cannot be in the
 * wrong place, it survives scrolling, and its appearance belongs to the component's
 * own theme rather than to a floating layer.
 */
export function ShortcutModifierHold() {
	useEffect(() => {
		let timer: ReturnType<typeof setTimeout> | undefined;

		const clear = () => {
			if (timer) {
				clearTimeout(timer);
				timer = undefined;
			}
			document.body.classList.remove(...ALL_CLASSES);
		};

		const onKeyDown = (e: KeyboardEvent) => {
			const revealClass = MODIFIER_CLASSES[e.key];

			// Only one bare modifier arms the reveal. Anything else clears it: a second
			// modifier, Shift, and the second key of a real shortcut. A modifier's own
			// keydown reports itself as down, hence the per-key exclusions.
			const anotherModifierDown =
				(e.key !== 'Control' && e.ctrlKey) ||
				(e.key !== 'Meta' && e.metaKey) ||
				(e.key !== 'Alt' && e.altKey) ||
				e.shiftKey;

			if (!revealClass || anotherModifierDown) {
				clear();
				return;
			}

			if (e.repeat || timer || document.body.classList.contains(revealClass)) return;

			timer = setTimeout(() => {
				timer = undefined;
				document.body.classList.add(revealClass);
			}, HOLD_MS);
		};

		const onKeyUp = (e: KeyboardEvent) => {
			if (MODIFIER_CLASSES[e.key]) clear();
		};

		const onVisibilityChange = () => {
			if (document.hidden) clear();
		};

		// Capture phase on window, so a shortcut that stops propagation in the
		// registry's document handler still clears a pending reveal.
		window.addEventListener('keydown', onKeyDown, true);
		window.addEventListener('keyup', onKeyUp, true);
		// Cmd+Tab and the like take the modifier away without ever sending a keyup.
		window.addEventListener('blur', clear);
		document.addEventListener('visibilitychange', onVisibilityChange);

		return () => {
			window.removeEventListener('keydown', onKeyDown, true);
			window.removeEventListener('keyup', onKeyUp, true);
			window.removeEventListener('blur', clear);
			document.removeEventListener('visibilitychange', onVisibilityChange);
			clear();
		};
	}, []);

	return null;
}

export default ShortcutModifierHold;
