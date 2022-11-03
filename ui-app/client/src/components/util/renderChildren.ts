import React, { ReactNode } from 'react';
import * as D from '../index';

const componentMap = new Map<string, React.ElementType>();
Object.entries(D).forEach(([k, v]) => componentMap.set(k, v));

export const renderChildren = (pageDefinition: any, children: any) => {
	return Object.entries(children)
		.filter(([_, v]) => !!v)
		.map(([k]) => pageDefinition.children[k])
		.filter(e => !!e)
		.sort(
			(a: any, b: any) =>
				(a?.properties?.displayOrder || 0) -
				(b?.properties?.displayOrder || 0),
		)
		.map(e => {
			if (componentMap.get(e.type))
				return React.createElement(componentMap.get(e.type)!, {
					definition: e,
					key: e.key,
					pageDefinition: pageDefinition,
				});
		});
};
