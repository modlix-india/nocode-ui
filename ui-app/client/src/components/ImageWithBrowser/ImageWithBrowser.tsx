import React, { useEffect, useState } from 'react';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import {
	Component,
	ComponentPropertyDefinition,
	ComponentProps,
	DataLocation,
} from '../../types/common';
import useDefinition from '../util/useDefinition';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getData,
	getDataFromPath,
	getPathFromLocation,
} from '../../context/StoreContext';
import { propertiesDefinition, stylePropertiesDefinition } from './imageWithBrowserProperties';
import ImageStyle from './ImageWithBrowserStyles';
import { runEvent } from '../util/runEvent';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { getHref } from '../util/getHref';
import { useLocation } from 'react-router-dom';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { isNullValue } from '@fincity/kirun-js';
import ImageBrowser from './ImageBrowser';
import { styleDefaults } from './imageWithBrowserStyleProperties';
import getSrcUrl from '../util/getSrcUrl';
import { IconHelper } from '../util/IconHelper';

function ImageWithBrowser(props: ComponentProps) {
	const {
		definition,
		definition: {
			bindingPath,
			bindingPath2,
			bindingPath3,
			bindingPath4,
			bindingPath5,
			bindingPath6,
			bindingPath7,
		},
		locationHistory,
		context,
	} = props;
	const [hover, setHover] = useState(false);
	const [src, setSrc] = useState('');
	const [altText, setAltText] = useState('');
	const [bindingPaths, setBindingPaths] = useState(new Map<string, string>());
	const [showBrowser, setShowBrowser] = useState(false);
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const location = useLocation();
	const {
		properties: { onClick: onClickEvent } = {},
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
		const bps = [
			['bindingPath', bindingPath],
			['bindingPath2', bindingPath2],
			['bindingPath3', bindingPath3],
			['bindingPath4', bindingPath4],
			['bindingPath5', bindingPath5],
			['bindingPath6', bindingPath6],
			['bindingPath7', bindingPath7],
		]
			.filter(e => !isNullValue(e[1]))
			.map(e => ({
				key: e[0],
				path: getPathFromLocation(e[1]! as DataLocation, locationHistory, pageExtractor),
			}))
			.reduce((acc, e) => acc.set(e.key as string, e.path), new Map<string, string>());
		setBindingPaths(bps);
		addListenerAndCallImmediately(
			(_, value) => {
				const imageMap = new Map<string, string>(
					Array.from(bps.entries()).map(e => [
						e[0],
						getDataFromPath(e[1], locationHistory, pageExtractor),
					]),
				);

				if (value?.TABLET_LANDSCAPE_SCREEN_ONLY && imageMap.has('bindingPath2')) {
					setSrc(imageMap.get('bindingPath2') ?? '');
				} else if (value?.TABLET_POTRAIT_SCREEN_ONLY && imageMap.has('bindingPath3')) {
					setSrc(imageMap.get('bindingPath3') ?? '');
				} else if (value?.MOBILE_LANDSCAPE_SCREEN_ONLY && imageMap.has('bindingPath4')) {
					setSrc(imageMap.get('bindingPath4') ?? '');
				} else if (value?.MOBILE_POTRAIT_SCREEN_ONLY && imageMap.has('bindingPath5')) {
					setSrc(imageMap.get('bindingPath5') ?? '');
				} else {
					setSrc(imageMap.get('bindingPath') ?? '');
				}

				setAltText(imageMap.get('bindingPath7') ?? '');
			},
			pageExtractor,
			'Store.devices',
			...Array.from(bps.values()),
		);
	}, [bindingPath, bindingPath2, bindingPath3, bindingPath4, bindingPath5, bindingPath6]);

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

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover },
		stylePropertiesWithPseudoStates,
	);

	const img = src ? (
		<img
			onMouseEnter={stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined}
			onMouseLeave={
				stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
			}
			onClick={onClickEvent ? handleClick : undefined}
			className={onClickEvent ? '_onclicktrue' : ''}
			style={resolvedStyles.image ?? {}}
			src={getSrcUrl(getHref(src, location))}
			alt={altText}
		/>
	) : (
		<></>
	);

	const browserButton = (
		<button
			className=" ms material-symbols-outlined mso-gallery_thumbnail"
			onClick={() => setShowBrowser(true)}
		></button>
	);

	const browser = showBrowser ? (
		<ImageBrowser
			bindingPaths={bindingPaths}
			onClose={() => setShowBrowser(false)}
			locationHistory={locationHistory}
			pageExtractor={pageExtractor}
		/>
	) : (
		<></>
	);

	return (
		<div className="comp compImageWithBrowser" style={resolvedStyles.comp ?? {}}>
			<HelperComponent context={props.context} definition={definition} />
			{img}
			<SubHelperComponent
				style={resolvedStyles.image ?? {}}
				className={onClickEvent ? '_onclicktrue' : ''}
				definition={definition}
				subComponentName="image"
			></SubHelperComponent>
			{browserButton}
			{browser}
		</div>
	);
}

