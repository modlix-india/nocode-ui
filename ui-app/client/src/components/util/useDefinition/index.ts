import { deepEqual, TokenValueExtractor } from '@fincity/kirun-js';
import { useEffect, useMemo, useState } from 'react';
import { ParentExtractor } from '../../../context/ParentExtractor';
import {
	addListener,
	fillerExtractor,
	localStoreExtractor,
	PageStoreExtractor,
	storeExtractor,
	UrlDetailsExtractor,
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
	urlExtractor: UrlDetailsExtractor,
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

	if (urlExtractor) {
		evaluatorMaps.set(urlExtractor.getPrefix(), urlExtractor);
		tokenExtractors.push(urlExtractor);
	}

	let parentExtractor: ParentExtractor | undefined;

	if (locationHistory.length) {
		parentExtractor = new ParentExtractor(locationHistory);
		evaluatorMaps.set(parentExtractor.getPrefix(), parentExtractor);
		tokenExtractors.push(parentExtractor);
	}

	// Lazy initialiser: createNewState evaluates every property and every style
	// resolution. Passing it eagerly ran that full evaluation on every render and
	// threw the result away on all but the first.
	const [compState, setCompState] = useState<ComponentDefinitionValues>(() =>
		createNewState(
			definition,
			properties,
			stylePropertiesDefinition,
			locationHistory,
			tokenExtractors,
		),
	);
	const [pathsChangedAt, setPathsChangedAt] = useState(Date.now());

	const propDefMap = useMemo(
		() =>
			properties.reduce((a: any, c) => {
				a[c.name] = c;
				return a;
			}, {}),
		[properties],
	);

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
			pageExtractor?.getPageName() ?? undefined,
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
				// createNewState always returns a fresh object, so setting it
				// unconditionally re-rendered this component (and its whole subtree)
				// on every store notification even when nothing it depends on
				// actually changed. Bail out when the resolved values are equal.
				setCompState(prev => (deepEqual(prev, newState) ? prev : newState));
			},
			...paths,
		);
	}, [definition, pathsChangedAt, locationHistoryString]);

	return compState;
}
