import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './linkStyleProperties';

const PREFIX = '.comp.compLink';
export default function LinkStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
	${PREFIX} {
		display: inline-flex;
		flex-direction: row;
		align-items: center;
		gap: 3px;
	}

	${PREFIX} ._externalButton {
		position: relative;
	}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="LinkCss">{css}</style>;
}
