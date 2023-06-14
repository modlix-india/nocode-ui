import React, { useEffect, useState } from 'react';
import { HelperComponent } from '../HelperComponent';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { addListener, getDataFromPath, PageStoreExtractor } from '../../context/StoreContext';
import { Component } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './tablePreviewGridProperties';
import useDefinition from '../util/useDefinition';
import { Link } from 'react-router-dom';
import Children from '../Children';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { STORE_PATH_FUNCTION_EXECUTION } from '../../constants';
import { runEvent } from '../util/runEvent';
import { flattenUUID } from '../util/uuid';
import TablePreviewGridStyle from './TablePreviewGridStyle';

function TablePreviewGrid(props: ComponentProps) {
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

	const clickEvent = onClick ? props.pageDefinition.eventFunctions[onClick] : undefined;
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
			{ className: 'comp compTablePreviewGrid' },
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
			className: `comp compTablePreviewGrid _noAnchorGrid _${layout} ${background} _${key}_grid_css`,
			style: resolvedStyles.comp ?? {},

			onClick: handleClick,
		},
		[<HelperComponent key={`${key}_hlp`} definition={definition} />, styleComp, childs],
	);
}

const component: Component = {
	icon: 'fa-solid fa-magnifying-glass',
	name: 'TablePreviewGrid',
	displayName: 'Table Preview Grid',
	description: 'Table Preview Grid component',
	component: TablePreviewGrid,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: TablePreviewGridStyle,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['hover', 'focus', 'readonly'],
	allowedChildrenType: new Map<string, number>([['', -1]]),
	parentType: 'Table',
};

export default component;
