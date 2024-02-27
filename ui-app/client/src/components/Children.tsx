import { isNullValue, TokenValueExtractor } from '@fincity/kirun-js';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { STORE_PREFIX } from '../constants';
import {
	addListener,
	getData,
	getDataFromPath,
	localStoreExtractor,
	PageStoreExtractor,
	storeExtractor,
} from '../context/StoreContext';
import {
	ComponentDefinition,
	LocationHistory,
	PageDefinition,
	RenderContext,
} from '../types/common';
import { duplicate } from '@fincity/kirun-js';
import { processLocation } from '../util/locationProcessor';
import ComponentDefinitions from './index';
import Nothing from './Nothing';
import PageComponentDefinition from './Page/Page';
import { getPathsFrom } from './util/getPaths';
import { flattenUUID } from './util/uuid';

const getOrLoadPageDefinition = (location: any) => {
	let { pageName } = processLocation(location);
	if (!pageName) {
		pageName = getDataFromPath(`${STORE_PREFIX}.application.properties.defaultPage`, []);
	}
	return getDataFromPath(`${STORE_PREFIX}.pageDefinition.${pageName}`, []);
};

function processDefinitionLocationHistory(
	def: ComponentDefinition,
	locationHistory: Array<LocationHistory>,
): ComponentDefinition {
	if (!locationHistory?.length) return def;
	if (isNullValue(def)) return def;

	const newDef = duplicate(def);
	const str = locationHistory.map(e => e.index).join('_');
	newDef.key = newDef.key + '_' + str;
	return newDef;
}

function Children({
	pageDefinition,
	children,
	context,
	locationHistory,
}: {
	pageDefinition: PageDefinition;
	children: any;
	context: RenderContext;
	locationHistory: Array<LocationHistory>;
}) {
	const [visibilityPaths, setVisibilityPaths] = React.useState(Date.now());
	const location = useLocation();
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const evaluatorMaps = new Map<string, TokenValueExtractor>([
		[storeExtractor.getPrefix(), storeExtractor],
		[localStoreExtractor.getPrefix(), localStoreExtractor],
		[pageExtractor.getPrefix(), pageExtractor],
	]);

	React.useEffect(() => {
		let set = Object.entries((pageDefinition?.componentDefinition ? children : {}) ?? {})
			.filter(([, v]) => !!v)
			.map(([k]) => pageDefinition.componentDefinition[k])
			.map(def => processDefinitionLocationHistory(def, locationHistory))
			.filter(e => !!e?.properties?.visibility)
			.map(e => getPathsFrom(e.properties!.visibility, evaluatorMaps))
			.reduce((a, c) => {
				for (let str of Array.from(c)) a.add(str);
				return a;
			}, new Set<string>());

		if (set.size == 0) return undefined;
		return addListener(() => setVisibilityPaths(Date.now()), pageExtractor, ...Array.from(set));
	}, []);

	const validationTriggers =
		getDataFromPath(`Store.validationTriggers.${context.pageName}`, locationHistory) ?? {};

	if (!pageDefinition?.componentDefinition) return <></>;

	const defs = Object.entries(children ?? {})
		.filter(([, v]) => !!v)
		.map(([k]) => pageDefinition.componentDefinition[k])
		.map(e => {
			if (!e?.properties?.visibility) return e;

			return !!getData(e?.properties?.visibility, locationHistory, pageExtractor)
				? e
				: undefined;
		})
		.filter(e => !!e) 
		.sort((a: any, b: any) => {
			const v = (a?.displayOrder ?? 0) - (b?.displayOrder ?? 0);
			return v === 0 ? (a?.key ?? '').localeCompare(b?.key ?? '') : v;
		});

	return (
		<>
			{defs
				.map((e, i) => {
					if (!e) return;
					let Comp = ComponentDefinitions.get(e!.type)?.component;
					if (!Comp) Comp = Nothing.component;
					if (!Comp) return undefined;
					if (e!.type === 'Page') {
						const pageDef = getOrLoadPageDefinition(location);
						if (pageDef)
							return (
								<PageComponentDefinition.component
									definition={e}
									pageDefinition={pageDef}
									key={pageDef.name}
									context={{
										pageName: pageDef.name,
										level: context.level + 1,
										shellPageName: context.pageName,
									}}
									locationHistory={[]}
								/>
							);
						else return undefined;
					}
					const fKey = flattenUUID(e?.key);
					const ctx = validationTriggers[fKey]
						? { ...context, showValidationMessages: true }
						: context;
					const rComp = React.createElement(Comp, {
						definition: e,
						key: e!.key,
						pageDefinition: pageDefinition,
						context: { ...ctx },
						locationHistory: locationHistory,
					});
					return rComp;
				})
				.filter(e => !!e)}
		</>
	);
}

export default Children;
