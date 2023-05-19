import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './messageStyleProperies';

const PREFIX = '.comp.compMessages';
export default function MessageStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		${PREFIX} {
			position: fixed;
		}

		${PREFIX} ._message {
			display: flex;
			align-items: center;
		}

		${PREFIX} ._message ._msgString {
			flex: 1;
		}

		${PREFIX} {
			display: flex;
			flex-direction: column;
		}

		${PREFIX} .fa-circle-xmark{
			cursor: pointer
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="MessageCss">{css}</style>;
}
