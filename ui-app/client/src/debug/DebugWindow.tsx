import React, { Suspense } from 'react';

const LazyDebugWindow = React.lazy(
	() => import(/* webpackChunkName: "DebugWindow" */ './LazyDebugWindow'),
);

export default function LoadLazyDebugWindow() {
	// Only show debug window when in debug mode
	if (!isDebugMode) {
		return <></>;
	}

	return (
		<Suspense fallback={<>...</>}>
			<LazyDebugWindow />
		</Suspense>
	);
}
