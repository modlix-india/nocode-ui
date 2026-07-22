// Parses arbitrary template HTML into the visual editor's flat block list.
//
// It descends layout containers (tables, divs, sections...) to reach the real content, maps
// recognised elements to blocks (heading / text / list / image / button / link / divider), and
// keeps anything it can't model as a Raw HTML block so no content is ever lost. This is lossy by
// design: bespoke table/CSS layout is simplified into the block editor's email shell — the content
// is retained and becomes visually editable, the exact original styling is not guaranteed.

import { shortUUID } from '../../../util/shortUUID';
import { Block, BlockType } from './blockTypes';

// Wrapper elements we look THROUGH to find content.
const CONTAINER_TAGS = new Set([
	'html', 'body', 'center', 'div', 'section', 'article', 'header', 'footer', 'main', 'figure',
	'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
]);

// Tags whose presence means a container has genuine block structure worth descending into (rather
// than being an inline-only wrapper we should keep as a single block).
const BLOCK_LEVEL_TAGS = new Set([
	'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'hr', 'img',
	'table', 'div', 'section', 'article', 'header', 'footer', 'blockquote', 'figure', 'center',
]);

const HEADING_LEVELS = new Set(['h1', 'h2', 'h3', 'h4']);

function mk(type: BlockType, props: Record<string, any>): Block {
	return { id: shortUUID(), type, props };
}

function styleStr(el: Element, prop: string): string | undefined {
	const v = (el as HTMLElement).style?.[prop as any];
	return v ? String(v) : undefined;
}

function styleNum(el: Element, prop: string): number | undefined {
	const v = (el as HTMLElement).style?.[prop as any];
	if (!v) return undefined;
	const n = parseFloat(String(v));
	return Number.isFinite(n) ? n : undefined;
}

function pxAttrOrStyle(el: Element, attr: string, prop: string, fallback: number): number {
	const a = el.getAttribute(attr);
	if (a) {
		const n = parseInt(a, 10);
		if (Number.isFinite(n) && `${n}` === a.replace('px', '').trim()) return n;
	}
	return styleNum(el, prop) ?? fallback;
}

function tagOf(el: Element): string {
	return el.tagName.toLowerCase();
}

function imageBlock(img: Element, href: string): Block {
	return mk('image', {
		src: img.getAttribute('src') ?? '',
		alt: img.getAttribute('alt') ?? '',
		width: pxAttrOrStyle(img, 'width', 'width', 600),
		align: 'center',
		href,
	});
}

function anchorBlock(a: Element): Block {
	const img = a.querySelector('img');
	if (img && !(a.textContent ?? '').trim()) return imageBlock(img, a.getAttribute('href') ?? '');

	const bg = styleStr(a, 'backgroundColor') ?? styleStr(a, 'background');
	const looksButton = !!bg && !!(styleStr(a, 'display') === 'inline-block' || styleStr(a, 'padding') || styleStr(a, 'paddingTop'));
	if (looksButton) {
		return mk('button', {
			label: (a.textContent ?? '').trim() || 'Button',
			href: a.getAttribute('href') ?? '',
			align: 'left',
			bg: styleStr(a, 'backgroundColor') ?? '#3b82f6',
			color: styleStr(a, 'color') ?? '#ffffff',
			radius: styleNum(a, 'borderRadius') ?? 6,
			paddingV: 12,
			paddingH: 24,
		});
	}
	return mk('link', {
		label: (a.textContent ?? '').trim(),
		href: a.getAttribute('href') ?? '',
		align: 'left',
		color: styleStr(a, 'color') ?? '#1893e9',
		fontSize: styleNum(a, 'fontSize') ?? 14,
		underline: styleStr(a, 'textDecoration')?.includes('none') ? 'false' : 'true',
	});
}

