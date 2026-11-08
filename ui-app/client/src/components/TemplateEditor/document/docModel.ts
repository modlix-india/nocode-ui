// Document mode: a template as a page of blocks (title band, sections, label and value lists, repeating
// tables, text with fields, numbered terms, signature boxes, page breaks, images, spacers, raw HTML).
//
// The model is only the editor's view of the template. What is saved and rendered is the FreeMarker
// HTML this module compiles it to (templateParts[lang].body), so Code mode, the server preview and the
// PDF renderer stay exactly as they are. The model is kept next to it (design.document[lang]) so the
// page opens the same way next time; a template written in Code is imported back into blocks, and what
// the importer does not recognise stays as an HTML block.

export type DocBlockType =
	| 'title'
	| 'heading'
	| 'fields'
	| 'table'
	| 'text'
	| 'terms'
	| 'signatures'
	| 'button'
	| 'pageBreak'
	| 'image'
	| 'spacer'
	| 'html';

export type ShowIfOp = 'filled' | 'empty' | 'is' | 'isNot' | 'yes' | 'no' | 'more';

// "Show only if": one field, one test. Written as <#if> around the block.
export interface ShowIf {
	field: string;
	op: ShowIfOp;
	value?: string;
	// A condition the importer could not read as one of the tests above, kept as written.
	raw?: string;
}

export interface FieldRow {
	label: string;
	// FreeMarker text, e.g. ${unit.facing!'-'}
	value: string;
}

export interface TableColumn {
	label: string;
	// FreeMarker text relative to the row, e.g. ${row.amount!'-'}
	value: string;
	width?: string;
}

export interface DocBlock {
	id: string;
	type: DocBlockType;
	props: any;
	showIf?: ShowIf;
}

export interface DocPage {
	size: 'A4' | 'Letter';
	// millimetres
	margin: { top: number; right: number; bottom: number; left: number };
	pageNumbers: boolean;
	header: DocBlock[];
	footer: DocBlock[];
	// The running header and footer boxes as the template wrote them (width, padding), kept on import.
	headerBox?: string;
	footerBox?: string;
	numberBox?: string;
}

export interface DocModel {
	version: 1;
	kind: 'pdf' | 'email';
	page: DocPage;
	blocks: DocBlock[];
	// The template's own CSS (classes its blocks use), kept as it was. The @page rule is written from
	// `page` instead.
	style: string;
}

let seq = 0;
export function newId(prefix = 'b'): string {
	seq += 1;
	return `${prefix}${Date.now().toString(36)}${seq.toString(36)}`;
}

export function block(type: DocBlockType, props: any = {}, showIf?: ShowIf): DocBlock {
	return { id: newId(), type, props, ...(showIf ? { showIf } : {}) };
}

// ---------------------------------------------------------------------------------------------
// Default look for documents made in Document mode: the CXZump booking form's own classes, so an
// imported template and a new one share them.
export const DOC_BASE_STYLE = `body{font-family:Helvetica,Arial,sans-serif;font-size:9.5pt;color:#111;margin:0}
.band{background:#efefef;margin-top:3mm;padding:2mm 4mm;font-size:12pt;font-weight:bold}
.sec{font-size:9pt;font-weight:bold;letter-spacing:.06em;text-transform:uppercase;margin:6mm 0 2.5mm;padding-bottom:1mm;border-bottom:1px solid #111;page-break-after:avoid}
.kv{display:block;padding:1.1mm 0;border-bottom:1px solid #e4e4e4;page-break-inside:avoid}
.kv .k{display:inline-block;width:38%;color:#555;vertical-align:top}
.kv .v{display:inline-block;width:60%;font-weight:bold;vertical-align:top}
.two{column-count:2;column-gap:10mm}
.rt{width:100%;border-collapse:collapse;margin:2mm 0}
.rt th,.rt td{border:1px solid #bbb;padding:1.5mm 2mm;text-align:left;vertical-align:top}
.rt th{background:#f2f2f2;font-weight:bold}
.sigs{margin-top:10mm}
.sigbox{display:inline-block;width:46%;margin:0 3% 6mm 0;vertical-align:top}
.sigarea{height:18mm;border-bottom:1px solid #111}
.sigcap{font-size:8.5pt;margin-top:1mm}
.muted{color:#666}`;

