import React from 'react';
import { HelperComponent } from '../HelperComponent';
import { ComponentProperty, DataLocation, RenderContext } from '../../types/common';
import { renderChildren } from '../util/renderChildren';
import { getData, PageStoreExtractor } from '../../context/StoreContext';
import { Component } from '../../types/common';
import properties from './gridProperties';
import GridStyle from './GridStyle';

interface GridProps extends React.Component {
	definition: any;
	pageDefinition: any;
	context: RenderContext;
	locationHistory: Array<DataLocation | string>;
	properties: {
		readonly: ComponentProperty<boolean>;
	};
}

function Grid(props: GridProps) {
	const {
		definition,
		pageDefinition,
		locationHistory,
		context,
		properties: { readonly } = {},
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const isReadOnly = getData(readonly, locationHistory, pageExtractor);
	context.isReadonly = isReadOnly;
	return (
		<div className="comp compGrid grid">
			<HelperComponent definition={definition} />
			{renderChildren(pageDefinition, definition.children, context, locationHistory)}
		</div>
	);
}

const component: Component = {
	name: 'Grid',
	displayName: 'Grid',
	description: 'Grid component',
	component: Grid,
	propertyValidation: (props: GridProps): Array<string> => [],
	properties,
	styleComponent: GridStyle,
};

export default component;
