import React from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './iframeProperties';
import IframeStyle from './IframeStyle';

function Iframe(props: ComponentProps) {
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	const { locationHistory, definition } = props;
	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: {
			width,
			height,
			srcdoc,
			src,
			sandbox,
			referrerpolicy,
			name,
			loading,
			allowfullscreen,
			allow,
		} = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const resolvedStyles = processComponentStylePseudoClasses({}, stylePropertiesWithPseudoStates);
	return (
		<div className="comp compIframe" style={resolvedStyles.comp ?? {}}>
			<HelperComponent definition={definition} />
			<iframe
				className="iframe"
				style={resolvedStyles.iframe ?? {}}
				width={width}
				src={src}
				height={height}
				name={name}
				loading={loading}
				allow={allow}
				sandbox={sandbox}
				referrerPolicy={referrerpolicy}
				allowFullScreen={allowfullscreen}
				srcDoc={srcdoc}
			></iframe>
		</div>
	);
}
const component: Component = {
	icon: 'fa-solid fa-clapperboard',
	name: 'Iframe',
	displayName: 'Iframe',
	description: 'Iframe component',
	component: Iframe,
	styleComponent: IframeStyle,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	defaultTemplate: {
		key: '',
		name: 'Iframe',
		type: 'Iframe',
		properties: {
			src: { value: 'https://fincity.ai/marketing' },
		},
	},
};

export default component;
