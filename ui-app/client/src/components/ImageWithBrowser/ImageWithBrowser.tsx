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

function ImageWithBrowser(props: Readonly<ComponentProps>) {
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
			src={getSrcUrl(getHref(src, location) ?? '')}
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
					<path
						d="M0 4.86107V2.77775C0 1.24306 1.22047 0 2.72727 0H27.2727C28.7795 0 30 1.24306 30 2.77775V4.86107H0ZM20.4545 2.77775C20.4545 3.1597 20.7614 3.47219 21.1364 3.47219H26.5909C26.9659 3.47219 27.2727 3.1597 27.2727 2.77775C27.2727 2.39581 26.9659 2.08331 26.5909 2.08331H21.1364C20.7614 2.08331 20.4545 2.39581 20.4545 2.77775ZM6.15011 2.77775C6.15011 3.1597 6.45693 3.47219 6.83193 3.47219C7.20693 3.47219 7.51375 3.1597 7.51375 2.77775C7.51375 2.39581 7.20693 2.08331 6.83193 2.08331H6.82511C6.45011 2.08331 6.15011 2.39581 6.15011 2.77775ZM4.10465 2.77775C4.10465 3.1597 4.41147 3.47219 4.78647 3.47219C5.16147 3.47219 5.46829 3.1597 5.46829 2.77775C5.46829 2.39581 5.16147 2.08331 4.78647 2.08331H4.77965C4.40465 2.08331 4.10465 2.39581 4.10465 2.77775ZM2.0592 2.77775C2.0592 3.1597 2.36602 3.47219 2.74102 3.47219C3.11602 3.47219 3.42284 3.1597 3.42284 2.77775C3.42284 2.39581 3.11602 2.08331 2.74102 2.08331H2.7342C2.3592 2.08331 2.0592 2.39581 2.0592 2.77775Z"
						fill="#4C7FEE"
					/>
					<path
						d="M0 6H30V23C30 24.1046 29.1046 25 28 25H2C0.89543 25 0 24.1046 0 23V6Z"
						fill="#EDEAEA"
					/>
					<path
						d="M11.3228 15.4779L6.63111 21.4833C6.37465 21.8116 6.60855 22.2911 7.02512 22.2911H22.9325C23.3564 22.2911 23.588 21.7967 23.3166 21.471L19.8059 17.2582C19.6133 17.0271 19.2616 17.0172 19.0563 17.2372L16.6318 19.8348C16.4294 20.0517 16.0837 20.0456 15.889 19.8217L12.0942 15.4576C11.8879 15.2204 11.5164 15.2302 11.3228 15.4779Z"
						fill="#4C7FEE"
					/>
					<circle className="_IWBCircle" cx="19.3" cy="11.291" r="2" fill="#4C7FEE" />
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
