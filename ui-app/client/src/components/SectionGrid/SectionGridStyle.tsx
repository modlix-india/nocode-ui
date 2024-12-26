import React from 'react';
import { processStyleDefinition, StyleResolutionDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './sectionGridStyleProperties';

const PREFIX = '.comp.compSectionGrid';
export default function SectionGridStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css = `` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="SectionGridCss">{css}</style>;
}
