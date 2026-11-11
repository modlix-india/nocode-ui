/**
 * AudioStyle waveform rules: themed per colour scheme, and every one scoped to `._waveform`
 * under `._audioDesign5`, so designs 1 to 4 get no new rule. REAL: AudioStyle and the style
 * processor; the lazily loaded Audio.json is not fetched here.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StyleResolution } from '../../../types/common';

(globalThis as any).styleProperties = {};

import AudioStyle from '../AudioStyle';
import { styleDefaults, styleProperties, stylePropertiesForTheme } from '../audioStyleProperties';

describe('AudioStyle waveform rules', () => {
	const theme = new Map([
		[
			StyleResolution.ALL,
			new Map([
				['backgroundHoverColorFour', '#f3b4ae'],
				['backgroundDarkerColorFour', '#76170e'],
			]),
		],
	]);
	const css = renderToStaticMarkup(<AudioStyle theme={theme} />);

	it('colours the bars, the played part and the cursor from the colour scheme', () => {
		expect(css).toMatch(
			/\.comp\.compAudio\._audioDesign5\._quaternary \._waveform \._waveformBar\s*\{[^}]*background-color: #f3b4ae;/,
		);
		expect(css).toMatch(
			/\.comp\.compAudio\._audioDesign5\._quaternary \._waveform \._waveformBar\._played\s*\{[^}]*background-color: #76170e;/,
		);
		expect(css).toMatch(
			/\.comp\.compAudio\._audioDesign5\._quaternary \._waveform \._waveformCursor\s*\{[^}]*background-color: #76170e;/,
		);
	});

	it('sizes the bars and the waveform from theme defaults', () => {
		expect(css).toMatch(
			/\.comp\.compAudio\._audioDesign5 \._waveform\s*\{[^}]*--audio-waveform-bar-width: 3px;[^}]*--audio-waveform-bar-gap: 2px;[^}]*height: 40px;/,
		);
	});

	it('adds no rule outside the waveform', () => {
		const added = css
			.split('}')
			.filter(r => /_waveform|_audioDesign5/.test(r.substring(0, r.indexOf('{'))));
		expect(added.length).toBeGreaterThan(0);
		css.split('}')
			.map(r => r.substring(0, r.indexOf('{')))
			.filter(sel => /_audioDesign5/.test(sel))
			.forEach(sel => expect(sel).toContain('._waveform'));
	});

	it('leaves the lazily loaded lists empty so Audio.json still loads', () => {
		expect(styleProperties.length).toBe(0);
		expect(styleDefaults.size).toBe(0);
		expect(stylePropertiesForTheme.map(e => e.n)).toContain(
			'audioWaveformPlayedColor<colorScheme>',
		);
	});
});
