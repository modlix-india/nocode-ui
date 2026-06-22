import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './svgStyleProperties';

const PREFIX = '.comp.compSvg';

export default function SvgStyle({ theme }: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`
        ${PREFIX} {
            position: relative;
        }

        ${PREFIX} ._onclicktrue {
            cursor: pointer;
        }

        ${PREFIX} ._svgContainer {
            width: inherit;
            height: inherit;
            display: inline-flex;
            line-height: 0;
        }

        ${PREFIX} ._svgContainer svg {
            width: 100%;
            height: 100%;
        }
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="SvgCss">{css}</style>;
}
