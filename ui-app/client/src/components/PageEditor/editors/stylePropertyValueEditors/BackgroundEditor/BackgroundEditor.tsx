import React from 'react';
import { StyleEditorsProps } from '../simpleEditors';
import { BackgroundLayerEditor } from './BackgroundLayerEditor';
import { BackgroundSharedPropertiesEditor } from './BackgroundSharedPropertiesEditor';

export function BackgroundEditor(props: Readonly<StyleEditorsProps>) {
	if (!props.isDetailStyleEditor) {
		return <BackgroundLayerEditor {...props} />;
	}

	return (
		<>
			<BackgroundLayerEditor {...props} />
			<BackgroundSharedPropertiesEditor {...props} />
		</>
	);
}
