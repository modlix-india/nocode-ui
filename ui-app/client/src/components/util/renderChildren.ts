import React from 'react';
import Components from '..';
import { getData } from '../../context/StoreContext';
import Nothing from '../Nothing';
import { DataLocation, RenderContext } from '../types';

export const renderChildren = (
	pageDefinition: any,
	children: any,
	context: RenderContext,
	locationHistory: Array<DataLocation | string>,
) => {
	return Object.entries(children)
		.filter(([, v]) => !!v)
		.map(([k]) => pageDefinition.componentDefinition[k])
		.map(e => {
			if (!e?.properties?.visibility) return e;
			return !!getData(e?.properties?.visibility, locationHistory) ? e : undefined;
		})
		.filter(e => !!e)
		.sort(
			(a: any, b: any) =>
				(a?.properties?.displayOrder || 0) - (b?.properties?.displayOrder || 0),
		)
		.map(e => {
			let comp = Components.get(e.type);
			if (!comp) comp = Nothing;
			if (!comp) return undefined;
			return React.createElement(comp, {
				definition: e,
				key: e.key,
				pageDefinition: pageDefinition,
				context,
				locationHistory: locationHistory,
			});
		})
		.filter(e => !!e);
};
