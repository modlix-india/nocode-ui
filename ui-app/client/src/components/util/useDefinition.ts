import { deepEqual, TokenValueExtractor } from '@fincity/kirun-js';
import { useEffect, useState } from 'react';
import { STORE_PREFIX } from '../../constants';
import { ParentExtractor } from '../../context/ParentExtractor';
import {
	addListener,
	fillerExtractor,
	getData,
	getDataFromPath,
	localStoreExtractor,
	PageStoreExtractor,
	storeExtractor,
} from '../../context/StoreContext';
import {
	ComponentDefinition,
	ComponentDefinitionValues,
	ComponentPropertyDefinition,
	ComponentResoltuions,
	ComponentStylePropertyDefinition,
	LocationHistory,
	StyleResolution,
} from '../../types/common';
import { isNotEqual } from '../../util/setOperations';
import { getPathsFromComponentDefinition } from './getPaths';
import { makePropertiesObject } from './make';

function createNewState(
	definition: ComponentDefinition,
	properties: Array<ComponentPropertyDefinition>,
	stylePropertiesDefinition: ComponentStylePropertyDefinition,
	locationHistory: Array<LocationHistory>,
	tokenExtractors: TokenValueExtractor[],
) {
	const def: ComponentDefinitionValues = { key: definition.key };
	def.properties = makePropertiesObject(
		properties,
		definition.properties,
		locationHistory,
		tokenExtractors,
	);

	if (definition.styleProperties) {
		const devices = getDataFromPath(`${STORE_PREFIX}.devices`, locationHistory);
		const pseudoStates: { [key: string]: any } = { '': { defaultOne: {}, conditioned: [] } };
		for (const ecs of Object.values(definition.styleProperties)) {
			if (ecs.condition) {
				let value = false;

				value = getData(ecs.condition, locationHistory, ...tokenExtractors) as boolean;

				if (!value) continue;
			}

			const pTargets = processTargets(
				ecs.resolutions ?? {},
				devices,
				stylePropertiesDefinition,
				locationHistory,
				tokenExtractors,
			);
			if (!pTargets) continue;

			const state = ecs.pseudoState ?? '';
			if (!pseudoStates[state]) pseudoStates[state] = { defaultOne: {}, conditioned: [] };

			if (ecs.condition) pseudoStates[state].conditioned.push(pTargets);
			else pseudoStates[state].defaultOne = pTargets;
		}

		const consolidateStates: any = {};
		for (const [state, object] of Object.entries(pseudoStates)) {
			let targetStyles = object.defaultOne;
			for (const eachConditionTargets of object.conditioned) {
				for (const [target, styleObj] of Object.entries(eachConditionTargets)) {
					if (targetStyles[target])
						targetStyles[target] = { ...targetStyles[target], ...(styleObj as any) };
					else targetStyles[target] = styleObj as any;
				}
			}
			consolidateStates[state] = targetStyles;
		}

		def.stylePropertiesWithPseudoStates = consolidateStates;
	}
	if (def.stylePropertiesWithPseudoStates?.['']) {
		const targets = Object.keys(def.stylePropertiesWithPseudoStates['']);
		for (const target of targets) {
			const targetStyles = Object.keys(def.stylePropertiesWithPseudoStates[''][target]);
			for (const style of targetStyles) {
				let index = style.indexOf(':');
				if (index === -1) continue;
				const pseudoState = style.substring(index + 1);
				if (!def.stylePropertiesWithPseudoStates[pseudoState])
					def.stylePropertiesWithPseudoStates[pseudoState] = {};
				if (!def.stylePropertiesWithPseudoStates[pseudoState][target])
					def.stylePropertiesWithPseudoStates[pseudoState][target] = {};

				def.stylePropertiesWithPseudoStates[pseudoState][target][
					style.substring(0, index)
				] = def.stylePropertiesWithPseudoStates[''][target][style];
				delete def.stylePropertiesWithPseudoStates[''][target][style];
			}
		}
	}

	return def;
}

