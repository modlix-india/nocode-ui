import React, { useEffect, useState } from 'react';
import { processStyleDefinition, StyleResolutionDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './fillerValueEditorStyleProperties';
import { lazyCSSURL } from '../util/lazyStylePropertyUtil';
import { usedComponents } from '../../App/usedComponents';

const PREFIX = '.comp.compFillerValueEditor';
const NAME = 'FillerValueEditor';
export default function FillerValueEditorStyle({
	theme,
}: {
	theme: Map<string, Map<string, string>>;
}) {
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
			{used ? <link key="externalCSS" rel="stylesheet" href={lazyCSSURL(NAME)} /> : <></>}
			<style id="FillterValueEditorCSS">{css}</style>;
		</>
	);
}
