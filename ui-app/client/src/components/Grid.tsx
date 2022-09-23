import React from 'react';
import { renderChildren } from './util/renderChildren';

export interface GridProps extends React.ComponentPropsWithoutRef<'div'> {
	definition: any;
	pageDefinition: any;
}
export function Grid(props: GridProps) {
	const { definition, pageDefinition, ...rest } = props;
	return (
		<div {...rest}>
			{renderChildren(pageDefinition, definition.children)}
		</div>
	);
}
