// Pure DOM helpers for the embedded SVG editor.
//
// The editor keeps the working SVG as a STRING (so undo/redo is just string
// snapshots). Every mutation parses the string, mutates the DOM, and
// re-serializes. A temporary `data-svgedit-id` attribute on every element gives
// a stable mapping between the live preview, the element tree, and the
// working document. It is stripped on `finalize()` before persisting.

import { shortUUID } from '../../../../util/shortUUID';
import { sanitizeSvg } from '../../../Svg/sanitizeSvg';
import { CssAnimSpec, ElementDetails, ShapeKind, SmilSpec, SvgNode } from './common';

const SVG_NS = 'http://www.w3.org/2000/svg';
export const EDIT_ID_ATTR = 'data-svgedit-id';

function parse(markup: string): SVGElement | null {
	if (!markup) return null;
	let doc: Document;
	try {
		doc = new DOMParser().parseFromString(markup, 'image/svg+xml');
	} catch {
		return null;
	}
	if (doc.getElementsByTagName('parsererror').length > 0) return null;
	const root = doc.documentElement;
	if (root?.tagName.toLowerCase() !== 'svg') return null;
	return root as unknown as SVGElement;
}

function serializeWorking(root: Element): string {
	return new XMLSerializer().serializeToString(root);
}

function allElements(root: Element): Element[] {
	return [root, ...Array.from(root.querySelectorAll('*'))];
}

function findByEditId(root: Element, editId: string): Element | null {
	if (!editId) return null;
	for (const el of allElements(root)) {
		if (el.getAttribute(EDIT_ID_ATTR) === editId) return el;
	}
	return null;
}

// Runs a mutation against a parsed working string and returns the new working
// string (edit ids preserved). Returns the original string if parsing fails.
function withDoc(markup: string, fn: (root: Element) => void): string {
	const root = parse(markup);
	if (!root) return markup;
	fn(root);
	return serializeWorking(root);
}

// Assigns a `data-svgedit-id` to any element missing one (idempotent).
export function ensureEditIds(markup: string): string {
	return withDoc(markup, root => {
		for (const el of allElements(root)) {
			if (!el.getAttribute(EDIT_ID_ATTR)) el.setAttribute(EDIT_ID_ATTR, shortUUID());
		}
	});
}

function labelFor(el: Element): string {
	const tag = el.tagName;
	const id = el.getAttribute('id');
	const cls = el.getAttribute('class');
	let label = tag;
	if (id) label += `#${id}`;
	else if (cls) label += `.${cls.split(/\s+/)[0]}`;
	return label;
}

// Non-drawable elements kept out of the element tree. SMIL animations are
// managed in the inspector's Animation section; the others are metadata/defs.
const TREE_HIDDEN = new Set([
	'animate',
	'animatetransform',
	'animatemotion',
	'set',
	'mpath',
	'style',
	'title',
	'desc',
	'metadata',
]);

export function buildTree(markup: string): SvgNode | null {
	const root = parse(markup);
	if (!root) return null;

	const toNode = (el: Element): SvgNode => ({
		editId: el.getAttribute(EDIT_ID_ATTR) ?? '',
		tag: el.tagName.toLowerCase(),
		label: labelFor(el),
		children: Array.from(el.children)
			.filter(c => !TREE_HIDDEN.has(c.tagName.toLowerCase()))
			.map(toNode),
	});

	return toNode(root);
}

const ANIM_TAGS = new Set(['animate', 'animatetransform', 'animatemotion', 'set']);

function parseStyle(style: string | null): Record<string, string> {
	const out: Record<string, string> = {};
	for (const decl of (style ?? '').split(';')) {
		const idx = decl.indexOf(':');
		if (idx === -1) continue;
		const prop = decl.slice(0, idx).trim();
		const value = decl.slice(idx + 1).trim();
		if (prop) out[prop] = value;
	}
	return out;
}

function serializeStyle(styles: Record<string, string>): string {
	return Object.entries(styles)
		.map(([k, v]) => `${k}: ${v}`)
		.join('; ');
}

