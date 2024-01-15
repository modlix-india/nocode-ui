import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { STORE_PATH_FUNCTION_EXECUTION } from '../../constants';
import {
	PageStoreExtractor,
	addListener,
	getDataFromPath,
	getPathFromLocation,
	setData,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import Children from '../Children';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { getHref } from '../util/getHref';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { flattenUUID } from '../util/uuid';
import SectionGridStyle from './SectionGridStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './sectionGridProperties';
import { isNullValue } from '@fincity/kirun-js';
import { styleDefaults } from './sectionGridStyleProperties';
import { IconHelper } from '../util/IconHelper';

function SectionGrid(props: ComponentProps) {
	const [hover, setHover] = React.useState(false);
	const [focus, setFocus] = React.useState(false);

	const { definition, pageDefinition, locationHistory, context } = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: { containerType, layout } = {},
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
			context={{ ...context }}
			locationHistory={locationHistory}
		/>
	);

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ focus, hover },
		stylePropertiesWithPseudoStates,
	);

	return React.createElement(
		containerType.toLowerCase(),
		{
			onMouseEnter: stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined,

			onMouseLeave: stylePropertiesWithPseudoStates?.hover
				? () => setHover(false)
				: undefined,

			onFocus: stylePropertiesWithPseudoStates?.focus ? () => setFocus(true) : undefined,

			onBlur: stylePropertiesWithPseudoStates?.focus ? () => setFocus(false) : undefined,

			className: `comp compSectionGrid _noAnchorGrid _${layout}`,
			style: resolvedStyles.comp ?? {},
			id: key,
		},
		[<HelperComponent key={`${key}_hlp`} definition={definition} />, childs],
	);
}

const component: Component = {
	name: 'SectionGrid',
	displayName: 'Section Grid',
	description: 'Section Grid component',
	component: SectionGrid,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: SectionGridStyle,
	styleDefaults: styleDefaults,
	stylePseudoStates: ['hover', 'focus'],
	allowedChildrenType: new Map<string, number>([['', -1]]),
	styleProperties: stylePropertiesDefinition,
	defaultTemplate: {
		key: '',
		name: 'Section Grid',
		type: 'SectionGrid',
	},
	sections: [
		{
			name: 'Grid',
			pageName: 'grid',
		},
	],
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 22 22">
					<path
						d="M8 1H2C1.44772 1 1 1.44772 1 2V12C1 12.5523 1.44772 13 2 13H8C8.55229 13 9 12.5523 9 12V2C9 1.44772 8.55229 1 8 1Z"
						fill="currentColor"
						strokeWidth="0"
						strokeLinecap="round"
						strokeLinejoin="round"
						fillOpacity="0.5"
					/>
					<path
						d="M20 9H14C13.4477 9 13 9.44772 13 10V20C13 20.5523 13.4477 21 14 21H20C20.5523 21 21 20.5523 21 20V10C21 9.44772 20.5523 9 20 9Z"
						fill="currentColor"
						strokeWidth="0"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M8 17H2C1.44772 17 1 17.4477 1 18V20C1 20.5523 1.44772 21 2 21H8C8.55229 21 9 20.5523 9 20V18C9 17.4477 8.55229 17 8 17Z"
						fill="currentColor"
						strokeWidth="0"
						strokeLinecap="round"
						strokeLinejoin="round"
						fillOpacity="0.5"
					/>
					<path
						d="M20 1H14C13.4477 1 13 1.44772 13 2V4C13 4.55228 13.4477 5 14 5H20C20.5523 5 21 4.55228 21 4V2C21 1.44772 20.5523 1 20 1Z"
						fill="currentColor"
						strokeWidth="0"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</IconHelper>
			),
		},
	],
};

export default component;
