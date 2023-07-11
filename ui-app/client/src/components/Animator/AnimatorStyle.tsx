import React from 'react';
import { processStyleDefinition, StyleResolutionDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './animatorStyleProperties';

const PREFIX = '.comp.compAnimator';
export default function GridStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css = processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="AnimatorCss">{css}</style>;
}
