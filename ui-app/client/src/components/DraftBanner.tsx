import React from 'react';

/**
 * A persistent marker that this is the app's draft surface, not production.
 *
 * The draft surface is a complete copy of the app: its own definitions, its own
 * schemas and its own data. It looks exactly like the real thing, which is the
 * point and also the hazard, so there needs to be something on screen that says
 * otherwise. Someone entering real customer data into a sandbox because the two
 * were indistinguishable is a plausible and expensive mistake.
 *
 * Deliberately fixed and always visible rather than dismissible: the moment
 * someone forgets which surface they are on is exactly when it needs to be there.
 * It sits at the bottom so it does not cover an app's own header, and is
 * pointer-events: none so it can never swallow a click.
 *
 * Not in design mode. The page editor's canvas is now genuinely on the draft
 * surface, so the server stamps `data-draft` there too and this would render
 * inside every preview iframe. Nobody in the page editor is confused about which
 * surface they are looking at -- the whole screen is the editor -- and a banner
 * pinned to the bottom of each of the three canvases only covers the page being
 * worked on.
 */
export default function DraftBanner() {
	if (!globalThis.isDraftMode || globalThis.isDesignMode) return <></>;

	return (
		<div
			role="status"
			aria-label="Draft surface"
			style={{
				position: 'fixed',
				bottom: 0,
				left: 0,
				right: 0,
				zIndex: 2147483000,
				pointerEvents: 'none',
				display: 'flex',
				justifyContent: 'center',
				padding: '4px 0',
				background:
					'repeating-linear-gradient(45deg, rgba(180,83,9,0.92), rgba(180,83,9,0.92) 10px, rgba(146,64,14,0.92) 10px, rgba(146,64,14,0.92) 20px)',
				color: '#fff',
				font: '600 11px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif',
				letterSpacing: '0.08em',
				textTransform: 'uppercase',
			}}
		>
			Draft surface. Not live. Data here is separate from production.
		</div>
	);
}