const component: Component = {
	name: 'ImageWithBrowser',
	displayName: 'Image With Browser',
	description: 'Image With Browser Component',
	component: ImageWithBrowser,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: ImageStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['hover'],
	defaultTemplate: {
		key: '',
		name: 'imageWithBrowser',
		type: 'ImageWithBrowser',
		properties: {
			src: { value: 'api/files/static/file/SYSTEM/appbuilder/Placeholder_view_vector.svg' },
			alt: { value: 'Placeholder image' },
		},
	},
	bindingPaths: {
		bindingPath: { name: 'Source Path' },
		bindingPath2: { name: 'Source Path for Tablet landscape screen' },
		bindingPath3: { name: 'Source Path for Tablet portrait screen' },
		bindingPath4: { name: 'Source Path for Mobile landscape screen' },
		bindingPath5: { name: 'Source Path for Mobile portrait screen' },
		bindingPath6: { name: 'FallBack Image' },
		bindingPath7: { name: 'Alt text' },
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 32 27">
					<rect
						x="1"
						y="1"
						width="30"
						height="6"
						rx="1"
						fill="url(#paint0_linear_3818_9796)"
					/>
					<path
						d="M2 26C1.44772 26 1 25.5523 1 25L1 8C1 7.44772 1.44772 7 2 7H30C30.5523 7 31 7.44772 31 8V25C31 25.5523 30.5523 26 30 26H2Z"
						fill="url(#paint1_linear_3818_9796)"
					/>
					<path
						className="_IWBhill"
						d="M18.3838 14.7984C18.2256 14.574 17.9654 14.4414 17.6877 14.4414C17.41 14.4414 17.1463 14.574 16.9916 14.7984L13.933 19.1364L13.0014 18.0111C12.8396 17.8173 12.5971 17.7051 12.3439 17.7051C12.0908 17.7051 11.8447 17.8173 11.6865 18.0111L9.43652 20.7309C9.23261 20.9757 9.19394 21.3123 9.33457 21.5944C9.47519 21.8766 9.7705 22.0568 10.0939 22.0568H13.4689H14.5939H21.9064C22.2193 22.0568 22.5076 21.8902 22.6518 21.6216C22.7959 21.353 22.7783 21.0301 22.6025 20.7819L18.3838 14.7984Z"
						fill="url(#paint2_linear_3818_9796)"
					/>
					<path
						d="M29.5211 0H2.47887C1.12676 0 0 1.33333 0 2.93333V23.7333C0 25.3333 1.12676 26.6667 2.47887 26.6667H29.5211C30.8732 26.6667 32 25.3333 32 23.7333V2.93333C32 1.33333 30.8732 0 29.5211 0ZM2.47887 1.6H29.5211C30.1521 1.6 30.6479 2.18667 30.6479 2.93333V6.66667H1.35211V2.93333C1.35211 2.18667 1.84789 1.6 2.47887 1.6ZM29.5211 25.0667H2.47887C1.84789 25.0667 1.35211 24.48 1.35211 23.7333V8.26667H30.6479V23.7333C30.6479 24.48 30.1521 25.0667 29.5211 25.0667Z"
						fill="url(#paint3_linear_3818_9796)"
					/>
					<circle className="_IWBCircle" cx="3.9" cy="3.9" r="0.9" fill="#FF0909" />
					<circle className="_IWBCircle" cx="7.1998" cy="3.9" r="0.9" fill="#FED502" />
					<circle className="_IWBCircle" cx="10.5001" cy="3.9" r="0.9" fill="#14FF00" />
					<defs>
						<linearGradient
							id="paint0_linear_3818_9796"
							x1="16"
							y1="1"
							x2="16"
							y2="7"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#AED9FF" />
							<stop offset="1" stopColor="#5AB2FF" />
						</linearGradient>
						<linearGradient
							id="paint1_linear_3818_9796"
							x1="1"
							y1="16.5"
							x2="31"
							y2="16.5"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" stopOpacity="0.933333" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint2_linear_3818_9796"
							x1="15.9997"
							y1="14.4414"
							x2="15.9997"
							y2="22.0568"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#AED9FF" />
							<stop offset="1" stopColor="#5AB2FF" />
						</linearGradient>
						<linearGradient
							id="paint3_linear_3818_9796"
							x1="16"
							y1="0"
							x2="16"
							y2="26.6667"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#AED9FF" />
							<stop offset="1" stopColor="#5AB2FF" />
						</linearGradient>
					</defs>
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
