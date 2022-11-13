import React from 'react';
import { renderChildren } from './util/renderChildren';

interface GridProps extends React.ComponentPropsWithoutRef<'div'> {
	definition: any;
	pageDefinition: any;
	context: string;
}

function Grid(props: GridProps) {
	const { definition, pageDefinition, context } = props;
	return <div className="comp compGrid grid">{renderChildren(pageDefinition, definition.children, context)}</div>;
}

export default Grid;
