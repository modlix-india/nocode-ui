import React, { useEffect, useState } from 'react';
import { HelperComponent } from '../HelperComponent';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import useDefinition from '../util/useDefinition';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getData,
} from '../../context/StoreContext';
import { propertiesDefinition, stylePropertiesDefinition } from './imageProperties';
import ImageStyle from './ImageStyles';
import { runEvent } from '../util/runEvent';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { getHref } from '../util/getHref';
import { useLocation } from 'react-router-dom';

function ImageComponent(props: ComponentProps) {
	const { definition, locationHistory, context } = props;
	const [hover, setHover] = useState(false);
	const [src, setSrc] = useState('');
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const location = useLocation();
	const {
		properties: {
			alt,
			src1,
			src2,
			src3,
			src4,
			src5,
			src6,
			onClick: onClickEvent,
			fallBackImg,
		} = {},
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

	useEffect(() => {
		addListenerAndCallImmediately(
			(_, value) => {
				if (value?.WIDE_SCREEN) {
					setSrc(src6);
				} else if (value?.DESKTOP_SCREEN_ONLY) {
					setSrc(src1);
				} else if (value?.TABLET_LANDSCAPE_SCREEN_ONLY) {
					setSrc(src2);
				} else if (value?.TABLET_POTRAIT_SCREEN_ONLY) {
					setSrc(src3);
				} else if (value?.MOBILE_LANDSCAPE_SCREEN_ONLY) {
					setSrc(src4);
				} else if (value?.MOBILE_POTRAIT_SCREEN_ONLY) {
					setSrc(src5);
				}
			},
			pageExtractor,
			'Store.devices',
		);
	}, []);

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