export const EMAIL_BASE_STYLE = `body{margin:0;background:#f4f4f5;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#111}
.wrap{max-width:600px;margin:0 auto;background:#fff;padding:24px}
.band{font-size:20px;font-weight:bold;margin:0 0 12px}
.sec{font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:.04em;margin:18px 0 8px;padding-bottom:4px;border-bottom:1px solid #ddd}
.kv{padding:4px 0;border-bottom:1px solid #eee}
.kv .k{display:inline-block;width:40%;color:#666}
.kv .v{display:inline-block;width:58%;font-weight:bold}
.rt{width:100%;border-collapse:collapse;margin:8px 0}
.rt th,.rt td{border:1px solid #ddd;padding:6px 8px;text-align:left}
.rt th{background:#f5f5f5}
.btn{display:inline-block;background:#111;color:#fff;text-decoration:none;padding:10px 18px;border-radius:6px}
.muted{color:#666}`;

export function emptyModel(kind: 'pdf' | 'email'): DocModel {
	return {
		version: 1,
		kind,
		page: {
			size: 'A4',
			margin: { top: 30, right: 14, bottom: 20, left: 14 },
			pageNumbers: kind === 'pdf',
			header: [],
			footer: [],
		},
		blocks: [],
		style: '',
	};
}

// ---------------------------------------------------------------------------------------------
// Conditions

