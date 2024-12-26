import { deepEqual, TokenValueExtractor } from '@fincity/kirun-js';
import { useEffect, useState } from 'react';
import { ParentExtractor } from '../../../context/ParentExtractor';
import {
	addListener,
	fillerExtractor,
	localStoreExtractor,
	PageStoreExtractor,
	storeExtractor,
} from '../../../context/StoreContext';
import {
	ComponentDefinition,
	ComponentDefinitionValues,
	ComponentPropertyDefinition,
	ComponentStylePropertyDefinition,
	LocationHistory,
} from '../../../types/common';
import { isNotEqual } from '../../../util/setOperations';
import { getPathsFromComponentDefinition } from '../getPaths';
import { createNewState } from './commons';

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
	const [pathsChangedAt, setPathsChangedAt] = useState(Date.now());

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
	}, [definition, pathsChangedAt, locationHistoryString]);

	return compState;
}
