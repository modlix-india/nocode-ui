import React, { useState } from 'react';
import { HelperComponent } from '../HelperComponent';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import useDefinition from '../util/useDefinition';
import { PageStoreExtractor } from '../../context/StoreContext';
import { propertiesDefinition, stylePropertiesDefinition } from './imageProperties';
import ImageStyle from './ImageStyles';
import { runEvent } from '../util/runEvent';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';

function ImageComponent(props: ComponentProps) {
	const { definition, locationHistory, context } = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		properties: { alt, src, onClickEvent, fallBackImg } = {},
		key,
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const clickEvent = onClickEvent ? props.pageDefinition.eventFunctions[onClickEvent] : undefined;

	const handleClick = () => {
		(async () => await runEvent(onClickEvent, key, props.context.pageName))();
	};
	const handleError = (e: any) => {
		if (fallBackImg) {
			e.currentTarget.src = fallBackImg;
		}
	};

	const resolvedStyles = processComponentStylePseudoClasses({}, stylePropertiesWithPseudoStates);

	return (
		<div className="comp compImage">
			<HelperComponent definition={definition} />
			<div
				onClick={onClickEvent ? handleClick : undefined}
				style={resolvedStyles.container ?? {}}
				className={`container ${onClickEvent ? 'onClickTrue' : ''}`}
			>
				<img
					className="image"
					style={resolvedStyles.image ?? {}}
					src={src}
					alt={alt}
					onError={fallBackImg ? handleError : undefined}
				/>
			</div>
		</div>
	);
}

const component: Component = {
	name: 'Image',
	displayName: 'Image',
	description: 'Image Component',
	component: ImageComponent,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: ImageStyle,
	styleProperties: stylePropertiesDefinition,
};

export default component;
