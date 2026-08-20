import React, { useContext, useEffect, useRef, useState } from 'react';
import { CraftContext } from './CraftRenderer';

interface SurfaceRow {
	surface: string;
	label: string;
	enabled: boolean;
	locked: boolean;
	reason: string;
}

// Reuses the _kwReview* block shell so this reads as part of the same review surface.
// A locked surface is shown, not hidden — otherwise the user wonders where it went.

export function ChannelControlsBlock({
	rows = [],
	ad_type,
}: Readonly<{ rows: SurfaceRow[]; ad_type?: string }>) {
	const context = useContext(CraftContext);
	if (!context)
		return <div className="_kwReviewError">Channel controls are unavailable here.</div>;
	return <ChannelControlsInner rows={rows} adType={ad_type} context={context} />;
}

function ChannelControlsInner({
	rows,
	adType,
	context,
}: Readonly<{
	rows: SurfaceRow[];
	adType?: string;
	context: NonNullable<React.ContextType<typeof CraftContext>>;
}>) {
	const { onSend } = context;
	const [busy, setBusy] = useState<string | null>(null);
	const [error, setError] = useState('');

	// Guards post-await setState against a mid-flight unmount (SSE can re-emit the craft).
	const mountedRef = useRef(true);
	useEffect(() => {
		// Set on mount, not just cleared on unmount: Fast Refresh runs the cleanup and then
		// re-runs the effect, so a body that only returned a cleanup left this false for the
		// rest of the session - and every guarded setState below silently stopped working.
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
		};
	}, []);

	const toggle = async (row: SurfaceRow) => {
		if (row.locked) return;
		setError('');
		setBusy(row.surface);
		try {
			await onSend(
				JSON.stringify({
					type: 'channel_controls_widget',
					surface: row.surface,
					enabled: !row.enabled,
				}),
				undefined,
				`${row.enabled ? 'Stop' : 'Start'} showing ads on ${row.label}`,
			);
		} catch {
			if (mountedRef.current) setError('Could not change that — please try again.');
		} finally {
			if (mountedRef.current) setBusy(null);
		}
	};

	// Counted against every row on screen. Excluding the locked ones made the total
	// disagree with the six rows listed; the locked row states its own reason.
	const live = rows.filter(r => r.enabled).length;

	return (
		<div className="_kwReviewBlock">
			<div className="_ccHeader">
				<span className="_ccCount">
					{live} of {rows.length} places
				</span>
				{adType && <span className="_ccAdType">{adType}</span>}
			</div>

			{error && (
				<div className="_kwReviewError" role="alert" onClick={() => setError('')}>
					{error}
				</div>
			)}

			<div className="_ccList">
				{rows.map(row => (
					<div key={row.surface} className={`_ccRow${row.locked ? ' _locked' : ''}`}>
						<button
							type="button"
							className={`_ccToggle${row.enabled ? ' _on' : ''}`}
							role="switch"
							aria-checked={row.enabled}
							aria-label={row.label}
							disabled={row.locked || busy !== null}
							title={row.locked ? row.reason : undefined}
							onClick={() => toggle(row)}
						>
							<span className="_ccKnob">
								{busy === row.surface && (
									<i className="fa fa-solid fa-spinner fa-spin" />
								)}
							</span>
						</button>
						<span className="_ccLabel">{row.label}</span>
						{row.locked && <span className="_ccReason">{row.reason}</span>}
					</div>
				))}
			</div>
		</div>
	);
}
