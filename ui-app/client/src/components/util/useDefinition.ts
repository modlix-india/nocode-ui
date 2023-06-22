import { deepEqual, isNullValue, TokenValueExtractor } from '@fincity/kirun-js';
import { useEffect, useState } from 'react';
import { STORE_PREFIX } from '../../constants';
import {
	addListener,
	getData,
	getDataFromPath,
	localStoreExtractor,
	PageStoreExtractor,
	storeExtractor,
} from '../../context/StoreContext';
import {
	ComponentDefinition,
	ComponentDefinitionValues,
	ComponentMultiProperty,
	ComponentPropertyDefinition,
	ComponentResoltuions,
	ComponentStylePropertyDefinition,
	LocationHistory,
	StyleResolution,
} from '../../types/common';
import { isNotEqual } from '../../util/setOperations';
import { getPathsFromComponentDefinition } from './getPaths';
import { ParentExtractor } from '../../context/ParentExtractor';

function createNewState(
	definition: ComponentDefinition,
	properties: Array<ComponentPropertyDefinition>,
	stylePropertiesDefinition: ComponentStylePropertyDefinition,
	locationHistory: Array<LocationHistory>,
	pageExtractor: TokenValueExtractor,
) {
	const def: ComponentDefinitionValues = { key: definition.key };
	def.properties = properties
		.map(e => {
			let value = e.defaultValue;

			if (!definition.properties) return [e.name, value];

			if (e.multiValued) {
				if (!isNullValue(definition.properties[e.name]))
					value = Object.values(
						definition.properties[e.name] as ComponentMultiProperty<any>,
					)
						.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
						.map(each => getData(each.property, locationHistory, pageExtractor));
			} else {
				value =
					getData(definition.properties[e.name], locationHistory, pageExtractor) ?? value;
			}

			return [e.name, value];
		})
		.filter(e => !isNullValue(e[1]))
		.reduce((a: any, [k, v]) => {
			a[k] = v;
			return a;
		}, {});

	if (definition.styleProperties) {
		const devices = getDataFromPath(`${STORE_PREFIX}.devices`, locationHistory);
		const pseudoStates: { [key: string]: any } = { '': { defaultOne: {}, conditioned: [] } };
		for (const ecs of Object.values(definition.styleProperties)) {
			if (ecs.condition) {
				let value = false;
				if (pageExtractor)
					value = getData(ecs.condition, locationHistory, pageExtractor) as boolean;
				else value = getData(ecs.condition, locationHistory) as boolean;

				if (!value) continue;
			}

			const pTargets = processTargets(
				ecs.resolutions || {},
				devices,
				stylePropertiesDefinition,
				locationHistory,
				pageExtractor,
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
	pageExtractor: TokenValueExtractor,
): any {
	let style = resolutions.ALL ? { ...resolutions.ALL } : {};

	if (devices) {
		for (const res of ORDER_OF_RESOLUTION)
			if (devices[res]) style = { ...style, ...resolutions[res] };
	}

	const finStyle: any = {};

	for (let [prop, value] of Object.entries(style)) {
		const v = pageExtractor
			? getData(value, locationHistory, pageExtractor)
			: getData(value, locationHistory);

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

const defPropValuesBank: any = {};

function defaultPropValues(def: ComponentDefinition, props: Array<ComponentPropertyDefinition>) {
	let defaultValues = defPropValuesBank[def.type];
	if (defaultValues) return defaultValues;

	defaultValues = {};
	for (const cp of props) {
		if (isNullValue(cp.defaultValue)) continue;
		defaultValues[cp.name] = cp.defaultValue;
	}
	defPropValuesBank[def.type] = defaultValues;
	return defaultValues;
}

export default function useDefinition(
	definition: ComponentDefinition,
	properties: Array<ComponentPropertyDefinition>,
	stylePropertiesDefinition: ComponentStylePropertyDefinition,
	locationHistory: Array<LocationHistory>,
	pageExtractor: PageStoreExtractor,
): ComponentDefinitionValues {
	const [compState, setCompState] = useState<ComponentDefinitionValues>(
		createNewState(
			definition,
			properties,
			stylePropertiesDefinition,
			locationHistory,
			pageExtractor,
		),
	);
	const [pathsChanged, setPathsChangedAt] = useState(Date.now());

	const evaluatorMaps = new Map<string, TokenValueExtractor>([
		[storeExtractor.getPrefix(), storeExtractor],
		[localStoreExtractor.getPrefix(), localStoreExtractor],
	]);

	if (pageExtractor) evaluatorMaps.set(pageExtractor.getPrefix(), pageExtractor);

	let parentExtractor: ParentExtractor | undefined;

	if (locationHistory.length) {
		parentExtractor = new ParentExtractor(locationHistory);
		evaluatorMaps.set(parentExtractor.getPrefix(), parentExtractor);
	}

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
			pageExtractor,
		);

		if (!deepEqual(x, compState)) setCompState(x);

		if (!paths || !paths.length) {
			return;
		}

		if (parentExtractor) {
			paths = paths.map(p => {
				if (!p.startsWith(parentExtractor!.getPrefix())) return p;

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
					pageExtractor,
				);

				if (pageExtractor.getPageName() === '_global') {
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
