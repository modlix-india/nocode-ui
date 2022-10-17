import React, { ReactNode } from 'react';
import * as D from '../index';

const componentMap = new Map<string, React.ElementType>();
Object.entries(D).forEach(([k, v]) => componentMap.set(k, v));

export const getChildrenByType = (
	pageDefinition: any,
	children: any,
	type: string,
) => {
	return Object.entries(children)
		.filter(([_, v]) => !!v)
		.map(([k]) => {
			if (
				pageDefinition.children[k] &&
				pageDefinition.children[k].type === type
			) {
				return pageDefinition.children[k];
			}
		})
		.filter(e => !!e)
		.sort(
			(a: any, b: any) =>
				(a?.properties?.displayOrder || 0) -
				(b?.properties?.displayOrder || 0),
		);
};
