import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PageStoreExtractor, UrlDetailsExtractor } from '../../context/StoreContext';
import { Component, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { sanitizeSvg } from './sanitizeSvg';
import { propertiesDefinition, stylePropertiesDefinition } from './svgProperties';
import SvgStyle from './SvgStyles';
import { fetchSvgText, resolveSvgUrl } from './svgSource';
import { styleDefaults, styleProperties } from './svgStyleProperties';

function SvgComponent(props: Readonly<ComponentProps>) {
	const { definition, locationHistory, context } = props;
	const [hover, setHover] = useState(false);
	const [markup, setMarkup] = useState('');
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const location = useLocation();

	const {
		properties: {
			svgContent,
			src,
			alt,
			onClick: onClickEvent,
			stopPropagation,
			preventDefault,
			analyticsLabel,
		} = {},
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

	const computedUrl = resolveSvgUrl(src, location);

	// Raw markup wins over the URL; either way it is sanitized before render.
	useEffect(() => {
		if (svgContent) {
			setMarkup(sanitizeSvg(svgContent));
			return;
		}

		if (!computedUrl) {
			setMarkup('');
			return;
		}

		let active = true;
		fetchSvgText(computedUrl)
			.then(text => {
				if (active) setMarkup(sanitizeSvg(text));
			})
			.catch(() => {
				if (active) setMarkup('');
			});

		return () => {
			active = false;
		};
	}, [svgContent, computedUrl]);

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

	return (
		<div
			className="comp compSvg"
			style={resolvedStyles.comp ?? {}}
			onMouseEnter={stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined}
			onMouseLeave={
				stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
			}
			data-analytics-label={analyticsLabel || undefined}
		>
			<HelperComponent context={props.context} definition={definition} />
			{markup ? (
				<div
					className={`_svgContainer ${onClickEvent ? '_onclicktrue' : ''}`}
					role="img"
					aria-label={alt || undefined}
					style={resolvedStyles.svg ?? {}}
					onClick={
						onClickEvent
							? ev => {
									if (stopPropagation) ev.stopPropagation();
									if (preventDefault) ev.preventDefault();
									handleClick();
								}
							: undefined
					}
					dangerouslySetInnerHTML={{ __html: markup }}
				/>
			) : null}
			<SubHelperComponent definition={definition} subComponentName="svg" />
		</div>
	);
}

const component: Component = {
	order: 3,
	name: 'Svg',
	displayName: 'SVG',
	description: 'Renders an SVG inline from a file source or raw markup, safely.',
	component: SvgComponent,
	propertyValidation: (): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: SvgStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['hover'],
	defaultTemplate: {
		key: '',
		name: 'SVG',
		type: 'Svg',
		properties: {
			src: { value: 'api/files/static/file/SYSTEM/appbuilder/sample.svg' },
			alt: { value: 'SVG' },
		},
	},
	stylePropertiesForTheme: styleProperties,
};

export default component;
