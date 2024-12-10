import React, { useEffect, useState } from 'react';
import { FileBrowserStyles } from '../commonComponents/FileBrowser/FileBrowserStyles';
import ComponentDefinitions from '../components';
import { getHref } from '../components/util/getHref';
import { lazyCSSURL } from '../components/util/lazyStylePropertyUtil';
import { STORE_PATH_APP, STORE_PATH_STYLE_PATH, STORE_PATH_THEME_PATH } from '../constants';
import { addListener } from '../context/StoreContext';
import { Component, StyleResolution } from '../types/common';
import { processStyleDefinition, StyleResolutionDefinition } from '../util/styleProcessor';
import { styleDefaults, styleProperties } from './appStyleProperties';
import MessageStyle from './Messages/MessageStyle';

export default function AppStyle() {
	const [theme, setTheme] = useState<Map<string, Map<string, string>>>(
		new Map([[StyleResolution.ALL, styleDefaults]]),
	);
	const [style, setStyle] = useState('');
	const [compList, setCompList] = useState(new Set<string>());

	const TABLET_MIN_WIDTH = StyleResolutionDefinition.get(
		StyleResolution.TABLET_POTRAIT_SCREEN,
	)?.minWidth;

	const TABLET_LAND_MIN_WIDTH = StyleResolutionDefinition.get(
		StyleResolution.TABLET_LANDSCAPE_SCREEN,
	)?.minWidth;

	const DESKTOP_MIN_WIDTH = StyleResolutionDefinition.get(
		StyleResolution.DESKTOP_SCREEN,
	)?.minWidth;

	useEffect(
		() =>
			addListener(
				(path, value) => {
					if (path == STORE_PATH_THEME_PATH) {
						if (!value) {
							setTheme(new Map([[StyleResolution.ALL, styleDefaults]]));
						} else {
							const thm: Map<string, Map<string, string>> = new Map(
								Object.entries<any>(value).map(([k, v]) => [
									k,
									new Map<string, string>(Object.entries<string>(v)),
								]),
							);

							thm.set(
								StyleResolution.ALL,
								thm.has(StyleResolution.ALL)
									? new Map<string, string>([
											...Array.from(styleDefaults),
											...Array.from(thm.get(StyleResolution.ALL) ?? []),
										])
									: styleDefaults,
							);

							setTheme(thm);
						}
					} else if (path == STORE_PATH_STYLE_PATH) setStyle(value ?? '');
					else if (path == STORE_PATH_APP)
						setCompList(value?.components ?? new Set<string>());
				},
				undefined,
				STORE_PATH_STYLE_PATH,
				STORE_PATH_THEME_PATH,
				STORE_PATH_APP,
			),
		[],
	);

	let css =
		`${window.isDesignMode ? 'html { width: calc(100% - 6px) }' : ''}
	._flag {
		background: url('${getHref('api/files/static/file/SYSTEM/jslib/flags/flags.png', window.location)}') no-repeat;
		background-size: 100%;
	}

	._ROWLAYOUT, ._SINGLECOLUMNLAYOUT, ._ROWCOLUMNLAYOUT {
		display: flex;
		flex-direction: column;
	}

	._ROWLAYOUT {
		flex-direction: row;
	}

	._FIVECOLUMNSLAYOUT,
	._FOURCOLUMNSLAYOUT,
	._THREECOLUMNSLAYOUT,
	._TWOCOLUMNSLAYOUT {
		display: grid;
		grid-template-columns: 1fr;
	}

	@media screen and (min-width: ${TABLET_MIN_WIDTH}px) {
	
		._FIVECOLUMNSLAYOUT,
		._FOURCOLUMNSLAYOUT,
		._THREECOLUMNSLAYOUT,
		._TWOCOLUMNSLAYOUT {
			grid-template-columns: 1fr 1fr;
		}
	}

	@media screen and (min-width: ${DESKTOP_MIN_WIDTH}px) {
	
		._FIVECOLUMNSLAYOUT {grid-template-columns: 1fr 1fr 1fr 1fr 1fr;}

		._FOURCOLUMNSLAYOUT {grid-template-columns: 1fr 1fr 1fr 1fr;}

		._THREECOLUMNSLAYOUT {grid-template-columns: 1fr 1fr 1fr;}

		._ROWCOLUMNLAYOUT {flex-direction: row;}
	}
		
	` + processStyleDefinition('', styleProperties, styleDefaults, theme);

	const styleComps = new Array();

	const comps = ComponentDefinitions.values();
	let comp: IteratorResult<Component, boolean>;
	while (!(comp = comps.next()).done) {
		if (!comp.value.styleComponent) continue;
		if (compList.size != 0 && !compList.has(comp.value.name)) continue;

		const StyleComp = comp.value.styleComponent;
		styleComps.push(<StyleComp key={comp.value.displayName + '_stylcomps'} theme={theme} />);
	}

	return (
		<>
			<link key="externalAppCSS" rel="stylesheet" href={lazyCSSURL('App')} />
			<style id="AppCss">{css}</style>
			{styleComps}
			<MessageStyle theme={theme} />
			<FileBrowserStyles />
			<style id="AppStyle">{style}</style>
		</>
	);
}
