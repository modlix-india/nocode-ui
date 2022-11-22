import React from 'react';
import { DataLocation } from './types';
import { renderChildren } from './util/renderChildren';

interface GridProps extends React.ComponentPropsWithoutRef<'div'> {
	definition: any;
	pageDefinition: any;
	context: string;
	locationHistory: Array<DataLocation | string>;
}

function Grid(props: GridProps) {
	const { definition, pageDefinition, locationHistory, context } = props;
	return (
		<div className="comp compGrid grid">
			{renderChildren(pageDefinition, definition.children, context, locationHistory)}
		</div>
	);
}

export default Grid;