function animatedTargetName(el: Element): string {
	for (const attr of Array.from(el.attributes)) {
		if (attr.name.toLowerCase() === 'attributename') return attr.value;
	}
	return '';
}

export function getElementDetails(markup: string, editId: string): ElementDetails | null {
	const root = parse(markup);
	if (!root) return null;
	const el = findByEditId(root, editId);
	if (!el) return null;

	const attrs = Array.from(el.attributes)
		.filter(a => a.name !== EDIT_ID_ATTR)
		.map(a => ({ name: a.name, value: a.value }));

	const styles = parseStyle(el.getAttribute('style'));

	// Text is editable only for leaf elements (setting textContent would clobber
	// a container's element children).
	const tag = el.tagName.toLowerCase();
	const isLeaf = el.children.length === 0;
	const hasText =
		isLeaf &&
		(['text', 'tspan', 'textpath'].includes(tag) || (el.textContent ?? '').trim() !== '');

	const css = styles.animation ? styles.animation.split(',').map(s => s.trim()) : [];
	const smil = Array.from(el.children)
		.filter(c => ANIM_TAGS.has(c.tagName.toLowerCase()))
		.map(c => {
			const childAttrs: Record<string, string> = {};
			for (const a of Array.from(c.attributes)) {
				if (a.name !== EDIT_ID_ATTR) childAttrs[a.name] = a.value;
			}
			return {
				editId: c.getAttribute(EDIT_ID_ATTR) ?? '',
				tag: c.tagName.toLowerCase(),
				attr: animatedTargetName(c),
				attrs: childAttrs,
			};
		});

	return { tag, attrs, styles, text: el.textContent ?? '', hasText, animations: { css, smil } };
}

// Merges (or removes, when value is empty) a single declaration in the
// element's inline style. Inline style overrides class CSS, so this is the
// reliable way to make paint/text edits actually take.
export function setStyleProp(markup: string, editId: string, prop: string, value: string): string {
	return withDoc(markup, root => {
		const el = findByEditId(root, editId);
		if (!el || !prop) return;
		const styles = parseStyle(el.getAttribute('style'));
		if (value === '') delete styles[prop];
		else styles[prop] = value;
		const serialized = serializeStyle(styles);
		if (serialized) el.setAttribute('style', serialized);
		else el.removeAttribute('style');
	});
}

// Removes a SMIL animation child by its edit id.
export function removeSmil(markup: string, animEditId: string): string {
	return withDoc(markup, root => {
		const el = findByEditId(root, animEditId);
		if (el && ANIM_TAGS.has(el.tagName.toLowerCase())) el.remove();
	});
}

// Clears the CSS `animation` declaration from an element's inline style.
export function clearCssAnim(markup: string, editId: string): string {
	return setStyleProp(markup, editId, 'animation', '');
}

export function setAttr(markup: string, editId: string, name: string, value: string): string {
	return withDoc(markup, root => {
		const el = findByEditId(root, editId);
		if (!el || !name) return;
		if (value === '') el.removeAttribute(name);
		else el.setAttribute(name, value);
	});
}

export function renameAttr(
	markup: string,
	editId: string,
	oldName: string,
	newName: string,
): string {
	return withDoc(markup, root => {
		const el = findByEditId(root, editId);
		if (!el || !newName || oldName === newName) return;
		const value = el.getAttribute(oldName) ?? '';
		el.removeAttribute(oldName);
		el.setAttribute(newName, value);
	});
}

export function removeAttr(markup: string, editId: string, name: string): string {
	return withDoc(markup, root => findByEditId(root, editId)?.removeAttribute(name));
}

export function setText(markup: string, editId: string, text: string): string {
	return withDoc(markup, root => {
		const el = findByEditId(root, editId);
		if (el) el.textContent = text;
	});
}

export function deleteElement(markup: string, editId: string): string {
	return withDoc(markup, root => {
		const el = findByEditId(root, editId);
		if (el && el !== root) el.remove();
	});
}

