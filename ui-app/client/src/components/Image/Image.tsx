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
import { SubHelperComponent } from '../SubHelperComponent';

function ImageComponent(props: ComponentProps) {
	const { definition, locationHistory, context } = props;
	const [hover, setHover] = useState(false);
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const location = useLocation();
	const {
		properties: { alt, src, onClick: onClickEvent, fallBackImg } = {},
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
		props.pageDefinition,
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
			<SubHelperComponent
				style={resolvedStyles.inputBox ?? {}}
				className={onClickEvent ? '_onclicktrue' : ''}
				definition={definition}
				subComponentName="image"
			></SubHelperComponent>
		</div>
	);
}

const component: Component = {
	icon: 'fa-solid fa-image',
	name: 'Image',
	displayName: 'Image',
	description: 'Image Component',
	component: ImageComponent,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: ImageStyle,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['hover'],
	defaultTemplate: {
		key: '',
		name: 'Image',
		type: 'Image',
		properties: {
			src: { value: 'api/files/static/file/SYSTEM/appbuilder/Placeholder_view_vector.svg' },
			alt: { value: 'Placeholder image' },
		},
	},
};

export default component;
