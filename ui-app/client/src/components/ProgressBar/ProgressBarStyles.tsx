import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './progressBarStyleProperties';

const PREFIX = '.comp.compProgressBar';
export default function ProgressBarStyles({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
        ${PREFIX} .progressBar {
            display: inline-block;
            overflow: hidden;
		}

        ${PREFIX} .progressBar .progress{
            display: flex;
            justify-content: end;
            align-items: center;
            transition: width 2s;
            height: 100%;
            text-align: right;
        }
        ${PREFIX} .progressBar .progress .progressValue{
            padding: 0 3px;
        }

    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="ProgressBarCss">{css}</style>;
}
