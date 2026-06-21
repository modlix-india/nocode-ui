import {
	addCssAnim,
	addShape,
	addSmil,
	buildTree,
	clearCssAnim,
	deleteElement,
	ensureEditIds,
	EDIT_ID_ATTR,
	finalize,
	getElementDetails,
	removeSmil,
	setAttr,
	setStyleProp,
	setText,
} from './svgDocument';

const BASE =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect id="r" x="1" y="1" width="8" height="8"/><circle cx="5" cy="5" r="2"/></svg>';

describe('svgDocument', () => {
	it('stamps edit ids on every element (idempotently)', () => {
		const once = ensureEditIds(BASE);
		expect((once.match(new RegExp(EDIT_ID_ATTR, 'g')) ?? []).length).toBe(3);
		const twice = ensureEditIds(once);
		expect((twice.match(new RegExp(EDIT_ID_ATTR, 'g')) ?? []).length).toBe(3);
	});

	it('builds a tree from the markup', () => {
		const tree = buildTree(ensureEditIds(BASE));
		expect(tree?.tag).toBe('svg');
		expect(tree?.children.map(c => c.tag)).toEqual(['rect', 'circle']);
		expect(tree?.children[0].label).toBe('rect#r');
	});

	it('reads and edits attributes of a selected element', () => {
		const m = ensureEditIds(BASE);
		const rectId = buildTree(m)!.children[0].editId;
		const next = setAttr(m, rectId, 'fill', '#ff0000');
		const details = getElementDetails(next, rectId)!;
		expect(details.attrs.find(a => a.name === 'fill')?.value).toBe('#ff0000');
		// empty value removes the attribute
		const removed = setAttr(next, rectId, 'fill', '');
		expect(
			getElementDetails(removed, rectId)!.attrs.find(a => a.name === 'fill'),
		).toBeUndefined();
	});

	it('sets text content', () => {
		const m = ensureEditIds(
			'<svg xmlns="http://www.w3.org/2000/svg"><text x="0" y="0">a</text></svg>',
		);
		const id = buildTree(m)!.children[0].editId;
		const next = setText(m, id, 'hello');
		expect(getElementDetails(next, id)!.text).toBe('hello');
	});

	it('adds a new shape and returns its edit id', () => {
		const m = ensureEditIds(BASE);
		const { markup, newEditId } = addShape(m, undefined, 'circle');
		expect(newEditId).toBeTruthy();
		expect(markup).toContain(newEditId);
		expect(buildTree(markup)!.children.map(c => c.tag)).toContain('circle');
	});

	it('appends a SMIL animation to an element', () => {
		const m = ensureEditIds(BASE);
		const rectId = buildTree(m)!.children[0].editId;
		const next = addSmil(m, rectId, {
			kind: 'animateTransform',
			attributeName: 'transform',
			type: 'rotate',
			from: '0',
			to: '360',
			dur: '2s',
			repeatCount: 'indefinite',
		});
		expect(next).toContain('animateTransform');
		expect(next).toContain('type="rotate"');
	});

	it('embeds a CSS keyframe animation in a <style> block', () => {
		const m = ensureEditIds(BASE);
		const rectId = buildTree(m)!.children[0].editId;
		const next = addCssAnim(m, rectId, {
			name: 'spin1',
			keyframes: 'from{transform:rotate(0)}to{transform:rotate(360deg)}',
			duration: '2s',
		});
		expect(next).toContain('<style');
		expect(next).toContain('@keyframes spin1');
		expect(
			getElementDetails(next, rectId)!.attrs.find(a => a.name === 'style')?.value,
		).toContain('animation: spin1');
	});

	it('deletes an element', () => {
		const m = ensureEditIds(BASE);
		const circleId = buildTree(m)!.children[1].editId;
		const next = deleteElement(m, circleId);
		expect(buildTree(next)!.children.map(c => c.tag)).toEqual(['rect']);
	});

	it('sets and removes inline style props (overriding class CSS)', () => {
		const m = ensureEditIds(BASE);
		const rectId = buildTree(m)!.children[0].editId;
		const styled = setStyleProp(m, rectId, 'fill', 'red');
		expect(getElementDetails(styled, rectId)!.styles.fill).toBe('red');
		// empty value removes the prop; clearing the last prop drops the style attr
		const cleared = setStyleProp(styled, rectId, 'fill', '');
		expect(getElementDetails(cleared, rectId)!.styles.fill).toBeUndefined();
		expect(
			getElementDetails(cleared, rectId)!.attrs.find(a => a.name === 'style'),
		).toBeUndefined();
	});

	it('summarizes css + smil animations and removes them', () => {
		let m = ensureEditIds(BASE);
		const rectId = buildTree(m)!.children[0].editId;
		m = addSmil(m, rectId, {
			kind: 'animate',
			attributeName: 'opacity',
			values: '0;1',
			dur: '1s',
		});
		m = addCssAnim(m, rectId, { name: 'spinx', keyframes: 'from{}to{}', duration: '2s' });
		const details = getElementDetails(m, rectId)!;
		expect(details.animations.css.length).toBe(1);
		expect(details.animations.smil.length).toBe(1);
		expect(details.animations.smil[0].attr).toBe('opacity');

		const noCss = clearCssAnim(m, rectId);
		expect(getElementDetails(noCss, rectId)!.animations.css.length).toBe(0);

		const smilId = details.animations.smil[0].editId;
		const noSmil = removeSmil(m, smilId);
		expect(getElementDetails(noSmil, rectId)!.animations.smil.length).toBe(0);
	});

	it('finalize strips edit ids and sanitizes', () => {
		const m = ensureEditIds(
			'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><rect/></svg>',
		);
		const out = finalize(m);
		expect(out).not.toContain(EDIT_ID_ATTR);
		expect(out).not.toContain('<script');
		expect(out).toContain('<rect');
	});
});
