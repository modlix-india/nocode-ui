import { deepEqual, TokenValueExtractor } from '@fincity/kirun-js';
import { useEffect, useMemo, useState } from 'react';
import { ParentExtractor } from '../../../context/ParentExtractor';
import {
	addListener,
	fillerExtractor,
	localStoreExtractor,
	PageStoreExtractor,
	storeExtractor,
	themeExtractor,
	UrlDetailsExtractor,
} from '../../../context/StoreContext';
import { STORE_PATH_THEME_PATH } from '../../../constants';
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

	/**
	 * Does this component read the theme, and therefore need to repaint when the
	 * visitor switches it?
	 *
	 * `Theme.` is a SYNTHESISED prefix: ThemeExtractor resolves it out of the live
	 * store, but it is not one of the extractors getPathsFromComponentDefinition
	 * walks, so a `Theme.borderColorNine` in a style leaf produces no path and no
	 * listener. On a theme switch the stylesheet swapped (AppStyle watches
	 * `Store.theme` for itself) while every definition-driven colour kept the old
	 * theme's value until the page was remounted -- so a switch half-repainted, and
	 * the more of a page's styling pointed at the theme the more obvious the half
	 * that did not move. Watching the theme object is what closes that.
	 *
	 * Guarded by the string test rather than added for everyone: it is one extra
	 * listener per THEME-DRIVEN component instead of one per component, and the
	 * deepEqual in the callback means a component whose resolved values did not
	 * actually move still does not re-render.
	 */
	const readsTheme = useMemo(
		() => JSON.stringify(definition ?? {}).includes(themeExtractor.getPrefix()),
		[definition],
	);

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

		if ((!paths || !paths.length) && !readsTheme) {
			return;
		}

		paths = paths ?? [];

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
			// The theme path is watched but deliberately NOT part of `paths`: the
			// block above compares `paths` against a freshly derived list to detect
			// a binding that now points somewhere else, and a constant path in one
			// list and not the other makes that comparison always unequal, which
			// re-registers the listener on every notification forever.
			...(readsTheme ? [...paths, STORE_PATH_THEME_PATH] : paths),
		);
	}, [definition, pathsChangedAt, locationHistoryString, readsTheme]);

	return compState;
}
