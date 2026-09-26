import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './shaderBackgroundStyleProperties';

const PREFIX = '.comp.compShaderBackground';

export default function ShaderBackgroundStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`
	${PREFIX} {
		position: relative;
		overflow: hidden;
		display: block;
		width: 100%;
	}

	/* The canvas and the poster are both absolutely positioned so that whichever
	   one is showing fills the same box, and children stack above them. */
	${PREFIX} ._canvasHolder,
	${PREFIX} ._poster,
	${PREFIX} ._overlay {
		position: absolute;
		inset: 0;
	}

	${PREFIX} ._canvasHolder > canvas {
		display: block;
		width: 100%;
		height: 100%;
	}

	${PREFIX} ._poster {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* Above the canvas, below anything dropped inside the component. */
	${PREFIX} ._overlay {
		pointer-events: none;
	}

	${PREFIX} ._content {
		position: relative;
		width: 100%;
		height: 100%;
	}

	/* A scene that has not drawn yet must not flash white against a dark page,
	   so the holder starts transparent and is revealed on ready. */
	${PREFIX} ._canvasHolder {
		opacity: 0;
		transition: opacity 240ms ease;
	}

	${PREFIX}._ready ._canvasHolder {
		opacity: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		${PREFIX} ._canvasHolder {
			transition: none;
		}
	}
` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="ShaderBackgroundCss">{css}</style>;
}
