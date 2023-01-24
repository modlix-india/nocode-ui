import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './messageStyleProperies';

const PREFIX = '.comp.compMessages';
export default function MessageStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		${PREFIX} {
			position: sticky;
			float: left;
		}

		${PREFIX} ._message {
			display: flex;
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="MessageCss">{css}</style>;
}
