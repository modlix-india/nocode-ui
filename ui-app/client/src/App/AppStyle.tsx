import React, { useEffect, useState } from 'react';
import { ComponentDefinitions } from '../components';
import { STORE_PATH_APP, STORE_PATH_STYLE_PATH, STORE_PATH_THEME_PATH } from '../constants';
import { addListener } from '../context/StoreContext';
import { Component } from '../types/component';
import { processStyleDefinition, processStyleValue } from '../util/styleProcessor';
import { styleDefaults, styleProperties } from './appStyleProperties';

export default function AppStyle() {
	const [theme, setTheme] = useState<Map<string, string>>(styleDefaults);
	const [style, setStyle] = useState('');
	const [compList, setCompList] = useState(new Set<string>());

	useEffect(
		() =>
			addListener(
				(path, value) => {
					if (path == STORE_PATH_THEME_PATH) {
						if (value)
							setTheme(new Map([...styleDefaults, ...Object.entries<string>(value)]));
					} else if (path == STORE_PATH_STYLE_PATH) setStyle(value ?? '');
					else if (path == STORE_PATH_APP)
						setCompList(value.components ?? new Set<string>());
				},
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
	}` + processStyleDefinition('', styleProperties, theme);

	const styleComps = new Array();

	for (let i = 0; i < ComponentDefinitions.length; i++) {
		const comp: Component = ComponentDefinitions[i];
		if (!comp.styleComponent) continue;
		if (compList.size != 0 && !compList.has(comp.name)) continue;

		const StyleComp = comp.styleComponent;
		styleComps.push(<StyleComp theme={theme} />);
	}

	return (
		<>
			<style id="APPCss">{css}</style>
			{styleComps}
			<style id="APPStyle">{style}</style>
		</>
	);
}
