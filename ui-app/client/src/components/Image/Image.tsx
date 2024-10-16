import React, { useEffect, useState } from 'react';
import { HelperComponent } from '../HelperComponents/HelperComponent';
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
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { styleDefaults } from './imageStyleProperties';
import getSrcUrl from '../util/getSrcUrl';

function ImageComponent(props: ComponentProps) {
	const { definition, locationHistory, context } = props;
	const [hover, setHover] = useState(false);
	const [src, setSrc] = useState('');
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const [falledBack, setFalledBack] = useState(false);
	const location = useLocation();
	const {
		properties: {
			alt,
			src: defaultSrc,
			src2,
			src3,
			src4,
			src5,
			onClick: onClickEvent,
			fallBackImg,
			imgLazyLoading,
			stopPropagation,
			preventDefault,
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
	const clickEvent = onClickEvent
		? props.pageDefinition.eventFunctions?.[onClickEvent]
		: undefined;

	useEffect(() => {
		addListenerAndCallImmediately(
			(_, value) => {
				if (value?.TABLET_LANDSCAPE_SCREEN_ONLY && src2) {
					setSrc(src2);
				} else if (value?.TABLET_POTRAIT_SCREEN_ONLY && src3) {
					setSrc(src3);
				} else if (value?.MOBILE_LANDSCAPE_SCREEN_ONLY && src4) {
					setSrc(src4);
				} else if (value?.MOBILE_POTRAIT_SCREEN_ONLY && src5) {
					setSrc(src5);
				} else {
					setSrc(defaultSrc);
				}
			},
			pageExtractor,
			'Store.devices',
		);
	}, [defaultSrc, src2, src3, src4, src5]);

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
		if (falledBack) return;
		e.currentTarget.src = fallBackImg;
		setFalledBack(true);
	};

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover },
		stylePropertiesWithPseudoStates,
	);

	const actualSrc = getSrcUrl(getHref(src ?? defaultSrc, location));

	let imageTag = undefined;

	if (actualSrc) {
		imageTag = (
			<>
				<img
					onMouseEnter={
						stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined
					}
					onMouseLeave={
						stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
					}
					onClick={
						onClickEvent
							? ev => {
									if (stopPropagation) ev.stopPropagation();
									if (preventDefault) ev.preventDefault();
									handleClick();
								}
							: undefined
					}
					className={onClickEvent ? '_onclicktrue' : ''}
					style={resolvedStyles.image ?? {}}
					src={actualSrc}
					alt={alt}
					onError={fallBackImg ? handleError : undefined}
					loading={imgLazyLoading ? 'lazy' : 'eager'}
				/>
				<SubHelperComponent
					style={resolvedStyles.image ?? {}}
					className={onClickEvent ? '_onclicktrue' : ''}
					definition={definition}
					subComponentName="image"
				></SubHelperComponent>
			</>
		);
	}

	return (
		<div className="comp compImage" style={resolvedStyles.comp ?? {}}>
			<HelperComponent context={props.context} definition={definition} />
			{imageTag}
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
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['hover'],
	defaultTemplate: {
		key: '',
		name: 'image',
		type: 'Image',
		properties: {
			src: { value: 'api/files/static/file/SYSTEM/appbuilder/sample.svg' },
			alt: { value: 'Image' },
		},
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: 'fa-solid fa-image',
		},
		{
			name: 'image',
			displayName: 'Image',
			description: 'Image',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
