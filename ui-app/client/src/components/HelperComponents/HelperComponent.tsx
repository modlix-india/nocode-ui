import React, { MouseEvent, ReactNode } from 'react';
import { ComponentDefinition, RenderContext } from '../../types/common';
import { PageEditorHelperComponent } from './PageEditorHelperComponent';
import { FillerValueEditorHelperComponent } from './FillerValueEditorHelperComponent';

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
	if (globalThis.designMode === 'PAGE') return <PageEditorHelperComponent {...props} />;
	else if (globalThis.designMode === 'FILLER_VALUE_EDITOR')
		return <FillerValueEditorHelperComponent {...props} />;
	return <></>;
}
