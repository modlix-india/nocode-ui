import React from 'react';
import { Location } from './types';
import { renderChildren } from './util/renderChildren';

export interface GridProps extends React.ComponentPropsWithoutRef<'div'> {
	definition: any;
	pageDefinition: any;
	locationHistory: Array<Location | string>;
}
export function Grid(props: GridProps) {
	const { definition, pageDefinition, locationHistory, ...rest } = props;
	return (
		<div className="compGrid grid" {...rest}>
			{renderChildren(
				pageDefinition,
				definition.children,
				locationHistory,
			)}
		</div>
	);
}
