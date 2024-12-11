import React, { useEffect, useState } from 'react';
import { StyleResolutionDefinition, processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './fillerDefinitionEditorStyleProperties';
import { StyleResolution } from '../../types/common';
import { usedComponents } from '../../App/usedComponents';
import { lazyCSSURL } from '../util/lazyStylePropertyUtil';

const PREFIX = '.comp.compFillerDefinitionEditor';
const NAME = 'FillerDefinitionEditor';
export default function FillerDefinitionEditorStyle({
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

	const DESKTOP_MIN_WIDTH = StyleResolutionDefinition.get(
		StyleResolution.DESKTOP_SCREEN,
	)?.minWidth;

	const css =
		`@media screen and (min-width: ${DESKTOP_MIN_WIDTH}px) {
			${PREFIX} {
				grid-template-columns: 1fr 1fr;
			}
		}` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return (
		<>
			{used ? <link key="externalCSS" rel="stylesheet" href={lazyCSSURL(NAME)} /> : <></>}
			<style id="FillerDefinitionEditorCSS">{css}</style>
		</>
	);
}
