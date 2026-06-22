// A small, dependency-free sanitizer for inline SVG markup.
//
// It strips the tags and attributes that make inline SVG an XSS vector
// (scripts, foreign HTML, event handlers, javascript: URLs) while leaving the
// drawable content intact. Runs in the browser only (uses DOMParser /
// XMLSerializer), which is fine because components render client-side.

// Tags that can execute script or smuggle arbitrary HTML into the document.
const DENIED_TAGS = new Set([
	'script',
	'foreignobject',
	'iframe',
	'object',
	'embed',
	'link',
	'meta',
]);

// SMIL animation elements are kept (they let embedded animations travel inside
// the markup), but an animation that targets a link or an event handler is an
// XSS vector (e.g. animating href into "javascript:..."), so those are dropped.
const ANIMATION_TAGS = new Set(['animate', 'animatetransform', 'animatemotion', 'set']);
const ANIMATABLE_DENY = new Set(['href', 'xlink:href']);

// URL schemes that must never appear in href / xlink:href.
const DANGEROUS_HREF = ['javascript:', 'data:text/html'];

// Reads an element's `attributeName` value case-insensitively (SVG attribute
// names are case-sensitive, so we scan rather than rely on getAttribute).
function getAnimatedTarget(el: Element): string {
	for (const attr of Array.from(el.attributes)) {
		if (attr.name.toLowerCase() === 'attributename') return attr.value.trim().toLowerCase();
	}
	return '';
}

function isDangerousHref(value: string): boolean {
	// Strip whitespace and control chars (U+0000-U+0020) that browsers ignore
	// inside a scheme, so "java\tscript:" can't slip past the check.
	const collapsed = value.replace(/[\u0000-\u0020]/g, '').toLowerCase();
	return DANGEROUS_HREF.some(scheme => collapsed.startsWith(scheme));
}

// Returns true if the element was removed from the tree.
function sanitizeElement(el: Element): boolean {
	const tag = el.tagName.toLowerCase();

	if (DENIED_TAGS.has(tag)) {
		el.remove();
		return true;
	}

	// Drop SMIL animations that target a link or an event-handler attribute.
	if (ANIMATION_TAGS.has(tag)) {
		const target = getAnimatedTarget(el);
		if (ANIMATABLE_DENY.has(target) || target.startsWith('on')) {
			el.remove();
			return true;
		}
	}

	for (const attr of Array.from(el.attributes)) {
		const name = attr.name.toLowerCase();

		// Strip inline event handlers (onload/onclick/...) and links carrying
		// executable / html-smuggling schemes.
		if (
			name.startsWith('on') ||
			((name === 'href' || name === 'xlink:href') && isDangerousHref(attr.value))
		) {
			el.removeAttribute(attr.name);
		}
	}

	return false;
}

export function sanitizeSvg(markup: string): string {
	if (!markup || typeof markup !== 'string') return '';

	let doc: Document;
	try {
		doc = new DOMParser().parseFromString(markup, 'image/svg+xml');
	} catch {
		return '';
	}

	// Malformed markup produces a <parsererror> node instead of throwing.
	if (doc.getElementsByTagName('parsererror').length > 0) return '';

	const root = doc.documentElement;
	if (root?.tagName.toLowerCase() !== 'svg') return '';

	// Snapshot the list because we mutate the tree while iterating.
	for (const el of [root, ...Array.from(root.querySelectorAll('*'))]) {
		sanitizeElement(el);
	}

	return new XMLSerializer().serializeToString(root);
}
