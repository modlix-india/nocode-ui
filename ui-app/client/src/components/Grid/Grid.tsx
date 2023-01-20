import React, { useEffect, useState } from 'react';
import { HelperComponent } from '../HelperComponent';
import {
	ComponentProperty,
	ComponentPropertyDefinition,
	ComponentProps,
	DataLocation,
	RenderContext,
} from '../../types/common';
import {
	addListener,
	getData,
	getDataFromPath,
	PageStoreExtractor,
} from '../../context/StoreContext';
import { Component } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './gridProperties';
import GridStyle from './GridStyle';
import useDefinition from '../util/useDefinition';
import { Link } from 'react-router-dom';
import Children from '../Children';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { STORE_PATH_FUNCTION_EXECUTION } from '../../constants';
import { runEvent } from '../util/runEvent';

function Grid(props: ComponentProps) {
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
			pageDefinition={pageDefinition}
			children={definition.children}
			context={{ ...context, isReadonly }}
			locationHistory={locationHistory}
		/>
	);

	const resolvedStyles = processComponentStylePseudoClasses(
		{ focus, hover, disabled: isReadonly },
		stylePropertiesWithPseudoStates,
	);

	const clickEvent = onClick ? props.pageDefinition.eventFunctions[onClick] : undefined;
	const spinnerPath = `${STORE_PATH_FUNCTION_EXECUTION}.${props.context.pageName}.${key}.isRunning`;
	const [isLoading, setIsLoading] = useState(
		getDataFromPath(spinnerPath, props.locationHistory) || false,
	);

	useEffect(() => addListener((_, value) => setIsLoading(value), pageExtractor, spinnerPath), []);

	const handleClick =
		!clickEvent || isLoading
			? undefined
			: async () => await runEvent(clickEvent, onClick, props.context.pageName);

	if (linkPath) {
		return React.createElement(containerType, { className: 'comp compGrid' }, [
			<HelperComponent definition={definition} />,
			<Link
				className={`_anchorGrid _${layout}`}
				onMouseEnter={
					stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined
				}
				onMouseLeave={
					stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
				}
				onFocus={stylePropertiesWithPseudoStates?.focus ? () => setFocus(true) : undefined}
				onBlur={stylePropertiesWithPseudoStates?.focus ? () => setFocus(false) : undefined}
				to={linkPath}
				target={target}
				style={resolvedStyles.comp ?? {}}
			>
				{childs}
			</Link>,
		]);
	}

	return React.createElement(
		containerType,
		{
			onMouseEnter: stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined,
			onMouseLeave: stylePropertiesWithPseudoStates?.hover
				? () => setHover(false)
				: undefined,

			onFocus: stylePropertiesWithPseudoStates?.focus ? () => setFocus(true) : undefined,
			onBlur: stylePropertiesWithPseudoStates?.focus ? () => setFocus(false) : undefined,

			className: `comp compGrid _noAnchorGrid _${layout}`,
			style: resolvedStyles.comp ?? {},

			onClick: handleClick,
		},
		[<HelperComponent definition={definition} />, childs],
	);
}

const component: Component = {
	name: 'Grid',
	displayName: 'Grid',
	description: 'Grid component',
	component: Grid,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: GridStyle,
	stylePseudoStates: ['hover', 'focus', 'readonly'],
};

export default component;
