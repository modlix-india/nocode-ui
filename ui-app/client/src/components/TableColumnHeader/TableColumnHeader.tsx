import React, { useEffect, useState } from 'react';
import { getData, getDataFromPath, PageStoreExtractor, setData } from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponent';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { updateLocationForChild } from '../util/updateLoactionForChild';
import { Component } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './tableCloumnHeaderProperties';
import TableColumnHeaderStyle from './TableColumnHeaderStyle';
import useDefinition from '../util/useDefinition';
import Children from '../Children';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { deepEqual, ExpressionEvaluator } from '@fincity/kirun-js';
import { getExtractionMap } from '../util/getRenderData';

function TableColumnHeaderComponent(props: ComponentProps) {
	const {
		definition: { children },
		locationHistory = [],
		context,
		definition,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const { properties: { label } = {}, stylePropertiesWithPseudoStates } = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const styleProperties = processComponentStylePseudoClasses(
		{ hover: false },
		stylePropertiesWithPseudoStates,
	);

	return (
		<div className="comp compTableHeaderColumn" style={styleProperties.comp}>
			<HelperComponent definition={definition} />
			<div className="">{label}</div>
		</div>
	);
}

const component: Component = {
	icon: 'fa-solid fa-diagram-next',
	name: 'TableColumnHeader',
	displayName: 'Table Header',
	description: 'Table Header component',
	component: TableColumnHeaderComponent,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: TableColumnHeaderStyle,
	hasChildren: false,
	isHidden: true,
};

export default component;