const SHAPE_DEFAULTS: Record<ShapeKind, Record<string, string>> = {
	rect: { x: '20', y: '20', width: '80', height: '60', fill: '#3b82f6' },
	circle: { cx: '60', cy: '60', r: '40', fill: '#3b82f6' },
	ellipse: { cx: '60', cy: '50', rx: '50', ry: '35', fill: '#3b82f6' },
	line: { x1: '10', y1: '10', x2: '100', y2: '100', stroke: '#111111', 'stroke-width': '2' },
	path: {
		d: 'M10 80 C 40 10, 65 10, 95 80',
		fill: 'none',
		stroke: '#111111',
		'stroke-width': '2',
	},
	text: { x: '20', y: '50', fill: '#111111', 'font-size': '16' },
};

// Adds a new shape under the element with `parentEditId` (or the root) and
// returns the new working markup plus the new element's edit id.
export function addShape(
	markup: string,
	parentEditId: string | undefined,
	kind: ShapeKind,
): { markup: string; newEditId: string } {
	const root = parse(markup);
	if (!root) return { markup, newEditId: '' };

	const newEditId = shortUUID();
	const el = root.ownerDocument.createElementNS(SVG_NS, kind);
	for (const [k, v] of Object.entries(SHAPE_DEFAULTS[kind])) el.setAttribute(k, v);
	el.setAttribute(EDIT_ID_ATTR, newEditId);
	if (kind === 'text') el.textContent = 'Text';

	const parent = (parentEditId ? findByEditId(root, parentEditId) : root) ?? root;
	// Only containers can hold children; fall back to root otherwise.
	const container = parent.tagName.toLowerCase() === 'g' || parent === root ? parent : root;
	container.appendChild(el);

	return { markup: serializeWorking(root), newEditId };
}

export function addSmil(markup: string, editId: string, spec: SmilSpec): string {
	return withDoc(markup, root => {
		const el = findByEditId(root, editId);
		if (!el) return;
		const anim = root.ownerDocument.createElementNS(SVG_NS, spec.kind);
		const set = (k: string, v?: string) => {
			if (v) anim.setAttribute(k, v);
		};
		set('attributeName', spec.attributeName);
		set('type', spec.type);
		set('from', spec.from);
		set('to', spec.to);
		set('values', spec.values);
		set('dur', spec.dur);
		set('begin', spec.begin);
		set('repeatCount', spec.repeatCount);
		if (spec.kind === 'animateMotion') set('path', spec.path);
		anim.setAttribute(EDIT_ID_ATTR, shortUUID());
		el.appendChild(anim);
	});
}

function ensureStyleEl(root: Element): Element {
	let style: Element | null = root.querySelector('style');
	if (!style) {
		style = root.ownerDocument.createElementNS(SVG_NS, 'style');
		root.insertBefore(style, root.firstChild);
	}
	return style;
}

export function addCssAnim(markup: string, editId: string, spec: CssAnimSpec): string {
	return withDoc(markup, root => {
		const el = findByEditId(root, editId);
		if (!el) return;

		const style = ensureStyleEl(root);
		style.textContent =
			(style.textContent ?? '') + `\n@keyframes ${spec.name} { ${spec.keyframes} }`;

		const shorthand = [
			spec.name,
			spec.duration,
			spec.timingFunction ?? 'linear',
			spec.delay ?? '0s',
			spec.iterationCount ?? '1',
			spec.direction ?? 'normal',
			spec.fillMode ?? 'none',
		].join(' ');

		// Compose with any existing animation (comma-separated) instead of
		// emitting a duplicate `animation` declaration that would override it.
		const styles = parseStyle(el.getAttribute('style'));
		styles.animation = styles.animation ? `${styles.animation}, ${shorthand}` : shorthand;
		if (spec.originCenter) {
			styles['transform-box'] = 'fill-box';
			styles['transform-origin'] = 'center';
		}
		el.setAttribute('style', serializeStyle(styles));
	});
}

// Final markup for persistence: strip edit ids, then sanitize (defense in depth).
export function finalize(markup: string): string {
	const root = parse(markup);
	if (!root) return '';
	for (const el of allElements(root)) el.removeAttribute(EDIT_ID_ATTR);
	return sanitizeSvg(serializeWorking(root));
}
