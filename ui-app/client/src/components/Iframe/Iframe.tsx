import React from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponent';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './iframeProperties';
import IframeStyle from './IframeStyle';

function Iframe(props: ComponentProps) {
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	const {
		definition: { bindingPath },
		locationHistory,
		context,
		definition,
		pageDefinition: { translations },
	} = props;
	const {
		key,
		properties: {
			width,
			height,
			srcdoc,
			src,
			sandbox,
			referrerpolicy,
			name,
			loading,
			csp,
			allowfullscreen,
			allow,
			onClick: onClickEvent,
		} = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const clickEvent = onClickEvent ? props.pageDefinition.eventFunctions[onClickEvent] : undefined;
	const handleClick = () => {
		(async () =>
			await runEvent(
				clickEvent,
				key,
				props.context.pageName,
				props.locationHistory,
				props.pageDefinition,
			))();
	};

	return (
		<div className="comp compIframe">
			<HelperComponent definition={definition} />
			<iframe>
				className= "" width={width}
				src={src}
				height ={height}
				allowfullscreen ={allowfullscreen}
				referrerpolicy={referrerpolicy}
				name={name}
				loading={loading}
				allow={allow}
				csp={csp}
				srcdoc={srcdoc}
				sandbox={sandbox}
			</iframe>
		</div>
	);
}
const component: Component = {
	icon: '',
	name: 'Iframe',
	displayName: 'Iframe',
	description: 'Iframe component',
	component: Iframe,
	styleComponent: IframeStyle,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	stylePseudoStates: ['hover', 'focus', 'disabled'],
};

export default component;
