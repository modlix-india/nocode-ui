import React, { useEffect, useState } from 'react';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { ComponentProps, DataLocation } from '../../types/common';
import useDefinition from '../util/useDefinition';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getDataFromPath,
	getPathFromLocation,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { propertiesDefinition, stylePropertiesDefinition } from './imageWithBrowserProperties';
import { runEvent } from '../util/runEvent';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { getHref } from '../util/getHref';
import { useLocation } from 'react-router-dom';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { isNullValue } from '@fincity/kirun-js';
import ImageBrowser from './ImageBrowser';
import getSrcUrl from '../util/getSrcUrl';

export default function ImageWithBrowser(props: Readonly<ComponentProps>) {
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
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
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
		urlExtractor,
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
			pageExtractor.getPageName(),
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
