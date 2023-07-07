import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './progressBarStyleProperties';

const PREFIX = '.comp.compProgressBar';
export default function ProgressBarStyles({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
        ${PREFIX} ._progressBar {
            width: 100%;
            position: relative;
            display: inline-block;
            overflow: hidden;
        }

        ${PREFIX} ._progressBar ._currentProgress {
            position: relative;
            display: inline-block;
            height: 100%;
            width: 0px;
            transition: width .5s ease;
        }

        ${PREFIX} ._progressBar ._labelAndValueContainer {
            position: absolute;
            display: flex;
            align-items: center;
            z-index: 8;
        }
        ${PREFIX} ._progressBar ._labelAndValueContainer._Left {
            top: 50%;
            left: 16px;
            transform: translate(0,-50%);
        }
        ${PREFIX} ._progressBar ._labelAndValueContainer._Center {
            top: 50%;
            left: 50%;
            transform: translate(-50%,-50%);
        }
        ${PREFIX} ._progressBar ._labelAndValueContainer._Right {
            top: 50%;
            right: 16px;
            transform: translate(0,-50%);
        }
      
        ${PREFIX} ._progressBar ._labelAndValueContainer ._progressValue {
            position: relative;
            z-index: 8;
        }
        ${PREFIX} ._progressBar ._labelAndValueContainer ._progressLabel {
            position: relative;
            z-index: 8;
        }
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="ProgressBarCss">{css}</style>;
}
