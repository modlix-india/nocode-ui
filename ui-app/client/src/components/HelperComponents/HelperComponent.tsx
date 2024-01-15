import React, { MouseEvent, ReactNode } from 'react';
import { ComponentDefinition } from '../../types/common';
import { PageEditorHelperComponent } from './PageEditorHelperComponent';
import { FillerValueEditorHelperComponent } from './FillerValueEditorHelperComponent';

export function HelperComponent(
	props: Readonly<{
		definition: ComponentDefinition;
		children?: ReactNode;
		showNameLabel?: boolean;
		onMouseOver?: (e: MouseEvent) => void;
		onMouseOut?: (e: MouseEvent) => void;
		onClick?: (e: MouseEvent) => void;
		onDoubleClick?: (e: MouseEvent) => void;
	}>,
) {
	if (window.designMode === 'PAGE') return <PageEditorHelperComponent {...props} />;
	else if (window.designMode === 'FILLER_VALUE_EDITOR')
		return <FillerValueEditorHelperComponent {...props} />;
	return <></>;
}