export function showIfToFtl(s: ShowIf): string {
	if (s.raw) return s.raw;
	const f = s.field;
	const v = (s.value ?? '').replace(/'/g, "\\'");
	switch (s.op) {
		case 'filled':
			return `(${f})?has_content`;
		case 'empty':
			return `!(${f})?has_content`;
		case 'is':
			return `((${f})!'') == '${v}'`;
		case 'isNot':
			return `((${f})!'') != '${v}'`;
		case 'yes':
			return `(${f})!false`;
		case 'no':
			return `!((${f})!false)`;
		case 'more':
			return `((${f})!0) gt ${Number(s.value) || 0}`;
	}
	return 'true';
}

// Read an <#if> condition back as a ShowIf when it is one of the simple tests.
export function ftlToShowIf(cond: string): ShowIf {
	const c = cond.trim();
	const path = '([A-Za-z_][\\w.]*)';
	let m = new RegExp(`^\\(?${path}\\)?(?:!'')?\\??\\)?\\?(?:has_content)$`).exec(
		c.replace(/^\(\(/, '(').replace(/!''\)/, ')'),
	);
	if (m) return { field: m[1], op: 'filled' };
	m = new RegExp(`^\\(?${path}\\)?\\?size\\s+gt\\s+0$`).exec(c);
	if (m) return { field: m[1], op: 'filled' };
	m = new RegExp(`^!\\(?${path}\\)?\\?has_content$`).exec(c);
	if (m) return { field: m[1], op: 'empty' };
	m = new RegExp(`^\\(?\\(?${path}\\)?!''\\)?\\s*(==|!=)\\s*'([^']*)'$`).exec(c);
	if (m) return { field: m[1], op: m[2] === '==' ? 'is' : 'isNot', value: m[3] };
	m = new RegExp(`^\\(?${path}\\)?(?:!false)?$`).exec(c);
	if (m) return { field: m[1], op: 'yes' };
	m = new RegExp(`^!\\(\\(?${path}\\)?!false\\)$`).exec(c);
	if (m) return { field: m[1], op: 'no' };
	m = new RegExp(`^\\(\\(?${path}\\)?!0\\)\\s+gt\\s+(-?[\\d.]+)$`).exec(c);
	if (m) return { field: m[1], op: 'more', value: m[2] };
	return { field: '', op: 'filled', raw: c };
}

// ---------------------------------------------------------------------------------------------
// Compile: model -> FreeMarker HTML

function wrapIf(html: string, s?: ShowIf): string {
	if (!s || (!s.field && !s.raw)) return html;
	return `<#if ${showIfToFtl(s)}>${html}</#if>`;
}

function itemAlias(_list: string): string {
	return 'row';
}

export function compileBlock(b: DocBlock, kind: 'pdf' | 'email'): string {
	const p = b.props ?? {};
	let html = '';
	switch (b.type) {
		case 'title':
			html = `<div class="band">${p.text ?? ''}</div>`;
			break;
		case 'heading':
			html = `<div class="sec">${p.text ?? ''}</div>`;
			break;
		case 'fields': {
			const cls = (p.columns ?? 1) === 2 ? 'two' : 'one';
			if (p.list) {
				const a = p.alias || 'r';
				html = `<div class="${cls}"><#list ${p.list} as ${a}><div class="kv"><span class="k">\${${a}.k}</span><span class="v">\${${a}.v}</span></div></#list></div>`;
			} else {
				const rows = (p.rows ?? []) as FieldRow[];
				html = `<div class="${cls}">${rows
					.map(
						r =>
							`<div class="kv"><span class="k">${r.label}</span><span class="v">${r.value}</span></div>`,
					)
					.join('')}</div>`;
			}
			break;
		}
		case 'table': {
			const cols = (p.columns ?? []) as TableColumn[];
			const a = p.alias || itemAlias(p.list);
			const head = cols
				.map(c => `<th${c.width ? ` style="width:${c.width}"` : ''}>${c.label}</th>`)
				.join('');
			const cells = cols.map(c => `<td>${c.value}</td>`).join('');
			html = `<table class="${p.cls || 'rt'}"><tr>${head}</tr><#list ${p.list || 'items'} as ${a}><tr>${cells}</tr></#list></table>`;
			break;
		}
		case 'text':
			html = p.html ?? '';
			if (!/^\s*<(p|div|ul|ol|table|h\d)\b/i.test(html)) html = `<p>${html}</p>`;
			break;
		case 'terms':
			if (p.list) {
				const a = p.alias || 't';
				html = `<ol><#list ${p.list} as ${a}><li>\${${a}}</li></#list></ol>`;
			} else {
				html = `<ol>${((p.items ?? []) as string[]).map(t => `<li>${t}</li>`).join('')}</ol>`;
			}
			break;
		case 'signatures': {
			if (p.list) {
				const a = p.alias || 's';
				html = `<div class="sigs"><#list ${p.list} as ${a}><div class="sigbox"><div class="sigarea"></div><div class="sigcap"><b>\${${a}.${p.nameField || 'name'}!''}</b>${p.roleField ? ` (\${${a}.${p.roleField}!''})` : ''}</div><div class="sigcap">Date :</div></div></#list></div>`;
			} else {
				const n = Math.max(1, Number(p.count) || 1);
				const labels: string[] = p.labels ?? [];
				html = `<div class="sigs">${Array.from({ length: n })
					.map(
						(_, i) =>
							`<div class="sigbox"><div class="sigarea"></div><div class="sigcap"><b>${labels[i] ?? 'Signature'}</b></div><div class="sigcap">Date :</div></div>`,
					)
					.join('')}</div>`;
			}
			break;
		}
		case 'button':
			html = `<p><a class="btn" href="${p.href ?? '#'}">${p.text ?? 'Open'}</a></p>`;
			break;
		case 'pageBreak':
			html = kind === 'pdf' ? `<div style="page-break-after:always"></div>` : '';
			break;
		case 'image':
			html = p.src
				? `<p style="text-align:${p.align ?? 'left'}"><img src="${p.src}" style="${p.width ? `width:${p.width};` : 'max-width:100%;'}"/></p>`
				: '';
			break;
		case 'spacer':
			html = `<div style="height:${Number(p.height) || 6}${kind === 'pdf' ? 'mm' : 'px'}"></div>`;
			break;
		case 'html':
			html = p.html ?? '';
			break;
	}
	return wrapIf(html, b.showIf);
}

export function compileDocument(m: DocModel): string {
	if (m.kind === 'email') {
		const body = m.blocks.map(b => compileBlock(b, 'email')).join('\n');
		return `<html><head><meta charset="utf-8"/><style>${EMAIL_BASE_STYLE}${m.style ? '\n' + m.style : ''}</style></head><body><div class="wrap">\n${body}\n</div></body></html>`;
	}
	const { size, margin, pageNumbers, header, footer } = m.page;
	const hasHdr = header.length > 0;
	const hasFtr = footer.length > 0;
	const pageRule =
		`@page{size:${size};margin:${margin.top}mm ${margin.right}mm ${margin.bottom}mm ${margin.left}mm;` +
		(hasHdr
			? `\n@top-left{${m.page.headerBox || 'content:element(hdr);width:100%;vertical-align:top;padding-top:6mm'}}`
			: '') +
		(hasFtr
			? `\n@bottom-left{${m.page.footerBox || 'content:element(ftr);vertical-align:middle'}}`
			: '') +
		(pageNumbers
			? `\n@bottom-right{${m.page.numberBox || 'content:counter(page);font-family:Helvetica,Arial,sans-serif;font-size:8.5pt;color:#111;vertical-align:middle'}}`
			: '') +
		`}`;
	const style = m.style?.trim() ? m.style : DOC_BASE_STYLE;
	const running =
		(hasHdr && !/#hdr\s*\{[^}]*running/.test(style) ? `#hdr{position:running(hdr)}\n` : '') +
		(hasFtr && !/#ftr\s*\{[^}]*running/.test(style) ? `#ftr{position:running(ftr)}\n` : '');
	const hdr = hasHdr
		? `<div id="hdr">${header.map(b => compileBlock(b, 'pdf')).join('')}</div>\n`
		: '';
	const ftr = hasFtr
		? `<div id="ftr">${footer.map(b => compileBlock(b, 'pdf')).join('')}</div>\n`
		: '';
	const body = m.blocks.map(b => compileBlock(b, 'pdf')).join('\n\n');
	return `<html><head><meta charset="utf-8"/><style>\n${pageRule}\n${running}${style}\n</style></head><body>\n${hdr}${ftr}\n${body}\n</body></html>`;
}

// ---------------------------------------------------------------------------------------------
// Import: FreeMarker HTML -> model

const VOID = new Set(['img', 'br', 'meta', 'hr', 'input', 'link', 'col', 'source', 'wbr']);
const NEUTRAL_FTL = new Set(['else', 'elseif', 'sep', 'assign', 'items', 'break', 'return']);

// Split markup into its top-level nodes, keeping FreeMarker directives balanced with their HTML.
export function topLevelNodes(src: string): string[] {
	const out: string[] = [];
	const re = /<(\/?)(#?)([a-zA-Z][\w]*)\b[^>]*?(\/?)>/g;
	let depth = 0;
	let start = 0;
	let m: RegExpExecArray | null;
	let textStart = 0;
	while ((m = re.exec(src))) {
		const [tag, close, hash, rawName, selfClose] = m;
		const name = rawName.toLowerCase();
		const ftl = hash === '#';
		if (ftl && NEUTRAL_FTL.has(name)) continue;
		if (!ftl && (VOID.has(name) || selfClose === '/')) {
			if (depth === 0) {
				pushText(src.slice(textStart, m.index));
				out.push(tag);
				textStart = re.lastIndex;
			}
			continue;
		}
		if (!close) {
			if (depth === 0) {
				pushText(src.slice(textStart, m.index));
				start = m.index;
			}
			depth += 1;
		} else {
			depth -= 1;
			if (depth === 0) {
				out.push(src.slice(start, re.lastIndex));
				textStart = re.lastIndex;
			}
			if (depth < 0) depth = 0;
		}
	}
	pushText(src.slice(textStart));
	return out;

	function pushText(t: string) {
		if (t.trim()) out.push(t.trim());
	}
}

function innerOf(node: string): string {
	const open = /^<[^>]*>/.exec(node);
	const close = /<\/[^>]*>\s*$/.exec(node);
	if (!open || !close) return node;
	return node.slice(open[0].length, node.length - close[0].length);
}

function classOf(node: string): string {
	const m = /^<\w+[^>]*\bclass="([^"]*)"/.exec(node);
	return m ? m[1] : '';
}

function idOf(node: string): string {
	const m = /^<\w+[^>]*\bid="([^"]*)"/.exec(node);
	return m ? m[1] : '';
}

function balancedBlock(css: string, at: number): number {
	let d = 0;
	for (let i = at; i < css.length; i++) {
		if (css[i] === '{') d++;
		else if (css[i] === '}') {
			d--;
			if (d === 0) return i + 1;
		}
	}
	return css.length;
}

function parsePage(pageRule: string, page: DocPage) {
	const size = /size\s*:\s*(A4|Letter)/i.exec(pageRule);
	if (size) page.size = size[1].toUpperCase() === 'A4' ? 'A4' : 'Letter';
	const mg = /margin\s*:\s*([\d.]+)mm(?:\s+([\d.]+)mm)?(?:\s+([\d.]+)mm)?(?:\s+([\d.]+)mm)?/.exec(
		pageRule,
	);
	if (mg) {
		const v = mg.slice(1).filter(Boolean).map(Number);
		const [t, r = t, b = t, l = r] = v;
		page.margin = { top: t, right: r, bottom: b, left: l };
	}
	page.pageNumbers = /counter\(page/.test(pageRule);
	const box = (name: string) => {
		const i = pageRule.indexOf('@' + name);
		if (i < 0) return undefined;
		const open = pageRule.indexOf('{', i);
		const end = balancedBlock(pageRule, open);
		return pageRule.slice(open + 1, end - 1).trim();
	};
	page.headerBox = box('top-left');
	page.footerBox = box('bottom-left');
	page.numberBox = box('bottom-right');
}

// One node -> blocks (an <#if> around known blocks becomes their "show only if").
function nodeToBlocks(node: string, kind: 'pdf' | 'email'): DocBlock[] {
	const n = node.trim();
	const ifm = /^<#if\s+([\s\S]*?)>([\s\S]*)<\/#if>$/.exec(n);
	if (ifm && !/<#else/.test(topLevelOnly(ifm[2]))) {
		const inner = topLevelNodes(ifm[2]).flatMap(x => nodeToBlocks(x, kind));
		const cond = ftlToShowIf(ifm[1]);
		if (!cond.raw && inner.length > 0)
			return inner.map(b =>
				b.showIf
					? {
							...b,
							showIf: {
								field: '',
								op: 'filled' as ShowIfOp,
								raw: `(${showIfToFtl(cond)}) && (${showIfToFtl(b.showIf)})`,
							},
						}
					: { ...b, showIf: cond },
			);
		return [block('html', { html: n })];
	}
	const cls = classOf(n);
	if (/^<div\b/i.test(n) && /\bsec\b/.test(cls) && !/<(div|table|p)\b/i.test(innerOf(n)))
		return [block('heading', { text: innerOf(n).trim() })];
	if (/^<div\b/i.test(n) && /\bband\b/.test(cls) && !/<(div|table|p)\b/i.test(innerOf(n)))
		return [block('title', { text: innerOf(n).trim() })];
	const kv =
		/^<div class="(two|one)?"?>?<#list\s+([\w.]+)\s+as\s+(\w+)><div class="kv"><span class="k">\$\{\3\.k\}<\/span><span class="v">\$\{\3\.v\}<\/span><\/div><\/#list><\/div>$/.exec(
			n.replace(/^<div class="(two|one)">/, '<div class="$1">'),
		);
	if (kv)
		return [block('fields', { list: kv[2], alias: kv[3], columns: kv[1] === 'two' ? 2 : 1 })];
	const tbl =
		/^<table(?: class="([\w -]*)")?><tr>((?:<th[^>]*>[\s\S]*?<\/th>)+)<\/tr><#list\s+([\w.]+)\s+as\s+(\w+)><tr>((?:<td>[\s\S]*?<\/td>)+)<\/tr><\/#list><\/table>$/.exec(
			n,
		);
	if (tbl) {
		const heads = Array.from(tbl[2].matchAll(/<th([^>]*)>([\s\S]*?)<\/th>/g));
		const cells = Array.from(tbl[5].matchAll(/<td>([\s\S]*?)<\/td>/g)).map(x => x[1]);
		if (heads.length === cells.length && !cells.some(c => /<#/.test(c)))
			return [
				block('table', {
					list: tbl[3],
					alias: tbl[4],
					cls: tbl[1] || 'rt',
					columns: heads.map((h, i) => ({
						label: h[2],
						value: cells[i],
						width: /width:\s*([\d.]+%)/.exec(h[1])?.[1],
					})),
				}),
			];
	}
	const terms = /^<ol><#list\s+([\w.]+)\s+as\s+(\w+)><li>\$\{\2\}<\/li><\/#list><\/ol>$/.exec(n);
	if (terms) return [block('terms', { list: terms[1], alias: terms[2] })];
	if (/^<ol>/.test(n) && !/<#/.test(n)) {
		const items = Array.from(n.matchAll(/<li>([\s\S]*?)<\/li>/g)).map(x => x[1]);
		return [block('terms', { items })];
	}
	if (/^<p\b[^>]*>/.test(n) && !/<(div|table|ol|ul|#list)\b/.test(n))
		return [block('text', { html: n })];
	if (/^<div style="page-break-after:always"><\/div>$/.test(n)) return [block('pageBreak')];
	return [block('html', { html: n })];
}

function topLevelOnly(s: string): string {
	return topLevelNodes(s)
		.map(x => (x.startsWith('<') ? x.slice(0, x.indexOf('>') + 1) : x))
		.join('');
}

export function importDocument(html: string, kind: 'pdf' | 'email'): DocModel {
	const m = emptyModel(kind);
	if (!html || !html.trim()) return m;
	const styleMatch = /<style[^>]*>([\s\S]*?)<\/style>/i.exec(html);
	let css = styleMatch ? styleMatch[1] : '';
	const at = css.search(/@page\b/);
	if (at >= 0) {
		const end = balancedBlock(css, css.indexOf('{', at));
		parsePage(css.slice(at, end), m.page);
		css = (css.slice(0, at) + css.slice(end)).trim();
	} else if (kind === 'pdf') {
		m.page.pageNumbers = false;
	}
	if (kind === 'email') css = css.replace(EMAIL_BASE_STYLE, '').trim();
	m.style = css;

	const bodyMatch = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html);
	let body = bodyMatch ? bodyMatch[1] : html.replace(/<head>[\s\S]*?<\/head>/i, '');
	if (kind === 'email') {
		const wrap = /^\s*<div class="wrap">([\s\S]*)<\/div>\s*$/.exec(body);
		if (wrap) body = wrap[1];
	}
	for (const node of topLevelNodes(body)) {
		const id = idOf(node);
		if (id === 'hdr') {
			m.page.header = [block('html', { html: innerOf(node) })];
			continue;
		}
		if (id === 'ftr') {
			m.page.footer = [block('html', { html: innerOf(node) })];
			continue;
		}
		m.blocks.push(...nodeToBlocks(node, kind));
	}
	return m;
}

// ---------------------------------------------------------------------------------------------
// Fields inside FreeMarker text: ${path!'fallback'} or ${(path)?string('#,##0')}...

export type FieldFormat = 'plain' | 'amount' | 'amount0' | 'upper' | 'lower';

export interface Segment {
	text?: string;
	field?: { path: string; fallback?: string; format: FieldFormat; raw: string };
}

const TOKEN = /\$\{([^}]*)\}/g;

export function parseToken(inner: string): Segment['field'] {
	const raw = `\${${inner}}`;
	let s = inner.trim();
	let format: FieldFormat = 'plain';
	let fallback: string | undefined;
	const amt = /^\(\(([\w.]+)\)!0\)\?string\('([^']*)'\)$/.exec(s);
	if (amt) return { path: amt[1], format: amt[2].includes('.') ? 'amount' : 'amount0', raw };
	const caseM = /^\(\(([\w.]+)\)!'([^']*)'\)\?(upper_case|lower_case)$/.exec(s);
	if (caseM)
		return {
			path: caseM[1],
			fallback: caseM[2],
			format: caseM[3] === 'upper_case' ? 'upper' : 'lower',
			raw,
		};
	const fb = /^\(?([\w.]+)\)?!(?:'([^']*)')?$/.exec(s);
	if (fb) return { path: fb[1], fallback: fb[2] ?? '', format, raw };
	const plain = /^\(?([\w.]+)\)?$/.exec(s);
	if (plain) return { path: plain[1], format, raw };
	// Anything else (an expression) stays a field chip showing its text.
	const head = /([A-Za-z_][\w.]*)/.exec(s);
	return { path: head ? head[1] : s, format, raw };
}