const ORDER_OF_RESOLUTION = [
	StyleResolution.MOBILE_POTRAIT_SCREEN,
	StyleResolution.MOBILE_LANDSCAPE_SCREEN,
	StyleResolution.TABLET_POTRAIT_SCREEN,
	StyleResolution.TABLET_LANDSCAPE_SCREEN,
	StyleResolution.DESKTOP_SCREEN,
	StyleResolution.WIDE_SCREEN,
	StyleResolution.DESKTOP_SCREEN_SMALL,
	StyleResolution.TABLET_LANDSCAPE_SCREEN_SMALL,
	StyleResolution.TABLET_POTRAIT_SCREEN_SMALL,
	StyleResolution.MOBILE_LANDSCAPE_SCREEN_SMALL,
	StyleResolution.DESKTOP_SCREEN_ONLY,
	StyleResolution.TABLET_LANDSCAPE_SCREEN_ONLY,
	StyleResolution.TABLET_POTRAIT_SCREEN_ONLY,
	StyleResolution.MOBILE_LANDSCAPE_SCREEN_ONLY,
	StyleResolution.MOBILE_POTRAIT_SCREEN_ONLY,
];

function processTargets(
	resolutions: ComponentResoltuions = {},
	devices: any,
	stylePropertiesDefinition: ComponentStylePropertyDefinition,
	locationHistory: Array<LocationHistory>,
	tokenExtractors: TokenValueExtractor[],
): any {
	let style = resolutions.ALL ? { ...resolutions.ALL } : {};

	if (devices) {
		for (const res of ORDER_OF_RESOLUTION)
			if (devices[res]) style = { ...style, ...resolutions[res] };
	}

	const finStyle: any = {};

	for (let [prop, value] of Object.entries(style)) {
		const v = getData(value, locationHistory, ...tokenExtractors);

		if (!v) continue;

		const index = prop.indexOf('-');
		let prefix = 'comp';
		if (index !== -1) {
			prefix = prop.substring(0, index);
			prop = prop.substring(index + 1);
		}

		if (!finStyle[prefix]) finStyle[prefix] = {};
		finStyle[prefix][prop] = v;
	}
	return finStyle;
}

export default function useDefinition(
	definition: ComponentDefinition,
	properties: Array<ComponentPropertyDefinition>,
	stylePropertiesDefinition: ComponentStylePropertyDefinition,
	locationHistory: Array<LocationHistory>,
	pageExtractor: PageStoreExtractor,
): ComponentDefinitionValues {
	const evaluatorMaps = new Map<string, TokenValueExtractor>([
		[storeExtractor.getPrefix(), storeExtractor],
		[fillerExtractor.getPrefix(), fillerExtractor],
		[localStoreExtractor.getPrefix(), localStoreExtractor],
	]);
	let tokenExtractors: TokenValueExtractor[] = [];

	if (pageExtractor) {
		evaluatorMaps.set(pageExtractor.getPrefix(), pageExtractor);
		tokenExtractors.push(pageExtractor);
	}

	let parentExtractor: ParentExtractor | undefined;

	if (locationHistory.length) {
		parentExtractor = new ParentExtractor(locationHistory);
		evaluatorMaps.set(parentExtractor.getPrefix(), parentExtractor);
		tokenExtractors.push(parentExtractor);
	}

	const [compState, setCompState] = useState<ComponentDefinitionValues>(
		createNewState(
			definition,
			properties,
			stylePropertiesDefinition,
			locationHistory,
			tokenExtractors,
		),
	);
	const [pathsChanged, setPathsChangedAt] = useState(Date.now());

	const propDefMap = properties.reduce((a: any, c) => {
		a[c.name] = c;
		return a;
	}, {});

	const locationHistoryString = (locationHistory ?? [])
		.map(e => e.location + '_' + e.index)
		.join('');

	useEffect(() => {
		let paths = getPathsFromComponentDefinition(definition, evaluatorMaps, propDefMap);

		const x = createNewState(
			definition,
			properties,
			stylePropertiesDefinition,
			locationHistory,
			tokenExtractors,
		);

		if (!deepEqual(x, compState)) setCompState(x);

		if (!paths || !paths.length) {
			return;
		}

		if (parentExtractor) {
			paths = paths.map(p => {
				if (p.indexOf('Parent') === -1) return p;

				return parentExtractor?.getPath(p).path ?? p;
			});
		}

		return addListener(
			(p, v) => {
				const newState = createNewState(
					definition,
					properties,
					stylePropertiesDefinition,
					locationHistory,
					tokenExtractors,
				);

				if (paths.length > 1) {
					const newPaths = getPathsFromComponentDefinition(
						definition,
						evaluatorMaps,
						propDefMap,
					);
					if (
						paths.length !== newPaths.length ||
						isNotEqual(new Set(paths), new Set(newPaths))
					) {
						setPathsChangedAt(Date.now());
					}
				}

				setCompState(newState);
			},
			pageExtractor,
			...paths,
		);
	}, [definition, pathsChanged, locationHistoryString]);

	return compState;
}
