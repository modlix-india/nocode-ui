import React, { useEffect, useRef, useState } from 'react';
import { workLabel } from '../collapseWork';
import { useBlockOpen } from '../thinkingShared';

interface WorkSummaryProps {
	/** The reply is still being written. */
	live: boolean;
	/** An approval card is waiting on the user: the dot stops pulsing. */
	waiting?: boolean;
	/** Shown while live. */
	thinkingText: string;
	/** How long the turn took, when the history says so. A turn watched here is timed here. */
	durationMs?: number;
	/** Tool calls the turn made. */
	steps: number;
	/** Whether there is anything to open. */
	hasDetails: boolean;
	expandIcon?: string;
	collapseIcon?: string;
	/**
	 * Show the working while the reply is live, without a click (the step card must be
	 * seen while the agent works). It folds when the turn ends.
	 */
	liveBody?: boolean;
	/** With `liveBody`: leave out the "Thinking..." line once the working has something to show. */
	hideLiveHeader?: boolean;
	/** Fill the chat column (the step card inside is as wide as an agent card). */
	wide?: boolean;
	/** Between the time and the steps of the folded line ('Worked for 12s, 4 steps'). */
	labelSeparator?: string;
	/** The working, drawn as the normal chat draws it; only rendered when open. */
	children?: React.ReactNode;
}

/**
 * Collapse Work's folded line (CXZ-1781): "Thinking..." while the agent works,
 * "Worked for 12s · 4 steps" after, closed by default and closed again when the
 * turn ends. Opening it shows the reasoning, tool rows and agent cards.
 */
export function WorkSummary({
	live,
	waiting,
	thinkingText,
	durationMs,
	steps,
	hasDetails,
	expandIcon = 'fa fa-chevron-down',
	collapseIcon = 'fa fa-chevron-up',
	liveBody = false,
	hideLiveHeader = false,
	wide = false,
	labelSeparator,
	children,
}: Readonly<WorkSummaryProps>) {
	const [localExpanded, setExpanded] = useState(false);
	// With rememberThinking every thinking block shares one open/closed state.
	const { open: expanded, toggle } = useBlockOpen(localExpanded, setExpanded);
	const startedAt = useRef<number | undefined>(live ? Date.now() : undefined);
	const [measuredMs, setMeasuredMs] = useState<number | undefined>(undefined);
	const wasLive = useRef(live);

	useEffect(() => {
		if (live && !wasLive.current) startedAt.current = Date.now();
		if (!live && wasLive.current) {
			// The turn ended: fold the working away under the answer.
			setExpanded(false);
			if (startedAt.current !== undefined) setMeasuredMs(Date.now() - startedAt.current);
		}
		wasLive.current = live;
	}, [live]);

	if (!live && !hasDetails) return null;

	const label = live ? thinkingText : workLabel(durationMs ?? measuredMs, steps, labelSeparator);
	const open = expanded && hasDetails;
	const showBody = (live && liveBody && hasDetails) || open;
	const showHeader = !(live && liveBody && hideLiveHeader && hasDetails);

	return (
		<div
			className={`_thinkingBlock _workSummary ${live ? '_active' : '_done'}${showHeader ? '' : ' _bare'}${wide ? ' _wide' : ''}`}
		>
			{showHeader && (
				<button
					type="button"
					className={`_thinkingHeader ${live ? '_activeHeader' : '_doneHeader'}${hasDetails ? '' : ' _static'}`}
					onClick={() => hasDetails && toggle()}
					aria-expanded={hasDetails ? open : undefined}
					role={live ? 'status' : undefined}
				>
					{live && <span className={`_statusDot ${waiting ? '_success' : '_running'}`} />}
					<span className="_thinkingLabel">{label}</span>
					{hasDetails && (
						<i className={`_thinkingChevron ${open ? collapseIcon : expandIcon}`} />
					)}
				</button>
			)}
			{showBody && <div className="_workSummaryBody">{children}</div>}
		</div>
	);
}
