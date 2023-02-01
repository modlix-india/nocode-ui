import React from 'react';
import { Components } from '..';
import { getData, getDataFromPath, PageStoreExtractor } from '../../context/StoreContext';
import Nothing from '../Nothing';
import { DataLocation, LocationHistory, RenderContext } from '../../types/common';
import { useLocation } from 'react-router-dom';
import { STORE_PREFIX } from '../../constants';
import { processLocation } from '../../util/locationProcessor';

const getPageDefinition = () => {
	const location = useLocation();
	let { pageName } = processLocation(location);
	if (!pageName)
		pageName = getDataFromPath(`${STORE_PREFIX}.application.properties.defaultPage`, []);
	let pDef = getDataFromPath(`${STORE_PREFIX}.pageDefinition.${pageName}`, []);
	return pDef;
};

export const renderChildren = (
	pageDefinition: any,
	children: any,
	context: RenderContext,
	locationHistory: Array<LocationHistory>,
) => {
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	return Object.entries(children)
		.filter(([, v]) => !!v)
		.map(([k]) => pageDefinition.componentDefinition[k])
		.map(e => {
			if (!e?.properties?.visibility) return e;
			return !!getData(e?.properties?.visibility, locationHistory, pageExtractor)
				? e
				: undefined;
		})
		.filter(e => !!e)
		.sort((a: any, b: any) => (a?.displayOrder || 0) - (b?.displayOrder || 0))
		.map(e => {
			let comp = Components.get(e.type);
			if (!comp) comp = Nothing;
			if (!comp) return undefined;

			if (e.type === 'Page') {
				const pageDef = getPageDefinition();
				if (pageDef)
					return React.createElement(comp, {
						definition: pageDef,
						pageComponentDefinition: e,
						key: pageDef.key,
						context: { pageName: pageDef.name },
						locationHistory: [],
					});
			}
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
