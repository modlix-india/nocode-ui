import React from 'react';
import { generateColor } from '../colors';

interface StoreNodeProps {
	name: string;
}

export function StoreNode({ name }: StoreNodeProps) {
	const color = `#${generateColor('stor', name)}`;
	return (
		<div className={`_storeNode`}>
			<i className="fa fa-solid fa-database" style={{ backgroundColor: color }} />
			<div className="_storeNode_name">{name}</div>
			<div
				className="_storeNode_node"
				id={`_storeNode_${name}`}
				style={{ borderColor: color }}
			/>
		</div>
	);
}
