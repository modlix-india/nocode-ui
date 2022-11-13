import React from 'react';
import Components from '..';
import Nothing from '../Nothing';

export const renderChildren = (pageDefinition: any, children: any, context: string) => {
	return Object.entries(children)
		.filter(([, v]) => !!v)
		.map(([k]) => pageDefinition.componentDefinition[k])
		.filter(e => !!e)
		.sort((a: any, b: any) => (a?.properties?.displayOrder || 0) - (b?.properties?.displayOrder || 0))
		.map(e => {
			let comp = Components.get(e.type);
			if (!comp) comp = Nothing;
			if (!comp) return undefined;
			return React.createElement(comp, {
				definition: e,
				key: e.key,
				pageDefinition: pageDefinition,
				context,
			});
		})
		.filter(e => !!e);
};
