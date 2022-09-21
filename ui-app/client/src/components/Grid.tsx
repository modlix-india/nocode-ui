import React from 'react';

export interface GridProps extends React.ComponentPropsWithoutRef<'div'> {
	definition: any;
}
export function Grid(props: GridProps) {
	const { definition, ...rest } = props;
	return <div {...rest} />;
}
