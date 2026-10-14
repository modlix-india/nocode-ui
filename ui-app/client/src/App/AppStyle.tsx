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
import ShortcutStyle from '../shortcuts/ShortcutStyle';
import ComponentDefinitions from '../components';
import { usedComponents } from './usedComponents';
import { hasNewNames, styledComponents } from './styleFloor';
import { COMMON_CHECKBOX_CSS } from '../commonComponents/commonCheckboxCss';

/**
 * The theme variables as AppStyle keys them: one map per resolution, with ALL laid over the
 * platform defaults. No theme means the defaults alone.
 */
function themeMaps(value: any): Map<string, Map<string, string>> {
	if (!value) return new Map([[StyleResolution.ALL, styleDefaults]]);

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
	return thm;
}

export function AppStyle() {
	// Read from the store on the FIRST render, not in an effect. The store already holds the
	// app's theme when this mounts (StoreContext seeds it from the app definition), and an
	// effect runs only after the first paint: until then every theme class wore the platform
	// default, so a page whose root is _QUATERNARYBG flashed #EC6B5F red on load. A server
	// render never runs effects at all, so its markup shipped with the defaults for good.
	const [theme, setTheme] = useState<Map<string, Map<string, string>>>(() =>
		themeMaps(getDataFromPath(STORE_PATH_THEME_PATH, [])),
	);
	const [style, setStyle] = useState('');

	/**
	 * Which components have rendered, and so whose CSS belongs in the document.
	 *
	 * Subscribed to directly rather than through the listener App.tsx keeps,
	 * because that one defers by 100ms. A style arriving 100ms after the
	 * component it styles is a visible flash; `usedComponents.using` is called
	 * during render, so an immediate setState lands in the same React commit
	 * and the CSS is there before the browser paints.
	 */
	const [styled, setStyled] = useState<Set<string>>(() => styledComponents([]));

	useEffect(() => {
		setStyled(prev => styledComponents(usedComponents.names(), prev));
		return usedComponents.registerGloblalListener(uc =>
			// `using` is called while another component renders. A setState here, inside that
			// render, rendered newly emitted style components without ever running their
			// effects, so lazily themed ones (RadioButton in a filter popup) never inflated.
			// A microtask runs after that render and still before the browser paints.
			queueMicrotask(() =>
				setStyled(prev => {
					const next = styledComponents(uc, prev);
					// Same set means the same render output, so returning `prev`
					// keeps React from committing a no-op on every component mount.
					return hasNewNames(prev, next) ? next : prev;
				}),
			),
		);
	}, []);

	const TABLET_MIN_WIDTH = StyleResolutionDefinition.get(
		StyleResolution.TABLET_POTRAIT_SCREEN,
	)?.minWidth;

	const DESKTOP_MIN_WIDTH = StyleResolutionDefinition.get(
		StyleResolution.DESKTOP_SCREEN,
	)?.minWidth;

	useEffect(() => {
		setTheme(themeMaps(getDataFromPath(STORE_PATH_THEME_PATH, [])));
	}, [setTheme]);

	useEffect(
		() =>
			addListener(
				undefined,
				(path, value) => {
					if (path == STORE_PATH_THEME_PATH) setTheme(themeMaps(value));
					else if (path == STORE_PATH_STYLE_PATH) setStyle(value ?? '');
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

	${COMMON_CHECKBOX_CSS}

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
	// Only the components this page has actually rendered, plus the floor in
	// styleFloor.ts. Emitting all of them cost 374KB of unused CSS on a
	// measured marketing page.
	for (const [name, comp] of ComponentDefinitions.entries()) {
		if (!comp.styleComponent) continue;
		if (!styled.has(name)) continue;

		const StyleComp = comp.styleComponent;
		styleComps.push(<StyleComp key={comp.displayName + '_stylcomps'} theme={theme} />);
	}

	return (
		<>
			<link key="externalAppCSS" rel="stylesheet" href={lazyCSSURL('App')} />
			<style id="AppCss">{css}</style>
			{styleComps}
			<MessageStyle theme={theme} />
			<ShortcutStyle theme={theme} />
			<FileBrowserStyles />
			<style id="AppStyle">{style}</style>
		</>
	);
}
