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
	| 'applicants'
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
	// The @page rule as the template wrote it, used as long as the settings above are unchanged.
	raw?: string;
	rawKey?: string;
}

export interface DocModel {
	version: 1;
	kind: 'pdf' | 'email';
	page: DocPage;
	blocks: DocBlock[];
	// The template's own CSS (classes its blocks use), kept as it was. The @page rule is written from
	// `page` instead.
	style: string;
	// A body written as <#if cond>...<#else>fallback</#if> (for example "when there is no letter data"):
	// the blocks are the first part; the condition and the fallback are kept as written.
	guard?: { cond: string; fallback: string };
	// The template's own HTML around the body (doctype, head, body tag), with markers where the style and
	// the body go, so a template read from code is written back the same way.
	shell?: string;
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

const KV = (a: string) =>
	`<div class="kv"><span class="k">\${${a}.k}</span><span class="v">\${${a}.v}</span></div>`;

// One signature box of a signer: the drawn or typed signature once signed, the name, the role, the date.
export function signBox(p: any, a: string): string {
	const f = (k: string, d: string) => p[k] || d;
	const signed = f('signedField', 'signed');
	const role = p.roleField === '' ? '' : f('roleField', 'roleLabel');
	return (
		`<div class="sigbox"><div class="sigarea"><#if ${a}.${signed}><#if (${a}.${f('imageField', 'image')}!'')?has_content>` +
		`<img class="sigimg" src="\${${a}.${f('imageField', 'image')}}"/><#else><div class="typed">\${${a}.${f('textField', 'text')}!''}</div></#if></#if></div>` +
		`<div class="sigcap"><b>\${${a}.${f('nameField', 'name')}!''}</b>${role ? ` (\${${a}.${role}!''})` : ''}</div>` +
		`<div class="sigcap">Date : <#if ${a}.${signed}>\${${a}.${f('atField', 'at')}!''}</#if></div></div>`
	);
}

// Applicant cards: side by side (cols) or one under another (stack), each with a heading, an optional
// photo box and rows of label and value; stack cards may carry a second set of rows with a heading.
export function applicantsHtml(p: any): string {
	const a = p.alias || 'a';
	const r = p.rowAlias || 'r';
	const title = p.titleField || 'title';
	const rows = p.rowsField || 'personal';
	if ((p.layout ?? 'cols') === 'stack') {
		const second = p.secondField
			? `<#if ${a}.${p.secondField}?size gt 0><h4 style="margin:3mm 0 1mm">${p.secondTitle ?? ''}</h4><div class="two"><#list ${a}.${p.secondField} as ${r}>${KV(r)}</#list></div></#if>`
			: '';
		return `<#list ${p.list} as ${a}><div class="ap"><h4 style="margin:0 0 2mm">\${${a}.${title}}</h4><div class="two"><#list ${a}.${rows} as ${r}>${KV(r)}</#list></div>${second}</div></#list>`;
	}
	const photo = p.photo
		? `<#if !${a}.${p.entityField || 'isEntity'}><div class="photo"${p.photoStyle ? ` style="${p.photoStyle}"` : ''}><#if (${a}.${p.photoField || 'photo'}!'')?has_content><img src="\${${a}.${p.photoField || 'photo'}}"/><#else><span>${p.photoLabel ?? 'Applicant image'}</span></#if></div></#if>`
		: '';
	return `<div class="cols"><#list ${p.list} as ${a}><div class="col ap"><h4>\${${a}.${title}}</h4>${photo}<#list ${a}.${rows} as ${r}>${KV(r)}</#list></div></#list></div>`;
}

export function compileBlock(b: DocBlock, kind: 'pdf' | 'email'): string {
	const p = b.props ?? {};
	let html = '';
	switch (b.type) {
		case 'title':
			html = `<div class="band"${p.attrs ?? ''}>${p.text ?? ''}</div>`;
			break;
		case 'heading':
			html = `<div class="sec"${p.attrs ?? ''}>${p.text ?? ''}</div>`;
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
				const loop = `<#list ${p.list} as ${a}>${signBox(p, a)}</#list>`;
				html =
					p.fallback !== undefined
						? `<div class="sigs"><#if ((${p.list})![])?size gt 0>${loop}<#else>${p.fallback}</#if></div>`
						: `<div class="sigs">${loop}</div>`;
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
		case 'applicants':
			html = applicantsHtml(p);
			break;
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

export const STYLE_MARK = '\u0001STYLE\u0001';
export const BODY_MARK = '\u0001BODY\u0001';
export const PAGE_MARK = '/*@page*/';

function pageKey(pg: DocPage): string {
	const { size, margin, pageNumbers, headerBox, footerBox, numberBox } = pg;
	return JSON.stringify({
		size,
		margin,
		pageNumbers,
		headerBox,
		footerBox,
		numberBox,
		h: pg.header.length > 0,
		f: pg.footer.length > 0,
	});
}

function pageRuleOf(pg: DocPage): string {
	if (pg.raw !== undefined && pg.rawKey === pageKey(pg)) return pg.raw;
	const { size, margin, pageNumbers, header, footer } = pg;
	return (
		`@page{size:${size};margin:${margin.top}mm ${margin.right}mm ${margin.bottom}mm ${margin.left}mm;` +
		(header.length
			? `\n@top-left{${pg.headerBox || 'content:element(hdr);width:100%;vertical-align:top;padding-top:6mm'}}`
			: '') +
		(footer.length
			? `\n@bottom-left{${pg.footerBox || 'content:element(ftr);vertical-align:middle'}}`
			: '') +
		(pageNumbers
			? `\n@bottom-right{${pg.numberBox || 'content:counter(page);font-family:Helvetica,Arial,sans-serif;font-size:8.5pt;color:#111;vertical-align:middle'}}`
			: '') +
		`}`
	);
}

export function compileDocument(m: DocModel): string {
	if (m.kind === 'email') {
		const body = m.blocks.map(b => compileBlock(b, 'email')).join('\n');
		if (m.shell)
			return m.shell
				.replace(STYLE_MARK, m.style ? `<style>${m.style}</style>` : '')
				.replace(BODY_MARK, body);
		return `<html><head><meta charset="utf-8"/><style>${EMAIL_BASE_STYLE}${m.style ? '\n' + m.style : ''}</style></head><body><div class="wrap">\n${body}\n</div></body></html>`;
	}
	const { header, footer } = m.page;
	const hasHdr = header.length > 0;
	const hasFtr = footer.length > 0;
	const pageRule = pageRuleOf(m.page);
	const base = m.style?.trim() ? m.style : DOC_BASE_STYLE;
	const running =
		(hasHdr && !/#hdr\s*\{[^}]*running/.test(base) ? `#hdr{position:running(hdr)}\n` : '') +
		(hasFtr && !/#ftr\s*\{[^}]*running/.test(base) ? `#ftr{position:running(ftr)}\n` : '');
	const css = base.includes(PAGE_MARK)
		? base.replace(PAGE_MARK, pageRule) + (running ? `\n${running}` : '')
		: `\n${pageRule ? pageRule + '\n' : ''}${running}${base}\n`;
	const hdr = hasHdr
		? `<div id="hdr">${header.map(b => compileBlock(b, 'pdf')).join('')}</div>\n`
		: '';
	const ftr = hasFtr
		? `<div id="ftr">${footer.map(b => compileBlock(b, 'pdf')).join('')}</div>\n`
		: '';
	let body = m.blocks.map(b => compileBlock(b, 'pdf')).join('\n\n');
	if (m.guard) body = `<#if ${m.guard.cond}>\n${body}\n<#else>${m.guard.fallback}</#if>`;
	if (m.shell) {
		const withStyle = m.shell.includes(STYLE_MARK)
			? m.shell.replace(STYLE_MARK, `<style>${css}</style>`)
			: m.shell.replace(/<\/head>/i, `<style>${css}</style></head>`);
		return withStyle.replace(BODY_MARK, `\n${hdr}${ftr}\n${body}\n`);
	}
	return `<html><head><meta charset="utf-8"/><style>${css}</style></head><body>\n${hdr}${ftr}\n${body}\n</body></html>`;
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
		if (inner.length > 0 && (!cond.raw || inner.some(b => b.type !== 'html')))
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
	const hd = /^<div class="(sec|band)"([^>]*)>([\s\S]*)<\/div>$/.exec(n);
	if (hd && !/<(div|table|p|ol|ul)\b/i.test(hd[3]) && !/<#/.test(hd[3]))
		return [
			block(hd[1] === 'sec' ? 'heading' : 'title', {
				text: hd[3],
				...(hd[2] ? { attrs: hd[2] } : {}),
			}),
		];
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
	const ap = importApplicants(n);
	if (ap) return [ap];
	const sg = importSignatures(n);
	if (sg) return [sg];
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
	const styleMatch = /<style>([\s\S]*?)<\/style>/i.exec(html);
	let css = styleMatch ? styleMatch[1] : '';
	let pageRaw: string | undefined;
	const at = css.search(/@page\b/);
	if (at >= 0) {
		const end = balancedBlock(css, css.indexOf('{', at));
		pageRaw = css.slice(at, end);
		parsePage(pageRaw, m.page);
		css = css.slice(0, at) + PAGE_MARK + css.slice(end);
	} else if (kind === 'pdf') {
		m.page.pageNumbers = false;
	}
	m.style = css;
	const bodyAt = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html);
	if (bodyAt) {
		let shell = html.slice(0, bodyAt.index) + html.slice(bodyAt.index).replace(bodyAt[1], BODY_MARK);
		if (styleMatch) shell = shell.replace(styleMatch[0], STYLE_MARK);
		m.shell = shell;
	}

	const bodyMatch = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html);
	let body = bodyMatch ? bodyMatch[1] : html.replace(/<head>[\s\S]*?<\/head>/i, '');
	if (kind === 'email') {
		const wrap = /^\s*<div class="wrap">([\s\S]*)<\/div>\s*$/.exec(body);
		if (wrap) {
			body = wrap[1];
			if (m.shell) m.shell = m.shell.replace(BODY_MARK, `<div class="wrap">\n${BODY_MARK}\n</div>`);
		}
	}
	let nodes = topLevelNodes(body);
	const rest = nodes.filter(x => !['hdr', 'ftr'].includes(idOf(x)));
	const guard = rest.length === 1 ? splitIfElse(rest[0]) : undefined;
	if (guard) {
		m.guard = { cond: guard.cond, fallback: guard.otherwise };
		nodes = [...nodes.filter(x => x !== rest[0]), ...topLevelNodes(guard.then)];
	}
	for (const node of nodes) {
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
	if (kind === 'pdf' && (pageRaw || m.shell)) {
		// As written: the @page rule, or none, until the page settings are changed.
		m.page.raw = pageRaw ?? '';
		m.page.rawKey = pageKey(m.page);
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

// Applicant cards and signature boxes are read by their fields, then written back and compared: only
// markup that comes back exactly the same becomes a block, anything else stays HTML.
function importApplicants(n: string): DocBlock | undefined {
	const cols = /^<div class="cols"><#list ([\w.]+) as (\w+)><div class="col ap"><h4>\$\{\2\.(\w+)\}<\/h4>/.exec(n);
	const stack = /^<#list ([\w.]+) as (\w+)><div class="ap"><h4 style="margin:0 0 2mm">\$\{\2\.(\w+)\}<\/h4>/.exec(n);
	const m = cols ?? stack;
	if (!m) return undefined;
	const [, list, a, title] = m;
	const rowsM = new RegExp(`<#list ${a}\\.(\\w+) as (\\w+)>`).exec(n);
	if (!rowsM) return undefined;
	const p: any = { list, alias: a, titleField: title, rowsField: rowsM[1], rowAlias: rowsM[2] };
	if (cols) {
		p.layout = 'cols';
		const ph = new RegExp(
			`<#if !${a}\\.(\\w+)><div class="photo"(?: style="([^"]*)")?><#if \\(${a}\\.(\\w+)!''\\)\\?has_content>[\\s\\S]*?<span>([^<]*)<\\/span>`,
		).exec(n);
		if (ph) Object.assign(p, { photo: true, entityField: ph[1], photoStyle: ph[2], photoField: ph[3], photoLabel: ph[4] });
	} else {
		p.layout = 'stack';
		const sec = new RegExp(
			`<#if ${a}\\.(\\w+)\\?size gt 0><h4 style="margin:3mm 0 1mm">([^<]*)<\\/h4>`,
		).exec(n);
		if (sec) Object.assign(p, { secondField: sec[1], secondTitle: sec[2] });
	}
	return applicantsHtml(p) === n ? block('applicants', p) : undefined;
}

function importSignatures(n: string): DocBlock | undefined {
	const m =
		/^<div class="sigs">(?:<#if \(\(([\w.]+)\)!\[\]\)\?size gt 0>)?<#list ([\w.]+) as (\w+)>/.exec(n);
	if (!m || (m[1] && m[1] !== m[2])) return undefined;
	const [, , list, a] = m;
	const g = (re: string) => new RegExp(re).exec(n)?.[1];
	const p: any = {
		list,
		alias: a,
		signedField: g(`<div class="sigarea"><#if ${a}\\.(\\w+)>`),
		imageField: g(`<img class="sigimg" src="\\$\\{${a}\\.(\\w+)\\}"`),
		textField: g(`<div class="typed">\\$\\{${a}\\.(\\w+)!''\\}`),
		nameField: g(`<b>\\$\\{${a}\\.(\\w+)!''\\}<\\/b>`),
		roleField: g(`<\\/b> \\(\\$\\{${a}\\.(\\w+)!''\\}\\)`) ?? '',
		atField: g(`Date : <#if ${a}\\.\\w+>\\$\\{${a}\\.(\\w+)!''\\}`),
	};
	if (m[1]) {
		const box = signBox(p, a);
		const head = `<div class="sigs"><#if ((${list})![])?size gt 0><#list ${list} as ${a}>${box}</#list><#else>`;
		if (!n.startsWith(head) || !n.endsWith('</#if></div>')) return undefined;
		p.fallback = n.slice(head.length, n.length - '</#if></div>'.length);
	}
	const b = block('signatures', p);
	return compileBlock(b, 'pdf') === n ? b : undefined;
}

// <#if cond>A<#else>B</#if> with the #else at the top level of that #if.
export function splitIfElse(node: string): { cond: string; then: string; otherwise: string } | undefined {
	const n = node.trim();
	const head = /^<#if\s+([\s\S]*?)>/.exec(n);
	if (!head || !n.endsWith('</#if>')) return undefined;
	const inner = n.slice(head[0].length, n.length - '</#if>'.length);
	const re = /<(\/?)#(if|list|else|elseif)\b[^>]*>/g;
	let depth = 0;
	let m: RegExpExecArray | null;
	while ((m = re.exec(inner))) {
		const close = m[1] === '/';
		const name = m[2];
		if (name === 'else' || name === 'elseif') {
			if (depth === 0) {
				if (name === 'elseif') return undefined;
				return { cond: head[1], then: inner.slice(0, m.index), otherwise: inner.slice(re.lastIndex) };
			}
			continue;
		}
		depth += close ? -1 : 1;
		if (depth < 0) return undefined;
	}
	return undefined;
}

// ---------------------------------------------------------------------------------------------
// Compare: what changed from another version of the template (the saved one, or the template a
// project or unit copy was made from). Blocks are matched by the HTML they write, in order (longest
// common sequence); a block only in the new version is added, one only in the old is removed, and an
// added block standing where one was removed is changed.

export interface DocDiff {
	status: Record<string, 'added' | 'changed'>;
	// Removed blocks, each with the id of the new block it would come after (undefined: at the top).
	removed: Array<{ after?: string; block: DocBlock }>;
	page: boolean;
	count: number;
}

export function diffModels(before: DocModel, after: DocModel): DocDiff {
	const a = before.blocks.map(b => compileBlock(b, before.kind));
	const b = after.blocks.map(x => compileBlock(x, after.kind));
	const n = a.length;
	const m = b.length;
	const L: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
	for (let i = n - 1; i >= 0; i--)
		for (let j = m - 1; j >= 0; j--)
			L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
	const status: DocDiff['status'] = {};
	const removed: DocDiff['removed'] = [];
	let i = 0;
	let j = 0;
	let pendingRemoved: DocBlock[] = [];
	const flush = (afterId?: string) => {
		pendingRemoved.forEach(blk => removed.push({ after: afterId, block: blk }));
		pendingRemoved = [];
	};
	let lastNew: string | undefined;
	while (i < n || j < m) {
		if (i < n && j < m && a[i] === b[j]) {
			flush(lastNew);
			lastNew = after.blocks[j].id;
			i++;
			j++;
		} else if (j < m && (i >= n || L[i][j + 1] > L[i + 1][j])) {
			const id = after.blocks[j].id;
			if (pendingRemoved.length) {
				pendingRemoved.shift();
				status[id] = 'changed';
			} else status[id] = 'added';
			lastNew = id;
			j++;
		} else {
			pendingRemoved.push(before.blocks[i]);
			i++;
		}
	}
	flush(lastNew);
	const page =
		JSON.stringify({ ...before.page, header: undefined, footer: undefined, raw: undefined, rawKey: undefined }) !==
			JSON.stringify({ ...after.page, header: undefined, footer: undefined, raw: undefined, rawKey: undefined }) ||
		before.page.header.map(x => compileBlock(x, 'pdf')).join() !== after.page.header.map(x => compileBlock(x, 'pdf')).join() ||
		before.page.footer.map(x => compileBlock(x, 'pdf')).join() !== after.page.footer.map(x => compileBlock(x, 'pdf')).join();
	return { status, removed, page, count: Object.keys(status).length + removed.length + (page ? 1 : 0) };
}
