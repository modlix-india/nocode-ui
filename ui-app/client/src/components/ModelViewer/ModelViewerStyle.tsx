import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './modelViewerStyleProperties';

const PREFIX = '.comp.compModelViewer';

export default function ModelViewerStyle({
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
		/* A drag to orbit otherwise selects the surrounding page text and
		   leaves a blue smear across the section while the model turns. */
		user-select: none;
		touch-action: none;
	}

	${PREFIX}._orbitable ._canvasHolder > canvas {
		cursor: grab;
	}

	${PREFIX}._orbitable ._canvasHolder > canvas:active {
		cursor: grabbing;
	}

	${PREFIX} ._poster {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	${PREFIX} ._overlay {
		pointer-events: none;
	}

	${PREFIX} ._content {
		position: relative;
		width: 100%;
		height: 100%;
	}

	/* Revealed on ready, so an undrawn canvas does not flash against the page. */
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

	return <style id="ModelViewerCss">{css}</style>;
}
