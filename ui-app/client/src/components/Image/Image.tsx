import React, { useState } from 'react';
import { HelperComponent } from '../HelperComponent';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import useDefinition from '../util/useDefinition';
import { PageStoreExtractor } from '../../context/StoreContext';
import { propertiesDefinition, stylePropertiesDefinition } from './imageProperties';
import ImageStyle from './ImageStyles';
import { runEvent } from '../util/runEvent';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { getHref } from '../util/getHref';
import { useLocation } from 'react-router-dom';

function ImageComponent(props: ComponentProps) {
	const { definition, locationHistory, context } = props;
	const [hover, setHover] = useState(false);
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const location = useLocation();
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
		(async () =>
			await runEvent(
				clickEvent,
				key,
				props.context.pageName,
				props.locationHistory,
				props.pageDefinition,
			))();
	};
	const handleError = (e: any) => {
		if (fallBackImg) {
			e.currentTarget.src = fallBackImg;
		}
	};

	const resolvedStyles = processComponentStylePseudoClasses(
		{ hover },
		stylePropertiesWithPseudoStates,
	);

	return (
		<div className="comp compImage" style={resolvedStyles.comp ?? {}}>
			<HelperComponent definition={definition} />
			<img
				onMouseEnter={
					stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined
				}
				onMouseLeave={
					stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
				}
				onClick={onClickEvent ? handleClick : undefined}
				className={onClickEvent ? '_onclicktrue' : ''}
				style={resolvedStyles.image ?? {}}
				src={getHref(src, location)}
				alt={alt}
				onError={fallBackImg ? handleError : undefined}
			/>
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
	stylePseudoStates: ['hover'],
};

export default component;
