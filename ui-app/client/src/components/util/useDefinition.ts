import { deepEqual, isNullValue, TokenValueExtractor } from '@fincity/kirun-js';
import { useEffect, useState } from 'react';
import { SCHEMA_VALIDATION, STORE_PREFIX } from '../../constants';
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
	ComponentProperty,
	ComponentPropertyDefinition,
	ComponentResoltuions,
	ComponentStylePropertyDefinition,
	DataLocation,
	LocationHistory,
	StyleResolution,
} from '../../types/common';
import { getPathsFrom, getPathsFromComponentDefinition } from './getPaths';
import { CSS_STYLE_PROPERTY_GROUP_REF } from './properties';

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
	return def;
}

const ORDER_OF_RESOLUTION = [
	StyleResolution.MOBILE_POTRAIT_SCREEN,
	StyleResolution.MOBILE_LANDSCAPE_SCREEN,
	StyleResolution.TABLET_POTRAIT_SCREEN,
	StyleResolution.TABLET_LANDSCAPE_SCREEN,
	StyleResolution.DESKTOP_SCREEN,
	StyleResolution.WIDE_SCREEN,
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
		let prefix = '';
		if (index !== -1) {
			prefix = prop.substring(0, index);
			prop = prop.substring(index + 1);
		}

		if (!stylePropertiesDefinition[prefix]) continue;

		const groupName = CSS_STYLE_PROPERTY_GROUP_REF[prop];
		if (!groupName) continue;

		for (const eachTarget of stylePropertiesDefinition[prefix]?.[groupName]?.target ?? []) {
			if (!finStyle[eachTarget]) finStyle[eachTarget] = {};
			finStyle[eachTarget][prop] = v;
		}
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
	const evaluatorMaps = new Map<string, TokenValueExtractor>([
		[storeExtractor.getPrefix(), storeExtractor],
		[localStoreExtractor.getPrefix(), localStoreExtractor],
	]);

	if (pageExtractor) evaluatorMaps.set(pageExtractor.getPrefix(), pageExtractor);

	const propDefMap = properties.reduce((a: any, c) => {
		a[c.name] = c;
		return a;
	}, {});

	useEffect(() => {
		const paths = getPathsFromComponentDefinition(
			definition.properties,
			definition.styleProperties,
			evaluatorMaps,
			propDefMap,
		);

		if (definition.bindingPath) {
			const p = getPathsFrom(definition.bindingPath, evaluatorMaps);
			if (p) p.forEach(e => paths.push(e));
		}

		if (definition.bindingPath2) {
			const p = getPathsFrom(definition.bindingPath2, evaluatorMaps);
			if (p) p.forEach(e => paths.push(e));
		}

		if (definition.bindingPath3) {
			const p = getPathsFrom(definition.bindingPath3, evaluatorMaps);
			if (p) p.forEach(e => paths.push(e));
		}

		if (definition.bindingPath4) {
			const p = getPathsFrom(definition.bindingPath4, evaluatorMaps);
			if (p) p.forEach(e => paths.push(e));
		}

		if (definition.bindingPath5) {
			const p = getPathsFrom(definition.bindingPath5, evaluatorMaps);
			if (p) p.forEach(e => paths.push(e));
		}

		if (definition.bindingPath6) {
			const p = getPathsFrom(definition.bindingPath6, evaluatorMaps);
			if (p) p.forEach(e => paths.push(e));
		}

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

		return addListener(
			() => {
				const newState = createNewState(
					definition,
					properties,
					stylePropertiesDefinition,
					locationHistory,
					pageExtractor,
				);
				setCompState(newState);
			},
			pageExtractor,
			...paths,
		);
	}, [definition]);

	return compState;
}
