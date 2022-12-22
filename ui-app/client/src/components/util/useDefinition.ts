import { TokenValueExtractor } from '@fincity/kirun-js';
import { useEffect, useState } from 'react';
import { STORE_PREFIX } from '../../constants';
import {
	addListener,
	getData,
	getDataFromLocation,
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
	ComponentStylePropertyGroupDefinition,
	DataLocation,
	StyleResolution,
} from '../../types/common';
import { getPathsFrom, getPathsFromComponentDefinition } from './getPaths';
import { CSS_STYLE_PROPERTY_GROUP_REF } from './properties';

function createNewState(
	definition: ComponentDefinition,
	properties: Array<ComponentPropertyDefinition>,
	stylePropertiesDefinition: ComponentStylePropertyDefinition,
	locationHistory: Array<DataLocation | string>,
	pageExtractor: TokenValueExtractor,
) {
	const def: ComponentDefinitionValues = { key: definition.key };
	def.properties = properties
		.map(e => {
			let value = e.defaultValue;
			if (!definition.properties) return [e.name, value];
			if (pageExtractor)
				value =
					getData(definition.properties[e.name], locationHistory, pageExtractor) ?? value;
			else value = getData(definition.properties[e.name], locationHistory) ?? value;
			return [e.name, value];
		})
		.filter(e => !!e[1])
		.reduce((a: any, [k, v]) => {
			a[k] = v;
			return a;
		}, {});

	if (definition.styleProperties) {
		const devices = getDataFromPath(`${STORE_PREFIX}.devices`, locationHistory);
		const pseudoStates = { '': { defaultOne: {}, conditioned: [] } };
		for (const ecs of Object.values(definition.styleProperties)) {
			if (ecs.condition) {
				let value = false;
				if (pageExtractor) value = getData(ecs.condition, locationHistory, pageExtractor);
				else value = getData(ecs.condition, locationHistory);

				if (!value) continue;
			}

			const pTargets = processTargets(
				ecs.resolutions,
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

		const consolidateStates = {};
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
	resolutions: ComponentResoltuions,
	devices: any,
	stylePropertiesDefinition: ComponentStylePropertyDefinition,
	locationHistory: Array<DataLocation | string>,
	pageExtractor: TokenValueExtractor,
): any {
	let style = resolutions.ALL ? { ...resolutions.ALL } : {};

	if (devices) {
		for (const res of ORDER_OF_RESOLUTION)
			if (devices[res]) style = { ...style, ...resolutions[res] };
	}

	const finStyle = {};

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

		for (const eachTarget of stylePropertiesDefinition[prefix][groupName].target) {
			if (!finStyle[eachTarget]) finStyle[eachTarget] = {};
			finStyle[eachTarget][prop] = v;
		}
	}
	return finStyle;
}

export default function useDefinition(
	definition: ComponentDefinition,
	properties: Array<ComponentPropertyDefinition>,
	stylePropertiesDefinition: ComponentStylePropertyDefinition,
	locationHistory: Array<DataLocation | string>,
	pageExtractor: PageStoreExtractor,
): ComponentDefinitionValues {
	const [compState, setCompState] = useState<ComponentDefinitionValues>({ key: definition.key });
	const evaluatorMaps = new Map<string, TokenValueExtractor>([
		[storeExtractor.getPrefix(), storeExtractor],
		[localStoreExtractor.getPrefix(), localStoreExtractor],
	]);

	if (pageExtractor) evaluatorMaps.set(pageExtractor.getPrefix(), pageExtractor);

	useEffect(() => {
		const paths = getPathsFromComponentDefinition(
			definition.properties,
			definition.styleProperties,
			evaluatorMaps,
		);

		if (definition.bindingPath) {
			const p = getPathsFrom(definition.bindingPath, evaluatorMaps);
			if (p) p.forEach(e => paths.push(e));
		}

		setCompState(
			createNewState(
				definition,
				properties,
				stylePropertiesDefinition,
				locationHistory,
				pageExtractor,
			),
		);

		if (!paths || !paths.length) {
			return;
		}

		return addListener(
			() => {
				setCompState(
					createNewState(
						definition,
						properties,
						stylePropertiesDefinition,
						locationHistory,
						pageExtractor,
					),
				);
			},
			pageExtractor,
			...paths,
		);
	}, []);

	return compState;
}
