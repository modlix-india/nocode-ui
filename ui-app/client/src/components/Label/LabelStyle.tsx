import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './labelStyleProperies';

const PREFIX = '.comp.compLabel';
export default function LabelStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css = `` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="LabelCss">{css}</style>;
}
