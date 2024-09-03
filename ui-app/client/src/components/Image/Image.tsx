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
import { IconHelper } from '../util/IconHelper';

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
	order: 3,
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
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<defs>
						<linearGradient
							id="_light-image-linear-gradient"
							x1="0.5"
							x2="0.5"
							y2="1"
							gradientUnits="objectBoundingBox"
						>
							<stop offset="0" stopColor="#fff" />
							<stop offset="1" stopColor="#3f83ea" />
						</linearGradient>
						<linearGradient
							id="_dark-image-linear-gradient-2"
							x1="0.5"
							x2="0.5"
							y2="1"
							gradientUnits="objectBoundingBox"
						>
							<stop offset="0" stopColor="#c1c1c1" />
							<stop offset="1" stopColor="#214883" />
						</linearGradient>
					</defs>
					<rect width="30" height="30" fill="none" />
					<g transform="translate(26 3.875)">
						<path
							d="M0,3.75A3.753,3.753,0,0,1,3.75,0h22.5A3.753,3.753,0,0,1,30,3.75V22.5a3.753,3.753,0,0,1-3.75,3.75H3.75A3.753,3.753,0,0,1,0,22.5Z"
							transform="translate(-26 -2)"
							fill="#edeaea"
						/>
					</g>
					<path
						d="M18.973,9.99a1.4,1.4,0,0,0-2.32,0l-5.1,7.477L10,15.527a1.4,1.4,0,0,0-2.191,0l-3.75,4.687a1.406,1.406,0,0,0,1.1,2.285H24.844A1.405,1.405,0,0,0,26,20.3Z"
						transform="translate(0 2.188)"
						fill="url(#_light-image-linear-gradient)"
					/>
					<path
						d="M18.973,9.99a1.4,1.4,0,0,0-2.32,0l-5.1,7.477L10,15.527a1.4,1.4,0,0,0-2.191,0l-3.75,4.687a1.406,1.406,0,0,0,1.1,2.285H24.844A1.405,1.405,0,0,0,26,20.3Z"
						transform="translate(0 2.188)"
						className="_opacityAnimation"
						opacity={0}
						fill="url(#_dark-image-linear-gradient-2)"
					/>
					<circle cx="3" cy="3" r="3" transform="translate(4 6)" fill="#ffb100" />
					<circle
						cx="3"
						cy="3"
						r="3"
						className="_opacityAnimation"
						opacity={0}
						transform="translate(4 6)"
						fill="#fff"
					/>
				</IconHelper>
			),
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