// A direct element -> block(s). Returns null when `el` is not a leaf (caller then descends/falls back).
// Returns [] to intentionally drop an element (e.g. <br>) whose content is captured elsewhere.
function leafBlockFor(el: Element): Block[] | null {
	const tag = tagOf(el);
	if (/^h[1-6]$/.test(tag)) {
		return [
			mk('heading', {
				text: (el.textContent ?? '').trim(),
				level: HEADING_LEVELS.has(tag) ? tag : 'h4',
				align: styleStr(el, 'textAlign') ?? 'left',
				color: styleStr(el, 'color') ?? '#111111',
				fontSize: styleNum(el, 'fontSize') ?? 24,
			}),
		];
	}
	if (tag === 'p') {
		const html = (el as HTMLElement).innerHTML.trim();
		if (!html) return [];
		return [
			mk('text', {
				html,
				align: styleStr(el, 'textAlign') ?? 'left',
				color: styleStr(el, 'color') ?? '#333333',
				fontSize: styleNum(el, 'fontSize') ?? 14,
			}),
		];
	}
	if (tag === 'ul' || tag === 'ol') {
		const items = Array.from(el.querySelectorAll(':scope > li'))
			.map(li => (li as HTMLElement).innerHTML.trim())
			.filter(Boolean)
			.join('\n');
		return [mk('list', { items, ordered: tag === 'ol' ? 'true' : 'false', align: 'left', color: '#333333', fontSize: 14 })];
	}
	if (tag === 'hr') return [mk('divider', { color: '#e0e0e0', thickness: 1, spacing: 16 })];
	if (tag === 'img') return [imageBlock(el, '')];
	if (tag === 'a') return [anchorBlock(el)];
	if (tag === 'br') return [];
	return null;
}

// True if the container has real block-level structure (so we descend) vs being inline-only.
function hasBlockStructure(el: Element): boolean {
	for (const child of Array.from(el.children)) {
		const tag = tagOf(child);
		if (BLOCK_LEVEL_TAGS.has(tag)) return true;
		if (CONTAINER_TAGS.has(tag) && hasBlockStructure(child)) return true;
	}
	return false;
}

// An inline-only container becomes a single block: text (when it reads as prose) or raw HTML
// (when it's purely images/links, so their inline layout is preserved).
function inlineBlock(el: Element): Block | null {
	const inner = (el as HTMLElement).innerHTML.trim();
	if (!inner) return null;
	if ((el.textContent ?? '').trim()) {
		return mk('text', {
			html: inner,
			align: styleStr(el, 'textAlign') ?? 'left',
			color: styleStr(el, 'color') ?? '#333333',
			fontSize: styleNum(el, 'fontSize') ?? 14,
		});
	}
	return mk('html', { html: inner });
}

function escapeText(text: string): string {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function walkChildren(el: Element, out: Block[]): void {
	el.childNodes.forEach(node => {
		if (node.nodeType === 3) {
			const txt = (node.textContent ?? '').trim();
			if (txt) out.push(mk('text', { html: escapeText(txt), align: 'left', color: '#333333', fontSize: 14 }));
			return;
		}
		if (node.nodeType === 1) walk(node as Element, out);
	});
}

function walk(el: Element, out: Block[]): void {
	const leaf = leafBlockFor(el);
	if (leaf) {
		out.push(...leaf);
		return;
	}
	if (CONTAINER_TAGS.has(tagOf(el))) {
		if (hasBlockStructure(el)) walkChildren(el, out);
		else {
			const b = inlineBlock(el);
			if (b) out.push(b);
		}
		return;
	}
	// Anything unrecognised (custom tags, <style>, complex widgets) is kept verbatim.
	out.push(mk('html', { html: el.outerHTML }));
}

// Parse a template part's HTML into a flat block list. Never throws; returns a single Raw HTML block
// if parsing yields nothing mappable, so the caller always gets an editable representation.
export function htmlToBlocks(html: string): Block[] {
	if (!html || !html.trim()) return [];
	let root: Element | null = null;
	try {
		const doc = new DOMParser().parseFromString(html, 'text/html');
		root = doc.body ?? doc.documentElement;
	} catch {
		return [mk('html', { html })];
	}
	if (!root) return [mk('html', { html })];
	const out: Block[] = [];
	walkChildren(root, out);
	return out.length > 0 ? out : [mk('html', { html })];
}
