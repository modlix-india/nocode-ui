import { sanitizeSvg } from './sanitizeSvg';

describe('sanitizeSvg', () => {
	it('returns empty string for empty / non-string input', () => {
		expect(sanitizeSvg('')).toBe('');
		// @ts-expect-error testing runtime guard
		expect(sanitizeSvg(undefined)).toBe('');
		// @ts-expect-error testing runtime guard
		expect(sanitizeSvg(null)).toBe('');
	});

	it('returns empty string when the root element is not <svg>', () => {
		expect(sanitizeSvg('<div>hello</div>')).toBe('');
		expect(sanitizeSvg('<script>alert(1)</script>')).toBe('');
	});

	it('returns empty string for malformed markup', () => {
		expect(sanitizeSvg('<svg><rect></svg>')).toBe('');
	});

	it('keeps benign shapes and their attributes', () => {
		const out = sanitizeSvg(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect x="1" y="1" width="8" height="8" fill="red"/><circle cx="5" cy="5" r="2"/></svg>',
		);
		expect(out).toContain('<rect');
		expect(out).toContain('fill="red"');
		expect(out).toContain('<circle');
		expect(out).toContain('viewBox="0 0 10 10"');
	});

	it('strips <script> elements', () => {
		const out = sanitizeSvg(
			'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><rect/></svg>',
		);
		expect(out).not.toContain('<script');
		expect(out).not.toContain('alert(1)');
		expect(out).toContain('<rect');
	});

	it('strips <foreignObject> elements', () => {
		const out = sanitizeSvg(
			'<svg xmlns="http://www.w3.org/2000/svg"><foreignObject><body xmlns="http://www.w3.org/1999/xhtml">hi</body></foreignObject><rect/></svg>',
		);
		expect(out.toLowerCase()).not.toContain('foreignobject');
		expect(out).toContain('<rect');
	});

	it('strips inline event-handler attributes', () => {
		const out = sanitizeSvg(
			'<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><rect onclick="steal()"/></svg>',
		);
		expect(out).not.toContain('onload');
		expect(out).not.toContain('onclick');
		expect(out).toContain('<rect');
	});

	it('strips javascript: hrefs but keeps safe ones', () => {
		const out = sanitizeSvg(
			'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
				'<a href="javascript:alert(1)"><rect/></a>' +
				'<a xlink:href="https://example.com"><circle/></a>' +
				'</svg>',
		);
		expect(out).not.toContain('javascript:');
		expect(out).toContain('https://example.com');
	});

	it('strips obfuscated javascript: hrefs with embedded whitespace', () => {
		const out = sanitizeSvg(
			'<svg xmlns="http://www.w3.org/2000/svg"><a href="java\tscript:alert(1)"><rect/></a></svg>',
		);
		expect(out.toLowerCase()).not.toContain('javascript:');
		expect(out.toLowerCase()).not.toContain('java\tscript:');
	});

	it('preserves benign SMIL animations', () => {
		const out = sanitizeSvg(
			'<svg xmlns="http://www.w3.org/2000/svg"><rect>' +
				'<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="2s" repeatCount="indefinite"/>' +
				'<animate attributeName="opacity" values="0;1;0" dur="1s"/>' +
				'</rect></svg>',
		);
		expect(out).toContain('animateTransform');
		expect(out).toContain('attributeName="transform"');
		expect(out).toContain('<animate');
	});

	it('strips SMIL animations that target href or event handlers', () => {
		const out = sanitizeSvg(
			'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
				'<a><rect/>' +
				'<set attributeName="href" to="javascript:alert(1)"/>' +
				'<animate attributeName="xlink:href" values="javascript:alert(2)" dur="1s"/>' +
				'<set attributeName="onclick" to="alert(3)"/>' +
				'</a></svg>',
		);
		expect(out).not.toContain('<set');
		expect(out).not.toContain('javascript:');
		expect(out).not.toContain('onclick');
		expect(out).toContain('<rect');
	});

	it('preserves an embedded <style> block (for CSS keyframe animations)', () => {
		const out = sanitizeSvg(
			'<svg xmlns="http://www.w3.org/2000/svg"><style>@keyframes spin{to{transform:rotate(360deg)}}</style><rect style="animation: spin 2s linear infinite"/></svg>',
		);
		expect(out).toContain('<style');
		expect(out).toContain('@keyframes');
		expect(out).toContain('animation:');
	});
});
