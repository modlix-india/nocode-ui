import {
	applicantsHtml,
	block,
	splitIfElse,
	compileDocument,
	evalShowIf,
	formatValue,
	ftlToShowIf,
	importDocument,
	makeToken,
	parseToken,
	scopeCss,
	segments,
	showIfToFtl,
	topLevelNodes,
} from '../docModel';

// A cut-down booking form in the shape CXZump's cxBookingForm is written.
const FORM = `<html><head><meta charset="utf-8"/><style>
@page{size:A4;margin:42mm 14mm 20mm 14mm;
@top-left{content:element(hdr);width:182mm;vertical-align:top;padding-top:9mm}
@bottom-left{content:element(ftr);vertical-align:middle}
@bottom-right{content:counter(page, decimal-leading-zero);font-size:8.5pt}}
body{font-family:Helvetica,Arial,sans-serif;font-size:9.5pt}
#hdr{position:running(hdr);width:182mm}
#ftr{position:running(ftr)}
.sec{font-weight:bold}
</style></head><body>
<div id="hdr"><div class="band">\${bf.header.title!'Booking Form'}</div></div>
<div id="ftr"><span class="muted">\${(tenant.name)!''}</span></div>

<div class="sec">Booking details</div>
<div class="two"><#list bf.details as r><div class="kv"><span class="k">\${r.k}</span><span class="v">\${r.v}</span></div></#list></div>

<#if bf.terms?size gt 0>
<div class="sec">Terms and conditions</div>
<ol><#list bf.terms as t><li>\${t}</li></#list></ol>
</#if>

<#if bf.cancellation.show>
<table class="can"><tr><th style="width:12%">Sl No</th><th>When</th></tr><#list bf.cancellation.rows as r><tr><td>\${r.n}</td><td>\${r.when}</td></tr></#list></table>
</#if>

<div class="cols"><#list bf.first as a><div class="col"><h4>\${a.title}</h4></div></#list></div>
</body></html>`;

const norm = (h: string) =>
	h
		.replace(/<style[\s\S]*?<\/style>/, '')
		.replace(/\s+/g, '')
		.trim();

