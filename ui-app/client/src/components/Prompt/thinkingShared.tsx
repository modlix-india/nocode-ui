/**
 * One open/closed state for every thinking block of a Prompt (ADZ-2065).
 *
 * With `rememberThinking` on, clicking ANY thinking block (the thinking box, a
 * sub-agent card, the step card, the folded "Worked for 12s" row) opens or closes
 * ALL of them together, and the choice is remembered per user in the personalization
 * service. Until the person has clicked once there is no shared choice (`open` is
 * undefined) and each block keeps its own default: open while it works, folded when
 * it is done.
 *
 * Without the prop no provider is mounted, `useThinkingShared()` returns undefined
 * and every block behaves exactly as before.
 */

import React, { createContext, useContext } from 'react';

export interface ThinkingShared {
	/** The person's choice, or undefined when they have not made one. */
	open: boolean | undefined;
	/** Open (true) or close (false) every thinking block, and remember it. */
	set: (open: boolean) => void;
}

const ThinkingSharedContext = createContext<ThinkingShared | undefined>(undefined);

export function useThinkingShared(): ThinkingShared | undefined {
	return useContext(ThinkingSharedContext);
}

/**
 * What a block does when it is clicked: with a shared state, flip what it shows
 * for every block; without, flip only itself.
 */
export function useBlockOpen(
	local: boolean,
	setLocal: React.Dispatch<React.SetStateAction<boolean>>,
): { open: boolean; toggle: () => void } {
	const shared = useThinkingShared();
	const open = shared?.open ?? local;
	const toggle = () => {
		if (shared) shared.set(!open);
		else setLocal(prev => !prev);
	};
	return { open, toggle };
}

/**
 * The messages column, with the shared state provided to every block inside it.
 * A component of its own so LazyPrompt's markup keeps its shape and indentation.
 */
export const ThinkingScope = React.forwardRef<
	HTMLDivElement,
	{ className?: string; shared: ThinkingShared | undefined; children?: React.ReactNode }
>(function ThinkingScope({ className, shared, children }, ref) {
	return (
		<ThinkingSharedContext.Provider value={shared}>
			<div className={className} ref={ref}>
				{children}
			</div>
		</ThinkingSharedContext.Provider>
	);
});
