import React, { useEffect, useState } from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponent';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { updateLocationForChild } from '../util/updateLoactionForChild';
import { Component } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './tableColumnsProperties';
import TableColumnsStyle from './TableColumnsStyle';
import useDefinition from '../util/useDefinition';
import Children from '../Children';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';

function TableColumnsComponent(props: ComponentProps) {
	const [value, setValue] = useState([]);
	const {
		definition: { children },
		pageDefinition,
		locationHistory = [],
		context,
		definition,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const { properties: { layout } = {}, stylePropertiesWithPseudoStates } = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	useEffect(() => setValue(props.context.table?.data), [props.context.table?.data]);

	if (!Array.isArray(value)) return <></>;

	let entry = Object.entries(children ?? {}).find(([, v]) => v);

	const firstchild: any = {};
	if (entry) firstchild[entry[0]] = true;

	const styleProperties = processComponentStylePseudoClasses({}, stylePropertiesWithPseudoStates);

	return (
		<div className={`comp compTableColumns _${layout}`} style={styleProperties.comp}>
			<HelperComponent definition={definition} />
			{value.map((e: any, index) => (
				<Children
					pageDefinition={pageDefinition}
					children={firstchild}
					context={context}
					locationHistory={[
						...locationHistory,
						updateLocationForChild(
							context.table?.bindingPath,
							index,
							locationHistory,
							context.pageName,
							pageExtractor,
						),
					]}
				/>
			))}
		</div>
	);
}

const component: Component = {
	name: 'TableColumns',
	displayName: 'Table Columns',
	description: 'Table Columns component',
	component: TableColumnsComponent,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: TableColumnsStyle,
	hasChildren: true,
	numberOfChildren: 1,
	parentType: 'Table',
};

export default component;
