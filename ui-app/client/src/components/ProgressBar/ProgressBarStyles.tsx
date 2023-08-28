import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './progressBarStyleProperties';

const PREFIX = '.comp.compProgressBar';
export default function ProgressBarStyles({ theme }: { theme: Map<string, Map<string, string>> }) {
	const values = new Map([
		...Array.from(theme.get(StyleResolution.ALL) ?? []),
		...Array.from(styleDefaults),
	]);
	console.log();
	const css =
		`
        ${PREFIX}._circular, ${PREFIX}._circular_text_background_outline, ${PREFIX}._circular_text_background {
            display: flex;
            flex: 1;
        }
        ${PREFIX} ._track {
            position: relative;
            overflow: hidden;
        }

        ${PREFIX} ._track ._progress {
            position: relative;
            display: block;
            height: 100%;
        }

        ${PREFIX} ._track ._progress._center {
            text-align: center;
        }

        ${PREFIX} ._track ._progress._right {
            text-align: right;
        }

        ${PREFIX} ._track ._progress._left {
            text-align: left;
        }

        ${PREFIX} > ._top, ${PREFIX} > ._bottom {
            position: absolute;
            transform: translateX(-50%);
        }

        ${PREFIX} > ._bottom {
            top: ${values.get('progressBarHeightWithoutText')};
        }

        ${PREFIX} > ._top {
            bottom: ${values.get('progressBarHeightWithoutText')};
        }

        ${PREFIX}._circular, ${PREFIX} ._circular_progress {
            width: 100%;
            height: 100%;
            
        }

        ${PREFIX} ._circular_progress {
            transform: rotate(-90deg);
        }

        ${PREFIX} ._circular_progress_indicator, ${PREFIX} ._circular_track, ${PREFIX} ._circular_progres_text_bg {
            cx: 50px;
            cy: 50px;
            fill: transparent;
        }

        ${PREFIX} ._circular_label {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            z-index: 9;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        ${PREFIX}._circular_text_background_outline ._circular_label, ${PREFIX}._circular_text_background ._circular_label {
            border-radius: 50%;
        }

        ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="ProgressBarCss">{css}</style>;
}
