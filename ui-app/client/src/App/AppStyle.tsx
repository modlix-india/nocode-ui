import React, { useEffect, useState } from 'react';
import ComponentDefinitions from '../components';
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
		`*,
	*:before,
	*:after {
		box-sizing: border-box;
	}

	${window.isDesignMode ? 'html { overflow-y: hidden; }' : ''}

	.hide{opacity:0;}
	.show{opacity:1;}
	.comp {position: relative;}
	*:hover::-webkit-scrollbar {float: right;}
	*:hover::-webkit-scrollbar-thumb {visibility: visible;}

	._ROWLAYOUT, ._SINGLECOLUMNLAYOUT, ._ROWCOLUMNLAYOUT {
		display: flex;
		flex-direction: column;
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

	._pointer {cursor: pointer;}
	._validationMessages {position: relative;}
	._eachValidationMessage {position: relative;}
	._validationMessages._floatingMessages {
		position:absolute;
		z-index:1;
	}

	.opacityShowOnHover {opacity: 0;}
	.opacityShowOnHover:hover {opacity: 1 !important;}
	.disableChildrenEvents * {pointer-events: none;}
	._helperChildren {display: none;}
	._helper:hover ._helperChildren {display: block;}

	.fa._rotate-45, .ms._rotate-45, .mi._rotate-45 {transform: rotate(45deg);}
	.fa._rotate-90, .ms._rotate-90, .mi._rotate-90 {transform: rotate(90deg);}
	.fa._rotate-135, .ms._rotate-135, .mi._rotate-135 {transform: rotate(135deg);}
	.fa._rotate-180, .ms._rotate-180, .mi._rotate-180 {transform: rotate(180deg);}
	.fa._rotate-225, .ms._rotate-225, .mi._rotate-225 {transform: rotate(225deg);}
	.fa._rotate-270, .ms._rotate-270, .mi._rotate-270 {transform: rotate(270deg);}
	.fa._rotate-315, .ms._rotate-315, .mi._rotate-315 {transform: rotate(315deg);}
	
	.fa._flip-x, .ms._flip-x, .mi._flip-x {transform: scaleX(-1);}
	.fa._flip-y, .ms._flip-y, .mi._flip-y {transform: scaleY(-1);}
	.fa._flip-both, .ms._flip-both, .mi._flip-both {transform: scale(-1, -1);}

	
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
			<style id="AppCss">{css}</style>
			{styleComps}
			<MessageStyle theme={theme} />
			<style id="AppStyle">{style}</style>
		</>
	);
}
