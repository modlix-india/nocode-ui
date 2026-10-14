import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { draftEnvOf } from './draftAgentEnv';
import { onPlacementChange, placedCount } from './draftAgentPlacement';

const DraftAgentApp = React.lazy(() =>
	import(/* webpackChunkName: "DraftAgent" */ './LazyDraftAgent').then(m => ({
		default: m.DraftAgentApp,
	})),
);

/**
 * The agent every draft host gets without anyone placing it, mounted beside the
 * draft banner in index.tsx.
 *
 * Kept tiny and free of store imports, because index.tsx is still starting up
 * when this module loads; everything heavy arrives in the lazy chunk, and only on
 * a draft host. Renders nothing on the server or before mount, so it can never
 * disturb hydration, and nothing in the page editor's canvases.
 */
export default function DraftAgentHost() {
	const [mounted, setMounted] = useState(false);
	const [placed, setPlaced] = useState(placedCount());
	useEffect(() => {
		setMounted(true);
		return onPlacementChange(setPlaced);
	}, []);

	if (!mounted || placed > 0) return <></>;
	if (!globalThis.isDraftMode || globalThis.isDesignMode) return <></>;
	if (draftEnvOf(window.location.hostname) === undefined) return <></>;

	return (
		// Its own router: this renders beside App, outside App's BrowserRouter, and the
		// chat's markdown reads the location. Siblings are allowed; only nesting is not.
		<BrowserRouter>
			<Suspense fallback={<></>}>
				<DraftAgentApp
					defaultMode="rail"
					icon=""
					showWhenSignedOut
					placeholder="Ask the AI to change this app..."
				/>
			</Suspense>
		</BrowserRouter>
	);
}