export function makeToken(path: string, format: FieldFormat = 'plain', fallback = '-'): string {
	const fb = fallback.replace(/'/g, '');
	switch (format) {
		case 'amount':
			return `\${((${path})!0)?string('#,##0.00')}`;
		case 'amount0':
			return `\${((${path})!0)?string('#,##0')}`;
		case 'upper':
			return `\${((${path})!'${fb}')?upper_case}`;
		case 'lower':
			return `\${((${path})!'${fb}')?lower_case}`;
	}
	return `\${${path}!'${fb}'}`;
}

export function segments(text: string): Segment[] {
	const out: Segment[] = [];
	let last = 0;
	let m: RegExpExecArray | null;
	TOKEN.lastIndex = 0;
	while ((m = TOKEN.exec(text))) {
		if (m.index > last) out.push({ text: text.slice(last, m.index) });
		out.push({ field: parseToken(m[1]) });
		last = TOKEN.lastIndex;
	}
	if (last < text.length) out.push({ text: text.slice(last) });
	return out;
}

// ---------------------------------------------------------------------------------------------
// Client-side values for the page view (the PDF view is the server's own render)

export function valueAt(data: any, path: string, scope: Record<string, any> = {}): any {
	if (!path) return undefined;
	const parts = path.split('.');
	let cur: any = parts[0] in scope ? scope[parts[0]] : data?.[parts[0]];
	for (let i = 1; i < parts.length && cur !== undefined && cur !== null; i++) cur = cur[parts[i]];
	return cur;
}

function hasContent(v: any): boolean {
	if (v === undefined || v === null) return false;
	if (typeof v === 'string') return v.length > 0;
	if (Array.isArray(v)) return v.length > 0;
	if (typeof v === 'object') return Object.keys(v).length > 0;
	return true;
}

export function evalShowIf(
	s: ShowIf | undefined,
	data: any,
	scope: Record<string, any> = {},
): boolean {
	if (!s || (!s.field && !s.raw)) return true;
	if (s.raw) return true; // shown; the PDF view decides
	const v = valueAt(data, s.field, scope);
	switch (s.op) {
		case 'filled':
			return hasContent(v);
		case 'empty':
			return !hasContent(v);
		case 'is':
			return `${v ?? ''}` === (s.value ?? '');
		case 'isNot':
			return `${v ?? ''}` !== (s.value ?? '');
		case 'yes':
			return v === true;
		case 'no':
			return v !== true;
		case 'more':
			return Number(v ?? 0) > (Number(s.value) || 0);
	}
	return true;
}

const INR = (n: number, frac: number) =>
	n.toLocaleString('en-IN', { minimumFractionDigits: frac, maximumFractionDigits: frac });

export function formatValue(v: any, f: NonNullable<Segment['field']>): string {
	if (v === undefined || v === null || v === '') return f.fallback ?? '';
	switch (f.format) {
		case 'amount':
			return typeof v === 'number' ? INR(v, 2) : `${v}`;
		case 'amount0':
			return typeof v === 'number' ? INR(v, 0) : `${v}`;
		case 'upper':
			return `${v}`.toUpperCase();
		case 'lower':
			return `${v}`.toLowerCase();
	}
	if (typeof v === 'object') return JSON.stringify(v);
	return `${v}`;
}

// Paths a block reads (for "Field x is empty" errors pointing at the block).
export function blockPaths(b: DocBlock): string[] {
	const text = JSON.stringify(b.props ?? {}) + (b.showIf ? b.showIf.field : '');
	const out = new Set<string>();
	let m: RegExpExecArray | null;
	const re = /\$\{\(?\(?([A-Za-z_][\w.]*)/g;
	while ((m = re.exec(text))) out.add(m[1]);
	if (b.props?.list) out.add(b.props.list);
	return Array.from(out);
}

// The template's CSS for the page view: every selector is put under the page element, so the
// document's own rules (body, .sec, .kv) style the page and nothing else. @page and other at-rules
// are left out (the page view draws margins, header and footer itself).
export function scopeCss(css: string, scope: string): string {
	let out = '';
	let i = 0;
	const src = css.replace(/\/\*[\s\S]*?\*\//g, '');
	while (i < src.length) {
		const open = src.indexOf('{', i);
		if (open < 0) break;
		const sel = src.slice(i, open).trim();
		const end = balancedBlock(src, open);
		const body = src.slice(open, end);
		if (sel.startsWith('@')) {
			i = end;
			continue;
		}
		const scoped = sel
			.split(',')
			.map(x => x.trim())
			.filter(Boolean)
			.map(x =>
				/^(html|body)$/i.test(x) ? scope : `${scope} ${x.replace(/^(html|body)\s+/i, '')}`,
			)
			.join(',');
		out += `${scoped}${body}\n`;
		i = end;
	}
	return out;
}
