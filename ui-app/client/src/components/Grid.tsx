import React from 'react';
import { HelperComponent } from './HelperComponent';
import { DataLocation, RenderContext } from './types';
import { renderChildren } from './util/renderChildren';

interface GridProps extends React.Component {
	definition: any;
	pageDefinition: any;
	context: RenderContext;
	locationHistory: Array<DataLocation | string>;
}

function Grid(props: GridProps) {
	const { definition, pageDefinition, locationHistory, context } = props;
	return (
		<div className="comp compGrid grid">
			<HelperComponent definition={definition} />
			{renderChildren(pageDefinition, definition.children, context, locationHistory)}
		</div>
	);
}

export default Grid;
