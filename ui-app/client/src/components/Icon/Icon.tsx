import React, { useState, useRef, useEffect } from 'react';
import { STORE_PATH_FUNCTION_EXECUTION } from '../../constants';
import { PageStoreExtractor, addListener, getDataFromPath } from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { Component, ComponentProps } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './iconProperties';
import IconStyle from './IconStyle';
import useDefinition from '../util/useDefinition';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { styleProperties, styleDefaults, stylePropertiesForTheme } from './iconStyleProperies';
import { IconHelper } from '../util/IconHelper';
import { findPropertyDefinitions } from '../util/lazyStylePropertyUtil';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { runEvent } from '../util/runEvent';
import { flattenUUID } from '../util/uuid';

function Icon(props: Readonly<ComponentProps>) {
	const { definition, locationHistory, context } = props;
	const [hover, setHover] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		properties: {
			icon,
			designType,
			colorScheme,
			tooltipText,
			tooltipEnabled,
			tooltipPosition,
			tooltipOffset,
			onClick,
			stopPropagation,
			preventDefault,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const styleProperties = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover },
		stylePropertiesWithPseudoStates,
	);

	const clickEvent = onClick ? props.pageDefinition.eventFunctions?.[onClick] : undefined;

	// Add loading state tracking
	const spinnerPath = onClick
		? `${STORE_PATH_FUNCTION_EXECUTION}.${props.context.pageName}.${flattenUUID(
				onClick,
			)}.isRunning`
		: undefined;

	const [isLoading, setIsLoading] = useState(
		onClick
			? (getDataFromPath(spinnerPath, props.locationHistory, pageExtractor) ?? false)
			: false,
	);

	useEffect(() => {
		if (spinnerPath) {
			return addListener((_, value) => setIsLoading(value), pageExtractor, spinnerPath);
		}
	}, []);

	// Update handleClick to check loading state
	const handleClick = async (e: React.MouseEvent) => {
		if (stopPropagation) e.stopPropagation();
		if (preventDefault) e.preventDefault();

		if (clickEvent && !isLoading) {
			await runEvent(
				clickEvent,
				onClick,
				props.context.pageName,
				props.locationHistory,
				props.pageDefinition,
			);
		}
	};

	const tooltip = tooltipEnabled && tooltipText && hover && (
		<div
			className={`_tooltip _tooltip-${tooltipPosition || 'bottom'}`}
			style={{ '--tooltip-offset': `${tooltipOffset || 10}px` } as React.CSSProperties}
		>
			{tooltipText}
			<SubHelperComponent definition={definition} subComponentName="tooltip" />
		</div>
	);

	return (
		<div
			className="comp compIcon-container"
			style={{ position: 'relative', display: 'inline-block' }}
			ref={containerRef}
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
			onClick={onClick ? handleClick : undefined}
		>
			<i
				className={`comp compIcon _icon ${designType} ${colorScheme} ${isLoading ? 'fa fa-circle-notch fa-spin' : icon}`}
				style={styleProperties.comp ?? {}}
			>
				<HelperComponent context={props.context} definition={definition} />
			</i>
			{tooltip}
		</div>
	);
}

const { designType, colorScheme } = findPropertyDefinitions(
	propertiesDefinition,
	'designType',
	'colorScheme',
);

const component: Component = {
	order: 15,
	name: 'Icon',
	displayName: 'Icon',
	description: 'Icon component',
	component: Icon,
	propertyValidation: (): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: IconStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['hover'],
	defaultTemplate: {
		key: '',
		name: 'Icon',
		type: 'Icon',
		properties: {
			icon: { value: 'fa fa-solid fa-icons' },
		},
	},
	sections: [{ name: 'Icons', pageName: 'icon' }],
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 15">
					<circle className="_iconcircle" cx="24.5" cy="10" r="5" fill="#02B694" />
					<path
						className="_icontriangle"
						d="M5.06292 6.78674C5.25342 6.44384 5.74658 6.44384 5.93708 6.78674L10.0873 14.2572C10.2725 14.5904 10.0315 15 9.65024 15L1.34976 15C0.968515 15 0.727531 14.5904 0.912679 14.2572L5.06292 6.78674Z"
						fill="#EC465E"
					/>
					<rect className="_iconbar" x="12" width="5" height="15" fill="#7B66FF" />
				</IconHelper>
			),
		},
		{
			name: 'tooltip',
			displayName: 'Tooltip',
			description: 'Icon Tooltip',
			icon: 'fa-solid fa-comment',
		},
	],
	stylePropertiesForTheme: stylePropertiesForTheme,
	propertiesForTheme: [designType, colorScheme],
};

export default component;
