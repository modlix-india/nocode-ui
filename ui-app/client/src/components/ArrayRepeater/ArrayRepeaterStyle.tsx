import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './arrayRepeaterStyleProperties';

const PREFIX = '.comp.compArrayRepeater';
export default function ArrayRepeaterStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
	${PREFIX}{
		flex-direction: column;
	}

	${PREFIX}._ROWLAYOUT{
		flex-direction: row;
	}

	${PREFIX} .disabled {
		pointer-events: none;
		opacity: 0.7;
	}
	${PREFIX} .addOne {
		cursor: pointer;
	}
	${PREFIX} .reduceOne {
		cursor: pointer;
	}
	${PREFIX} .moveOne {
		cursor: pointer;
	}
	${PREFIX} .dragging {
		margin-top: 20px;
		opacity: 50%;
	}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="ArrayRepeaterCss">{css}</style>;
}
