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
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 22 19">
					<g
						id="Group_108"
						data-name="Group 108"
						transform="translate(-1468.055 -277.818)"
					>
						<rect
							id="Rectangle_35"
							data-name="Rectangle 35"
							width="13"
							height="9"
							rx="2"
							transform="translate(1468.055 277.818)"
							opacity="0.5"
							fill="currentColor"
						/>
						<rect
							id="Rectangle_37"
							data-name="Rectangle 37"
							width="22"
							height="8"
							rx="2"
							transform="translate(1468.055 288.818)"
							fill="currentColor"
						/>
						<rect
							id="Rectangle_36"
							data-name="Rectangle 36"
							width="7"
							height="9"
							rx="2"
							transform="translate(1483.055 277.818)"
							opacity="0.5"
							fill="currentColor"
						/>
					</g>
				</IconHelper>
			),
		},
	],
};

export default component;
