import { TokenValueExtractor } from '@fincity/kirun-js';
import { useEffect, useState } from 'react';
import {
	addListener,
	getData,
	localStoreExtractor,
	PageStoreExtractor,
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
		.map(e => {
			let value = e.defaultValue;
			if (!definition.properties) return [e.name, value];
			value = getData(definition.properties[e.name], locationHistory, pageExtractor) ?? value;
			return [e.name, value];
		})
		.filter(e => !!e[1])
		.reduce((a: any, [k, v]) => {
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
	pageExtractor: PageStoreExtractor,
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

		setCompState(createNewState(definition, properties, locationHistory, pageExtractor));
		console.log(paths);
		if (!paths || !paths.length) {
			return;
		}

		console.log('Adding Listener to : ', paths);
		return addListener(
			(path, value) => {
				console.log('Listening to ' + path);
				console.log('Listened value', value);
				setCompState(
					createNewState(definition, properties, locationHistory, pageExtractor),
				);
			},
			pageExtractor,
			...paths,
		);
	}, []);

	return compState;
}
