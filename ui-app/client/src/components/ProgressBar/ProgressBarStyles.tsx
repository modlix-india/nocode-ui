import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './progressBarStyleProperties';

const PREFIX = '.comp.compProgressBar';
export default function ProgressBarStyles({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
        ${PREFIX} {
            display: flex;
            flex-direction: column;
        }
        ${PREFIX} .progressBarLabel {
            text-align: left;
            position: relative;
        }

        ${PREFIX} .progressBar {
            position: relative;
            display: inline-block;
            overflow: hidden;
            transition: width 2s;
        }

        ${PREFIX} .progressBar .progress {
            display: inline-block;
            height: 100%;
            position: relative;
        }

        ${PREFIX} .progressBar .progressValue {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="ProgressBarCss">{css}</style>;
}
