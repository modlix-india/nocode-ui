import React from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './iframeProperties';
import IframeStyle from './IframeStyle';
import { styleDefaults } from './iframeStyleProperties';

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

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	let shouldRenderIframe = false;
 
    if (!srcdoc?.trim()) {
        try {
            if (src) {
                new URL(src, window.location.origin);
                shouldRenderIframe = true;
            }
        } catch (err) {}
    } else shouldRenderIframe = true;


	return (
		<div className="comp compIframe" style={resolvedStyles.comp ?? {}}>
			<HelperComponent context={props.context} definition={definition} />
			{shouldRenderIframe ? (
				<iframe
					className="iframe"
					style={resolvedStyles.iframe ?? {}}
					width={width}
					src={srcdoc ? undefined : src}
					srcDoc={srcdoc}
					height={height}
					name={name}
					loading={loading}
					allow={allow}
					sandbox={sandbox}
					referrerPolicy={referrerpolicy}
					allowFullScreen={allowfullscreen}
				></iframe>
			) : null}
		</div>
	);
}

const component: Component = {
	order: 18,
	name: 'Iframe',
	displayName: 'Iframe',
	description: 'Iframe component',
	component: Iframe,
	styleComponent: IframeStyle,
	styleDefaults: styleDefaults,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	defaultTemplate: {
		key: '',
		name: 'Iframe',
		type: 'Iframe',
		properties: {},
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: 'fa-solid fa-clapperboard',
		},
		{
			name: 'iframe',
			displayName: 'Iframe',
			description: 'Iframe',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
