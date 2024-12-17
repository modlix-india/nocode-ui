import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PageStoreExtractor, addListenerAndCallImmediately } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { getHref } from '../util/getHref';
import getSrcUrl from '../util/getSrcUrl';
import { IconHelper } from '../util/IconHelper';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './imageProperties';
import { styleDefaults } from './imageStyleProperties';
import ImageStyle from './ImageStyles';

function ImageComponent(props: Readonly<ComponentProps>) {
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

	const actualSrc = getSrcUrl(getHref(src ?? defaultSrc, location)!);

	const [firstTime, setFirstTime] = useState(true);
	useEffect(() => {
		setFirstTime(true);
	}, [actualSrc]);

	let imageTag = undefined;
	const styleObject =
		(resolvedStyles.image && firstTime ? { ...resolvedStyles.image } : resolvedStyles.image) ??
		{};

	if (firstTime) {
		styleObject.opacity = 0;
	}

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
					tabIndex={onClickEvent ? 0 : undefined}
					style={styleObject}
					src={actualSrc}
					alt={alt}
					onError={fallBackImg ? handleError : undefined}
					loading={imgLazyLoading ? 'lazy' : 'eager'}
					onLoad={() => setFirstTime(false)}
				/>
				<SubHelperComponent
					style={styleObject}
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
					<path
						d="M0 3.75C0 1.68164 1.68164 0 3.75 0H26.25C28.3184 0 30 1.68164 30 3.75V22.5C30 24.5684 28.3184 26.25 26.25 26.25H3.75C1.68164 26.25 0 24.5684 0 22.5V3.75ZM18.9727 9.99023C18.709 9.60352 18.2754 9.375 17.8125 9.375C17.3496 9.375 16.9102 9.60352 16.6523 9.99023L11.5547 17.4668L10.002 15.5273C9.73242 15.1934 9.32812 15 8.90625 15C8.48438 15 8.07422 15.1934 7.81055 15.5273L4.06055 20.2148C3.7207 20.6367 3.65625 21.2168 3.89062 21.7031C4.125 22.1895 4.61719 22.5 5.15625 22.5H10.7812H12.6562H24.8438C25.3652 22.5 25.8457 22.2129 26.0859 21.75C26.3262 21.2871 26.2969 20.7305 26.0039 20.3027L18.9727 9.99023ZM6.5625 9.375C7.30842 9.375 8.02379 9.07868 8.55124 8.55124C9.07868 8.02379 9.375 7.30842 9.375 6.5625C9.375 5.81658 9.07868 5.10121 8.55124 4.57376C8.02379 4.04632 7.30842 3.75 6.5625 3.75C5.81658 3.75 5.10121 4.04632 4.57376 4.57376C4.04632 5.10121 3.75 5.81658 3.75 6.5625C3.75 7.30842 4.04632 8.02379 4.57376 8.55124C5.10121 9.07868 5.81658 9.375 6.5625 9.375Z"
						fill="#EDEAEA"
					/>
					<path
						d="M6.5625 9.375C7.30842 9.375 8.02379 9.07868 8.55124 8.55124C9.07868 8.02379 9.375 7.30842 9.375 6.5625C9.375 5.81658 9.07868 5.10121 8.55124 4.57376C8.02379 4.04632 7.30842 3.75 6.5625 3.75C5.81658 3.75 5.10121 4.04632 4.57376 4.57376C4.04632 5.10121 3.75 5.81658 3.75 6.5625C3.75 7.30842 4.04632 8.02379 4.57376 8.55124C5.10121 9.07868 5.81658 9.375 6.5625 9.375Z"
						fill="#EDEAEA"
					/>
					<path
						d="M18.9727 9.99023C18.709 9.60352 18.2754 9.375 17.8125 9.375C17.3496 9.375 16.9102 9.60352 16.6524 9.99023L11.5547 17.4668L10.002 15.5273C9.73245 15.1934 9.32816 15 8.90628 15C8.48441 15 8.07425 15.1934 7.81058 15.5273L4.06058 20.2148C3.72074 20.6367 3.65628 21.2168 3.89066 21.7031C4.12503 22.1895 4.61722 22.5 5.15628 22.5H10.7813H12.6563H24.8438C25.3653 22.5 25.8457 22.2129 26.086 21.75C26.3262 21.2871 26.2969 20.7305 26.0039 20.3027L18.9727 9.99023Z"
						fill="#3F83EA"
					/>
					<circle className="_imageCircle" cx="7" cy="7" r="3" fill="#FFB534" />
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