describe('importDocument', () => {
	const m = importDocument(FORM, 'pdf');

	it('reads the page: size, margins, page numbers and the running header and footer', () => {
		expect(m.page.size).toBe('A4');
		expect(m.page.margin).toEqual({ top: 42, right: 14, bottom: 20, left: 14 });
		expect(m.page.pageNumbers).toBe(true);
		expect(m.page.headerBox).toContain('width:182mm');
		expect(m.page.header).toHaveLength(1);
		expect(m.page.footer).toHaveLength(1);
		expect(m.style).not.toMatch(/@page\s*\{/);
	});

	it('turns known parts into blocks, an <#if> into "show only if", the rest into HTML', () => {
		const kinds = m.blocks.map(
			b => b.type + (b.showIf ? `?${b.showIf.op}:${b.showIf.field}` : ''),
		);
		expect(kinds).toEqual([
			'heading',
			'fields',
			'heading?filled:bf.terms',
			'terms?filled:bf.terms',
			'table?yes:bf.cancellation.show',
			'html',
		]);
		const fields = m.blocks[1];
		expect(fields.props).toMatchObject({ list: 'bf.details', alias: 'r', columns: 2 });
		const table = m.blocks[4];
		expect(table.props.list).toBe('bf.cancellation.rows');
		expect(table.props.cls).toBe('can');
		expect(table.props.columns.map((c: any) => c.label)).toEqual(['Sl No', 'When']);
		expect(table.props.columns[0].width).toBe('12%');
	});

	it('round trips: compiling gives the same markup, with each block carrying its own condition', () => {
		const out = norm(compileDocument(m));
		// The parts outside conditions are the same markup as written.
		const same = (h: string) => h.replace(/<#if[^>]*>|<\/#if>/g, '');
		expect(same(out)).toBe(same(norm(FORM)));
		// The <#if> around two blocks becomes one per block, testing the same field.
		expect(out).toContain(
			'<#if(bf.terms)?has_content><divclass="sec">Termsandconditions</div></#if>',
		);
		expect(out).toContain('<#if(bf.terms)?has_content><ol><#listbf.termsast>');
		// Importing what it wrote gives the same page again.
		expect(norm(compileDocument(importDocument(compileDocument(m), 'pdf')))).toBe(out);
	});

	it('keeps an empty template empty, and treats markup it does not know as one HTML block', () => {
		expect(importDocument('', 'pdf').blocks).toEqual([]);
		const odd = importDocument('<html><body><section><b>x</b></section></body></html>', 'pdf');
		expect(odd.blocks.map(b => b.type)).toEqual(['html']);
	});
});

describe('compileDocument', () => {
	it('writes blocks as FreeMarker: show only if as <#if>, repeating table as <#list>', () => {
		const m = importDocument('', 'pdf');
		m.blocks = [
			block(
				'text',
				{ html: `Dear ${makeToken('case.customerName')}` },
				{ field: 'case.customerName', op: 'filled' },
			),
			block('table', {
				list: 'schedule',
				alias: 'row',
				columns: [
					{ label: 'Instalment', value: makeToken('row.label') },
					{ label: 'Amount', value: makeToken('row.amount', 'amount') },
				],
			}),
			block('pageBreak'),
		];
		const html = compileDocument(m);
		expect(html).toContain(
			"<#if (case.customerName)?has_content><p>Dear ${case.customerName!'-'}</p></#if>",
		);
		expect(html).toContain('<#list schedule as row><tr><td>${row.label!');
		expect(html).toContain("${((row.amount)!0)?string('#,##0.00')}");
		expect(html).toContain('page-break-after:always');
		expect(html).toContain('@page{size:A4;margin:30mm 14mm 20mm 14mm;');
	});

	it('writes an email inside a 600px body with no @page', () => {
		const m = importDocument('', 'email');
		m.blocks = [block('button', { text: 'Open', href: '${link}' })];
		const html = compileDocument(m);
		expect(html).not.toContain('@page');
		expect(html).toContain('<div class="wrap">');
		expect(html).toContain('<a class="btn" href="${link}">Open</a>');
	});
});

describe('show only if', () => {
	it.each([
		[{ field: 'a.b', op: 'filled' }, '(a.b)?has_content'],
		[{ field: 'a.b', op: 'empty' }, '!(a.b)?has_content'],
		[{ field: 'unit.type', op: 'is', value: 'Villa' }, "((unit.type)!'') == 'Villa'"],
		[{ field: 'unit.type', op: 'isNot', value: 'Villa' }, "((unit.type)!'') != 'Villa'"],
		[{ field: 'bf.hasOthers', op: 'yes' }, '(bf.hasOthers)!false'],
		[{ field: 'bf.hasOthers', op: 'no' }, '!((bf.hasOthers)!false)'],
		[{ field: 'signedCount', op: 'more', value: '0' }, '((signedCount)!0) gt 0'],
	] as any[])('%j is written as %s and read back', (s, ftl) => {
		expect(showIfToFtl(s)).toBe(ftl);
		const back = ftlToShowIf(ftl);
		expect(back.field).toBe(s.field);
		expect(back.op).toBe(s.op);
	});

	it('keeps a condition it cannot read as written', () => {
		const s = ftlToShowIf('(a?size gt 0) && (b?size gt 0)');
		expect(s.raw).toBe('(a?size gt 0) && (b?size gt 0)');
		expect(showIfToFtl(s)).toBe(s.raw);
	});

	it('is checked against the data for the page view', () => {
		const data = { unit: { type: 'Villa' }, list: [], n: 3, yes: true };
		expect(evalShowIf({ field: 'unit.type', op: 'is', value: 'Villa' }, data)).toBe(true);
		expect(evalShowIf({ field: 'list', op: 'filled' }, data)).toBe(false);
		expect(evalShowIf({ field: 'n', op: 'more', value: '2' }, data)).toBe(true);
		expect(evalShowIf({ field: 'yes', op: 'no' }, data)).toBe(false);
		expect(evalShowIf(undefined, data)).toBe(true);
	});
});

describe('fields in text', () => {
	it('splits text into words and fields, reading formats and empty values', () => {
		const s = segments(
			"Paid ${((payment.amount)!0)?string('#,##0.00')} by ${case.customerName!'-'}.",
		);
		expect(s.map(x => (x.field ? `[${x.field.path}:${x.field.format}]` : x.text))).toEqual([
			'Paid ',
			'[payment.amount:amount]',
			' by ',
			'[case.customerName:plain]',
			'.',
		]);
		expect(parseToken("case.customerName!'-'")).toMatchObject({ fallback: '-' });
	});

	it('writes each format so FreeMarker renders it and reads it back', () => {
		for (const f of ['plain', 'amount', 'amount0', 'upper', 'lower'] as const) {
			const t = makeToken('x.y', f, '-');
			expect(parseToken(t.slice(2, -1))).toMatchObject({ path: 'x.y', format: f });
		}
	});

	it('formats values for the page view the way the document shows them', () => {
		expect(formatValue(1050000, { path: 'a', format: 'amount', raw: '' })).toBe('10,50,000.00');
		expect(formatValue('', { path: 'a', format: 'plain', fallback: '-', raw: '' })).toBe('-');
		expect(formatValue('villa', { path: 'a', format: 'upper', raw: '' })).toBe('VILLA');
	});
});

describe('applicant cards and signature boxes', () => {
	const cols =
		'<div class="cols"><#list bf.first as a><div class="col ap"><h4>${a.title}</h4><#if !a.isEntity><div class="photo"><#if (a.photo!\'\')?has_content><img src="${a.photo}"/><#else><span>Applicant image</span></#if></div></#if><#list a.personal as r><div class="kv"><span class="k">${r.k}</span><span class="v">${r.v}</span></div></#list></div></#list></div>';
	const stack =
		'<#list bf.others as a><div class="ap"><h4 style="margin:0 0 2mm">${a.title}</h4><div class="two"><#list a.personal as r><div class="kv"><span class="k">${r.k}</span><span class="v">${r.v}</span></div></#list></div><#if a.professional?size gt 0><h4 style="margin:3mm 0 1mm">Professional details</h4><div class="two"><#list a.professional as r><div class="kv"><span class="k">${r.k}</span><span class="v">${r.v}</span></div></#list></div></#if></div></#list>';
	const sigs =
		'<div class="sigs"><#if ((signRows)![])?size gt 0><#list signRows as s><div class="sigbox"><div class="sigarea"><#if s.signed><#if (s.image!\'\')?has_content><img class="sigimg" src="${s.image}"/><#else><div class="typed">${s.text!\'\'}</div></#if></#if></div><div class="sigcap"><b>${s.name!\'\'}</b> (${s.roleLabel!\'\'})</div><div class="sigcap">Date : <#if s.signed>${s.at!\'\'}</#if></div></div></#list><#else><div class="sigbox">one</div></#if></div>';
	const doc = (b: string) => `<html><head><style>.x{}</style></head><body>${b}</body></html>`;

	it('reads cards side by side, cards one under another, and signer boxes as their own blocks', () => {
		const m = importDocument(doc(cols + stack + sigs), 'pdf');
		expect(m.blocks.map(b => b.type)).toEqual(['applicants', 'applicants', 'signatures']);
		expect(m.blocks[0].props).toMatchObject({
			list: 'bf.first',
			layout: 'cols',
			photo: true,
			rowsField: 'personal',
		});
		expect(m.blocks[1].props).toMatchObject({
			layout: 'stack',
			secondField: 'professional',
			secondTitle: 'Professional details',
		});
		expect(m.blocks[2].props).toMatchObject({
			list: 'signRows',
			nameField: 'name',
			roleField: 'roleLabel',
			fallback: '<div class="sigbox">one</div>',
		});
		expect(compileDocument(m).replace(/\s+/g, '')).toBe(
			doc(cols + stack + sigs).replace(/\s+/g, ''),
		);
	});

	it('leaves cards it cannot write back the same as HTML', () => {
		const odd = cols.replace('<h4>', '<h4 class="z">');
		expect(importDocument(doc(odd), 'pdf').blocks.map(b => b.type)).toEqual(['html']);
	});

	it('writes new cards with the chosen fields', () => {
		expect(
			applicantsHtml({ list: 'al.applicants', titleField: 'name', rowsField: 'rows' }),
		).toContain(
			'<#list al.applicants as a><div class="col ap"><h4>${a.name}</h4><#list a.rows as r>',
		);
	});
});

describe('templates written in code come back the same', () => {
	it('keeps the shell, the style and the @page rule of a template it reads', () => {
		const html =
			'<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><style>@page{size:A4;margin:18mm}h1{x:y}</style></head><body class="b"><p>Hi ${a!\'\'}</p></body></html>';
		expect(compileDocument(importDocument(html, 'pdf')).replace(/\s+/g, '')).toBe(
			html.replace(/\s+/g, ''),
		);
	});

	it('reads a body guarded by <#if x??>...<#else>...</#if> and writes the guard back', () => {
		const html =
			'<html><head><style>a{}</style></head><body><#if al??><div class="sec">Unit</div><p>x</p><#else><p>No letter data.</p></#if></body></html>';
		const m = importDocument(html, 'pdf');
		expect(m.guard).toEqual({ cond: 'al??', fallback: '<p>No letter data.</p>' });
		expect(m.blocks.map(b => b.type)).toEqual(['heading', 'text']);
		expect(compileDocument(m).replace(/\s+/g, '')).toBe(html.replace(/\s+/g, ''));
		expect(splitIfElse('<#if a><#if b>x<#else>y</#if><#else>z</#if>')).toEqual({
			cond: 'a',
			then: '<#if b>x<#else>y</#if>',
			otherwise: 'z',
		});
	});

	it('writes a new @page once the page settings change', () => {
		const m = importDocument(
			'<html><head><style>@page{size:A4;margin:18mm}</style></head><body><p>x</p></body></html>',
			'pdf',
		);
		m.page = { ...m.page, size: 'Letter' };
		expect(compileDocument(m)).toContain('@page{size:Letter;margin:18mm 18mm 18mm 18mm;}');
	});
});

describe('helpers', () => {
	it('splits markup into top-level nodes with directives kept whole', () => {
		const n = topLevelNodes('<div>a</div><#if x><p>b</p></#if><br/>tail');
		expect(n).toEqual(['<div>a</div>', '<#if x><p>b</p></#if>', '<br/>', 'tail']);
	});

	it('puts the template CSS under the page view, leaving @page out', () => {
		const css = scopeCss(
			'@page{size:A4;@top-left{x:y}} body{color:red} .sec, h4{font-weight:bold}',
			'.p',
		);
		expect(css).toBe('.p{color:red}\n.p .sec,.p h4{font-weight:bold}\n');
	});
});

describe('compare with another version', () => {
	const { diffModels } = require('../docModel');
	const base = () => {
		const m = importDocument('', 'pdf');
		m.blocks = [
			block('heading', { text: 'Booking details' }),
			block('text', { html: '<p>One</p>' }),
			block('text', { html: '<p>Two</p>' }),
			block('pageBreak'),
		];
		return m;
	};
	it('finds what was added, changed and removed', () => {
		const before = base();
		const after = { ...before, blocks: [...before.blocks] };
		after.blocks[1] = { ...after.blocks[1], props: { html: '<p>One, changed</p>' } };
		after.blocks.splice(2, 1);
		after.blocks.push(block('heading', { text: 'New section' }));
		const d = diffModels(before, after);
		expect(d.status[after.blocks[1].id]).toBe('changed');
		expect(d.status[after.blocks[3].id]).toBe('added');
		expect(d.removed.map((r: any) => r.block.props.html)).toEqual(['<p>Two</p>']);
		expect(d.removed[0].after).toBe(after.blocks[1].id);
		expect(d.count).toBe(3);
	});
	it('says nothing changed for the same page, and notices a page setting', () => {
		const before = base();
		expect(diffModels(before, before).count).toBe(0);
		const after = { ...before, page: { ...before.page, size: 'Letter' as const } };
		expect(diffModels(before, after)).toMatchObject({ page: true, count: 1 });
	});
});
