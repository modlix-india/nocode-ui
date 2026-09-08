import { StyleResolution } from '../../types/common';
import React from 'react';
import { processStyleDefinition, processStyleValueWithFunction } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './imageStyleProperties';

const PREFIX = '.comp.compImage';

export default function ImageStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	// Theme value for this component's own chrome, falling back to the literal it
	// replaced. The fallback is what makes this safe on a theme that predates the
	// variable: an absent value renders exactly as the hardcoded CSS did. Resolved
	// through processStyleValueWithFunction so a theme value that is itself a
	// `<var>` reference still resolves.
	const all = theme.get(StyleResolution.ALL) ?? new Map<string, string>();
	const t = (variable: string, fallback: string) =>
		all.get(variable) ? processStyleValueWithFunction(`<${variable}>`, all) : fallback;

	const css =
		`
        ${PREFIX} ._onclicktrue {
            cursor: pointer;
        }

        ${PREFIX} img {
            width: inherit;
            height: inherit;
            opacity: 1;
            transition: opacity 0.3s;
        }

        ${PREFIX} object {
            width: inherit;
            height: inherit;
        }

        ${PREFIX} ._zoomPreview {
            position: absolute;
            border: 2px solid ${t('borderColorTen', '#ccc')};
            overflow: hidden;
            z-index: 10;
            display: none;
            background-repeat: no-repeat;
        }

        ${PREFIX} ._zoomPreview.visible {
            display: block;
        }

        ${PREFIX} ._magnifier {
            position: absolute;
            border-radius: 50%;
            background-repeat: no-repeat;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 10;
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5), 0 0 5px rgba(0, 0, 0, 0.2);
        }

        ${PREFIX} ._comparisonContainer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 1;
        }

        ${PREFIX} ._comparisonOverlay {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            overflow: hidden;
            z-index: 2;
        }

        ${PREFIX} ._comparisonSlider {
            position: absolute;
            top: 0;
            height: 100%;
            width: 4px;
            background: ${t('colorSeven', '#fff')};
            cursor: ew-resize;
            transform: translateX(-50%);
            z-index: 3;
        }

        ${PREFIX} ._comparisonSlider:hover {
            background: #007bff;
        }

        ${PREFIX} ._comparisonSlider-icon {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 30px;
            height: 30px;
            background: ${t('colorSeven', '#fff')};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
        }

        ${PREFIX} ._comparisonSlider-icon.custom {
            background: transparent;
            box-shadow: none;
        }

        ${PREFIX} ._preview-right {
            top: 0;
            left: auto;
            right: 0;
            bottom: auto;
        }

        ${PREFIX} ._preview-left {
            top: 0;
            left: 0;
            right: auto;
            bottom: auto;
        }

        ${PREFIX} ._preview-top {
            top: 0;
            left: 0;
            right: auto;
            bottom: auto;
            width: 100%;
        }

        ${PREFIX} ._preview-bottom {
            top: auto;
            left: 0;
            right: auto;
            bottom: 0;
            width: 100%;
        }
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="ImageCss">{css}</style>;
}
