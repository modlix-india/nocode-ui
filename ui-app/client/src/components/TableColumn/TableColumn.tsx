import React, { useEffect, useState } from 'react';
import { getData, getDataFromPath, PageStoreExtractor, setData } from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponent';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { updateLocationForChild } from '../util/updateLoactionForChild';
import { Component } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './tableCloumnProperties';
import TableColumnStyle from './TableColumnStyle';
import useDefinition from '../util/useDefinition';
import Children from '../Children';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { deepEqual, ExpressionEvaluator } from '@fincity/kirun-js';
import { getExtractionMap } from '../util/getRenderData';

function TableColumnComponent(props: ComponentProps) {
	const {
		definition: { children },
		pageDefinition,
		locationHistory = [],
		context,
		definition,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const { stylePropertiesWithPseudoStates } = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const [hover, setHover] = useState(false);

	let entry = Object.entries(children ?? {}).find(([, v]) => v);

	const firstchild: any = {};
	if (entry) firstchild[entry[0]] = true;

	const styleProperties = processComponentStylePseudoClasses(
		{ hover },
		stylePropertiesWithPseudoStates,
	);

	return (
		<div
			className="comp compTableColumn"
			style={styleProperties.comp}
			onMouseEnter={stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined}
			onMouseLeave={
				stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
			}
		>
			<HelperComponent definition={definition} />
			<Children
				pageDefinition={pageDefinition}
				children={firstchild}
				context={context}
				locationHistory={locationHistory}
			/>
		</div>
	);
}

const component: Component = {
	icon: 'fa-solid fa-table-columns',
	name: 'TableColumn',
	displayName: 'Table Column',
	description: 'Table Column component',
	component: TableColumnComponent,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: TableColumnStyle,
	allowedChildrenType: new Map<string, number>([['', 1]]),
	parentType: 'TableColumns',
	stylePseudoStates: ['hover'],
	styleProperties: stylePropertiesDefinition,
};

export default component;
