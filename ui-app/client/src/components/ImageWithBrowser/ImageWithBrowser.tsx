import React, { useEffect, useState } from 'react';
import { HelperComponent } from '../HelperComponent';
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
import { SubHelperComponent } from '../SubHelperComponent';
import { isNullValue } from '@fincity/kirun-js';
import ImageBrowser from './ImageBrowser';
import { styleDefaults } from './imageWithBrowserStyleProperties';

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
			src={getHref(src, location)}
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
			<HelperComponent definition={definition} />
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
			icon: 'fa-solid fa-panorama',
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
