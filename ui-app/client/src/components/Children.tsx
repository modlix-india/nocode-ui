import React from 'react';
import { ComponentDefinition, DataLocation, LocationHistory, RenderContext } from '../types/common';
import {
	addListener,
	getData,
	getDataFromPath,
	localStoreExtractor,
	PageStoreExtractor,
	storeExtractor,
} from '../context/StoreContext';
import { useLocation } from 'react-router-dom';
import { GLOBAL_CONTEXT_NAME, STORE_PREFIX } from '../constants';
import { Components } from './index';
import Nothing from './Nothing';
import { TokenValueExtractor } from '@fincity/kirun-js';
import { getPathsFrom } from './util/getPaths';
import { processLocation } from '../util/locationProcessor';
import { flattenUUID } from './util/uuid';
import { runEvent } from './util/runEvent';
import * as getPageDefinition from './../definitions/getPageDefinition.json';

const getOrLoadPageDefinition = (location: any) => {
	let { pageName } = processLocation(location);
	const pDef = getDataFromPath(`${STORE_PREFIX}.pageDefinition.${pageName}`, []);
	if (pDef == undefined) {
		(async () =>
			await runEvent(
				getPageDefinition,
				'pageDefinition',
				GLOBAL_CONTEXT_NAME,
				[],
				undefined,
				new Map([['pageName', pageName]]),
			))();
	}
	return getDataFromPath(`${STORE_PREFIX}.pageDefinition.${pageName}`, []);
};

function processDefinitionLocationHistory(
	def: ComponentDefinition,
	locationHistory: Array<LocationHistory>,
): ComponentDefinition {
	if (!locationHistory?.length) return def;

	const newDef = JSON.parse(JSON.stringify(def));
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
	pageDefinition: any;
	children: any;
	context: RenderContext;
	locationHistory: Array<LocationHistory>;
}) {
	const [visibilityPaths, setVisibilityPaths] = React.useState(Date.now());
	const location = useLocation();
	const observerRefs = React.useRef<Array<HTMLElement>>([]);
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
				for (let str of c) a.add(str);
				return a;
			}, new Set<string>());

		if (set.size == 0) return undefined;
		return addListener(() => setVisibilityPaths(Date.now()), pageExtractor, ...set);
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
		.sort((a: any, b: any) => (a?.displayOrder ?? 0) - (b?.displayOrder ?? 0));

	React.useEffect(
		() => () =>
			context.observer && observerRefs.current.forEach(e => context.observer?.unobserve(e)),
		[defs.length],
	);

	return (
		<>
			{defs
				.map((e, i) => {
					let comp = Components.get(e!.type);
					if (!comp) comp = Nothing;
					if (!comp) return undefined;
					if (e!.type === 'Page') {
						const pageDef = getOrLoadPageDefinition(location);
						if (pageDef)
							return React.createElement(comp, {
								definition: pageDef,
								pageComponentDefinition: e,
								key: pageDef.name,
								context: { pageName: pageDef.name },
								locationHistory: [],
							});
					}
					const fKey = flattenUUID(e?.key);
					const ctx = validationTriggers[fKey]
						? { ...context, showValidationMessages: true }
						: context;
					const rComp = React.createElement(comp, {
						definition: e,
						key: e!.key,
						pageDefinition: pageDefinition,
						context: { ...ctx, observer: undefined },
						locationHistory: locationHistory,
					});
					if (!context.observer) return rComp;
					return (
						<div
							data-key={e.key}
							ref={el => {
								if (!el || el == null) return;
								if (observerRefs.current[i] === el) return;
								if (observerRefs.current[i])
									context.observer?.unobserve(observerRefs.current[i]);
								observerRefs.current[i] = el;
								context.observer?.observe(el);
							}}
							key={e.key}
						>
							{rComp}
						</div>
					);
				})
				.filter(e => !!e)}
		</>
	);
}

export default Children;
