import { useEffect, useState } from 'react';
import { FileBrowserStyles } from '../commonComponents/FileBrowser/FileBrowserStyles';
import { getHref } from '../components/util/getHref';
import { lazyCSSURL } from '../components/util/lazyStylePropertyUtil';
import { STORE_PATH_STYLE_PATH, STORE_PATH_THEME_PATH } from '../constants';
import { addListener, getDataFromPath } from '../context/StoreContext';
import { StyleResolution } from '../types/common';
import { processStyleDefinition, StyleResolutionDefinition } from '../util/styleProcessor';
import { styleDefaults, styleProperties } from './appStyleProperties';
import MessageStyle from './Messages/MessageStyle';
import ComponentDefinitions from '../components';

export function AppStyle() {
	const [theme, setTheme] = useState<Map<string, Map<string, string>>>(
		new Map([[StyleResolution.ALL, styleDefaults]]),
	);
	const [style, setStyle] = useState('');

	const TABLET_MIN_WIDTH = StyleResolutionDefinition.get(
		StyleResolution.TABLET_POTRAIT_SCREEN,
	)?.minWidth;

	const DESKTOP_MIN_WIDTH = StyleResolutionDefinition.get(
		StyleResolution.DESKTOP_SCREEN,
	)?.minWidth;

	useEffect(() => {
		const thmValue = getDataFromPath(STORE_PATH_THEME_PATH, []);
		if (!thmValue) {
			setTheme(new Map([[StyleResolution.ALL, styleDefaults]]));
			return;
		}

		const thm: Map<string, Map<string, string>> = new Map(
			Object.entries<any>(thmValue).map(([k, v]) => [
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
	}, [setTheme]);

	useEffect(
		() =>
			addListener(
				undefined,
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
				},
				STORE_PATH_STYLE_PATH,
				STORE_PATH_THEME_PATH,
			),
		[],
	);

	let css =
		`${globalThis.isDesignMode ? 'html { width: calc(100% - 6px) }' : ''}
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
	// Render style components for all statically imported components
	for (const [, comp] of ComponentDefinitions.entries()) {
		if (!comp.styleComponent) continue;

		const StyleComp = comp.styleComponent;
		styleComps.push(
			<StyleComp key={comp.displayName + '_stylcomps'} theme={theme} />,
		);
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
