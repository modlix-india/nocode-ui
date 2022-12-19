import { TokenValueExtractor } from '@fincity/kirun-js';
import { useEffect, useState } from 'react';
import {
	addListener,
	getData,
	localStoreExtractor,
	storeExtractor,
} from '../../context/StoreContext';
import {
	ComponentDefinition,
	ComponentDefinitionValues,
	ComponentPropertyDefinition,
	DataLocation,
} from '../../types/common';
import { getPathsFrom, getPathsFromComponentDefinition } from './getPaths';

function createNewState(
	definition: ComponentDefinition,
	properties: Array<ComponentPropertyDefinition>,
	locationHistory: Array<DataLocation | string>,
	pageExtractor: TokenValueExtractor,
) {
	const def: ComponentDefinitionValues = { key: definition.key };
	def.properties = properties
		.map(e => [
			e.name,
			!definition.properties[e.name]
				? e.defaultValue
				: getData(definition.properties[e.name], locationHistory, pageExtractor) ??
				  e.defaultValue,
		])
		.filter(e => !!e[1])
		.reduce((a, [k, v]) => {
			a[k] = v;
			return a;
		}, {});
	console.log(definition.styleProperties);
	// def.styleProperties = Obj

	return def;
}

export default function useDefinition(
	definition: ComponentDefinition,
	properties: Array<ComponentPropertyDefinition>,
	locationHistory: Array<DataLocation | string>,
	pageExtractor: TokenValueExtractor,
): ComponentDefinitionValues {
	const [compState, setCompState] = useState<ComponentDefinitionValues>({ key: definition.key });
	const evaluatorMaps = new Map<string, TokenValueExtractor>([
		[storeExtractor.getPrefix(), storeExtractor],
		[localStoreExtractor.getPrefix(), localStoreExtractor],
		[pageExtractor.getPrefix(), pageExtractor],
	]);

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

		if (!paths || !paths.length) {
			setCompState(createNewState(definition, properties, locationHistory, pageExtractor));
			return;
		}

		return addListener(
			() =>
				setCompState(
					createNewState(definition, properties, locationHistory, pageExtractor),
				),
			...paths,
		);
	}, []);

	return compState;
}
