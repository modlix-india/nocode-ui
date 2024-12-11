import React, { useEffect, useState } from 'react';
import { usedComponents } from '../../App/usedComponents';
import { StylePropertyDefinition } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import { lazyCSSURL, lazyStylePropertyLoadFunction } from '../util/lazyStylePropertyUtil';
import { styleDefaults, styleProperties } from './KIRunEditorStyleProperties';

const PREFIX = '.comp.compKIRunEditor';
const NAME = 'KIRun Editor';
export default function KIRunEditorStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const [used, setUsed] = useState(false);

	useEffect(() => {
		const fn = () => setUsed(true);

		if (usedComponents.used(NAME)) fn();
		usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, [setUsed]);
	const css = processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
	return (
		<>
			{used ? <link key="externalCSS" rel="stylesheet" href={lazyCSSURL(NAME)} /> : undefined}
			<style id="KIRUNEditorCss">{css}</style>
		</>
	);
}
