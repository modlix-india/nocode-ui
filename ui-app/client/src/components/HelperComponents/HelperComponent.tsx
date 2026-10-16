import React, { MouseEvent, ReactNode, Suspense } from 'react';
import { ComponentDefinition, RenderContext } from '../../types/common';
import { FillerValueEditorHelperComponent } from './FillerValueEditorHelperComponent';

// Only the page editor's preview draws this, and it reads the editor's SubCompInfo (over 200KB of
// source). Imported directly, every component's HelperComponent put that in every visitor's
// startup download; behind React.lazy it loads only where `designMode` is PAGE, which is never a
// server-rendered page.
const PageEditorHelperComponent = React.lazy(() =>
	import(/* webpackChunkName: "PageEditorHelper" */ './PageEditorHelperComponent').then(m => ({
		default: m.PageEditorHelperComponent,
	})),
);

export function HelperComponent(
	props: Readonly<{
		definition: ComponentDefinition;
		context: RenderContext;
		children?: ReactNode;
		showNameLabel?: boolean;
		onMouseOver?: (e: MouseEvent) => void;
		onMouseOut?: (e: MouseEvent) => void;
		onClick?: (e: MouseEvent) => void;
		onDoubleClick?: (e: MouseEvent) => void;
	}>,
) {
	if (props.context.disableSelection) return <></>;
	// `draftPick`: the draft agent's picker reuses these overlays on a running draft.
	if (globalThis.designMode === 'PAGE' || globalThis.draftPick)
		return (
			<Suspense fallback={<></>}>
				<PageEditorHelperComponent {...props} />
			</Suspense>
		);
	else if (globalThis.designMode === 'FILLER_VALUE_EDITOR')
		return <FillerValueEditorHelperComponent {...props} />;
	return <></>;
}
