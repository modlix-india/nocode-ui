import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './particleFieldStyleProperties';

const PREFIX = '.comp.compParticleField';

export default function ParticleFieldStyle({
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

	return <style id="ParticleFieldCss">{css}</style>;
}
