import React, { useEffect, useState } from 'react';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { addListener, getDataFromPath, PageStoreExtractor } from '../../context/StoreContext';
import { Component } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './tableEmptyGridProperties';
import useDefinition from '../util/useDefinition';
import { Link } from 'react-router-dom';
import Children from '../Children';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { STORE_PATH_FUNCTION_EXECUTION } from '../../constants';
import { runEvent } from '../util/runEvent';
import { flattenUUID } from '../util/uuid';
import TableEmptyGridStyle from './TableEmptyGridStyle';
import { styleDefaults } from './tableEmptyGridStyleProperties';
import { IconHelper } from '../util/IconHelper';

function TableEmptyGrid(props: ComponentProps) {
	const [hover, setHover] = React.useState(false);
	const [focus, setFocus] = React.useState(false);
	const { definition, pageDefinition, locationHistory, context } = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: {
			readOnly: isReadonly = false,
			linkPath,
			target,
			containerType,
			layout,
			onClick,
			background,
		} = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const childs = (
		<Children
			key={`${key}_chld`}
			pageDefinition={pageDefinition}
			children={definition.children}
			context={{ ...context, isReadonly }}
			locationHistory={locationHistory}
		/>
	);

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ focus, hover, disabled: isReadonly },
		stylePropertiesWithPseudoStates,
	);

	const clickEvent = onClick ? props.pageDefinition.eventFunctions?.[onClick] : undefined;
	const spinnerPath = `${STORE_PATH_FUNCTION_EXECUTION}.${props.context.pageName}.${flattenUUID(
		key,
	)}.isRunning`;

	const [isLoading, setIsLoading] = useState(
		getDataFromPath(spinnerPath, locationHistory, pageExtractor) ?? false,
	);

	useEffect(() => addListener((_, value) => setIsLoading(value), pageExtractor, spinnerPath), []);

	const handleClick =
		!clickEvent || isLoading
			? undefined
			: async () =>
					await runEvent(
						clickEvent,
						onClick,
						props.context.pageName,
						props.locationHistory,
						props.pageDefinition,
					);
	const styleComp = resolvedStyles?.comp?.hideScrollBar ? (
		<style>{`._${key}_grid_css::-webkit-scrollbar { display: none }`}</style>
	) : undefined;
	if (linkPath) {
		return React.createElement(
			containerType.toLowerCase(),
			{ className: 'comp compTableEmptyGrid' },
			[
				<HelperComponent definition={definition} />,
				styleComp,
				<Link
					className={`_anchorGrid _${layout} ${background} _${key}_grid_css`}
					onMouseEnter={
						stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined
					}
					onMouseLeave={
						stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
					}
					onFocus={
						stylePropertiesWithPseudoStates?.focus ? () => setFocus(true) : undefined
					}
					onBlur={
						stylePropertiesWithPseudoStates?.focus ? () => setFocus(false) : undefined
					}
					to={linkPath}
					target={target}
					style={resolvedStyles.comp ?? {}}
				>
					{childs}
				</Link>,
			],
		);
	}

	return React.createElement(
		containerType.toLowerCase(),
		{
			onMouseEnter: stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined,
			onMouseLeave: stylePropertiesWithPseudoStates?.hover
				? () => setHover(false)
				: undefined,

			onFocus: stylePropertiesWithPseudoStates?.focus ? () => setFocus(true) : undefined,
			onBlur: stylePropertiesWithPseudoStates?.focus ? () => setFocus(false) : undefined,
			className: `comp compTableEmptyGrid _noAnchorGrid _${layout} ${background} _${key}_grid_css`,
			style: resolvedStyles.comp ?? {},

			onClick: handleClick,
		},
		[<HelperComponent key={`${key}_hlp`} definition={definition} />, styleComp, childs],
	);
}

const component: Component = {
	name: 'TableEmptyGrid',
	displayName: 'Table Empty Grid',
	description: 'Table Empty Grid component',
	component: TableEmptyGrid,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	styleComponent: TableEmptyGridStyle,
	styleDefaults: styleDefaults,
	stylePseudoStates: ['hover', 'focus', 'readonly'],
	allowedChildrenType: new Map<string, number>([['', -1]]),
	parentType: 'Table',
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<path
						d="M2 5C2 3.89543 2.89543 3 4 3H19.0667C20.1712 3 21.0667 3.89543 21.0667 5V7.56667C21.0667 7.67712 20.9771 7.76667 20.8667 7.76667H2.2C2.08954 7.76667 2 7.67712 2 7.56667V5Z"
						fill="currentColor"
					/>
					<path
						d="M21.0664 18.875C21.0664 19.9796 20.171 20.875 19.0664 20.875H3.99974C2.89517 20.875 1.99974 19.9796 1.99974 18.875V18.6917C1.99974 18.5812 2.08928 18.4917 2.19974 18.4917H20.8664C20.9769 18.4917 21.0664 18.5812 21.0664 18.6917V18.875Z"
						fill="currentColor"
					/>
					<rect
						x="2"
						y="8.9585"
						width="4.76667"
						height="3.575"
						rx="0.2"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<rect
						x="2"
						y="13.7251"
						width="4.76667"
						height="3.575"
						rx="0.2"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<rect
						x="9.15039"
						y="8.9585"
						width="4.76667"
						height="3.575"
						rx="0.2"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<rect
						x="9.15039"
						y="13.7251"
						width="4.76667"
						height="3.575"
						rx="0.2"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<rect
						x="16.3008"
						y="8.9585"
						width="4.76667"
						height="3.575"
						rx="0.2"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<rect
						x="16.3008"
						y="13.7251"
						width="4.76667"
						height="3.575"
						rx="0.2"
						fill="currentColor"
						fillOpacity="0.2"
					/>
				</IconHelper>
			),
		},
	],
};

export default component;
