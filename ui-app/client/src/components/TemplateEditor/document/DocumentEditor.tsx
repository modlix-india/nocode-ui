import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FieldList } from '../editors/VariablesPanel';
import { VariableEntry } from '../util/variableUtils';
import ChipText, { ChipContext, hasActiveText, insertFieldAtCursor } from './ChipText';
import {
	block,
	blockPaths,
	DocBlock,
	DocBlockType,
	DocModel,
	evalShowIf,
	FieldFormat,
	FieldRow,
	makeToken,
	parseToken,
	scopeCss,
	segments,
	ShowIf,
	ShowIfOp,
	TableColumn,
	valueAt,
	formatValue,
	DOC_BASE_STYLE,
	EMAIL_BASE_STYLE,
} from './docModel';

// Document mode: the template as the page it prints (or the email it sends). Blocks are edited in
// place; fields are named chips; any block can be shown only when a field passes a test; the
// preview can use a real record. Code mode stays one click away for the HTML underneath.

export type DocView = 'page' | 'pdf' | 'code';

export interface PreviewRecord {
	id: string;
	label: string;
}

interface DocumentEditorProps {
	model: DocModel;
	onModel: (m: DocModel) => void;
	kind: 'pdf' | 'email';
	variables: VariableEntry[];
	data: any;
	// Changes only when the data shown changes.
	dataKey: string;
	dataLabel: string;
	view: DocView;
	// Paths the last server render could not fill (from the preview's error), to mark their blocks.
	errorPaths: string[];
	subject?: string;
	onSubject?: (v: string) => void;
}

const ADD: Array<{
	type: DocBlockType;
	label: string;
	hint: string;
	icon: string;
	kinds: string[];
}> = [
	{
		type: 'title',
		label: 'Title band',
		hint: 'A grey band with the document title.',
		icon: 'fa-heading',
		kinds: ['pdf', 'email'],
	},
	{
		type: 'heading',
		label: 'Section heading',
		hint: 'A heading with a line under it.',
		icon: 'fa-grip-lines',
		kinds: ['pdf', 'email'],
	},
	{
		type: 'fields',
		label: 'Label and value',
		hint: 'Rows like Unit no: A-101, in one or two columns.',
		icon: 'fa-table-list',
		kinds: ['pdf', 'email'],
	},
	{
		type: 'table',
		label: 'Repeating table',
		hint: 'One row per item of a list: applicants, charges, the schedule.',
		icon: 'fa-table',
		kinds: ['pdf', 'email'],
	},
	{
		type: 'text',
		label: 'Text',
		hint: 'A paragraph with fields in it.',
		icon: 'fa-paragraph',
		kinds: ['pdf', 'email'],
	},
	{
		type: 'terms',
		label: 'Numbered terms',
		hint: 'Terms and conditions, numbered.',
		icon: 'fa-list-ol',
		kinds: ['pdf', 'email'],
	},
	{
		type: 'signatures',
		label: 'Signature boxes',
		hint: 'One box per person who signs.',
		icon: 'fa-signature',
		kinds: ['pdf'],
	},
	{
		type: 'button',
		label: 'Button',
		hint: 'A link that looks like a button.',
		icon: 'fa-hand-pointer',
		kinds: ['email'],
	},
	{
		type: 'image',
		label: 'Image',
		hint: 'A logo or a picture, from a field or an address.',
		icon: 'fa-image',
		kinds: ['pdf', 'email'],
	},
	{
		type: 'pageBreak',
		label: 'Page break',
		hint: 'What follows starts on a new page.',
		icon: 'fa-scissors',
		kinds: ['pdf'],
	},
	{
		type: 'spacer',
		label: 'Space',
		hint: 'Empty space between blocks.',
		icon: 'fa-arrows-up-down',
		kinds: ['pdf', 'email'],
	},
	{
		type: 'html',
		label: 'HTML',
		hint: 'Write the HTML yourself.',
		icon: 'fa-code',
		kinds: ['pdf', 'email'],
	},
];

const OPS: Array<{ op: ShowIfOp; label: string; needsValue?: boolean }> = [
	{ op: 'filled', label: 'has a value' },
	{ op: 'empty', label: 'is empty' },
	{ op: 'is', label: 'is', needsValue: true },
	{ op: 'isNot', label: 'is not', needsValue: true },
	{ op: 'yes', label: 'is yes' },
	{ op: 'no', label: 'is no' },
	{ op: 'more', label: 'is more than', needsValue: true },
];

const FORMATS: Array<{ f: FieldFormat; label: string }> = [
	{ f: 'plain', label: 'As it is' },
	{ f: 'amount', label: 'Amount, 1,23,456.00' },
	{ f: 'amount0', label: 'Amount, 1,23,456' },
	{ f: 'upper', label: 'CAPITALS' },
	{ f: 'lower', label: 'small letters' },
];

const SHORT: Record<string, string> = { k: 'Label', v: 'Value', n: 'No.', t: 'Term' };

function words(key: string) {
	if (SHORT[key]) return SHORT[key];
	const w = key.replace(/\[0\]/g, '').replace(/([a-z0-9])([A-Z])/g, '$1 $2');
	return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
}

function newBlock(type: DocBlockType, kind: 'pdf' | 'email'): DocBlock {
	switch (type) {
		case 'title':
			return block('title', { text: 'Title' });
		case 'heading':
			return block('heading', { text: 'Section' });
		case 'fields':
			return block('fields', {
				columns: kind === 'pdf' ? 2 : 1,
				rows: [{ label: 'Label', value: '' }],
			});
		case 'table':
			return block('table', {
				list: '',
				alias: 'row',
				columns: [{ label: 'Column', value: '' }],
			});
		case 'text':
			return block('text', { html: '' });
		case 'terms':
			return block('terms', { items: ['First term.'] });
		case 'signatures':
			return block('signatures', { count: 2, labels: ['Applicant', 'Co-applicant'] });
		case 'button':
			return block('button', { text: 'Open', href: '' });
		case 'image':
			return block('image', { src: '', width: '40mm' });
		case 'spacer':
			return block('spacer', { height: kind === 'pdf' ? 6 : 16 });
		case 'html':
			return block('html', { html: '<p></p>' });
	}
	return block(type);
}

export function blockTitle(b: DocBlock, labelOf: (p: string) => string): string {
	const strip = (s: string) =>
		(s ?? '')
			.replace(/\$\{([^}]*)\}/g, (_, x) => labelOf(parseToken(x)!.path))
			.replace(/<[^>]*>/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
	switch (b.type) {
		case 'title':
		case 'heading':
			return strip(b.props.text) || 'Heading';
		case 'fields':
			return b.props.list ? `Rows of ${labelOf(b.props.list)}` : 'Label and value';
		case 'table':
			return b.props.list ? `Table of ${labelOf(b.props.list)}` : 'Repeating table';
		case 'text':
			return strip(b.props.html).slice(0, 40) || 'Text';
		case 'terms':
			return 'Numbered terms';
		case 'signatures':
			return 'Signature boxes';
		case 'html':
			return 'HTML';
		case 'pageBreak':
			return 'Page break';
		case 'spacer':
			return 'Space';
		case 'image':
			return 'Image';
		case 'button':
			return strip(b.props.text) || 'Button';
	}
	return b.type;
}

export function showIfText(s: ShowIf | undefined, labelOf: (p: string) => string): string {
	if (!s || (!s.field && !s.raw)) return '';
	if (s.raw) return 'Shown only if a written condition holds';
	const op = OPS.find(o => o.op === s.op);
	return `Shown only if ${labelOf(s.field)} ${op?.label ?? s.op}${op?.needsValue ? ` ${s.value ?? ''}` : ''}`;
}

// Approximate look of an HTML block on the page: directives dropped, fields as chips.
function htmlPreview(html: string, ctx: ChipContext): string {
	return (html ?? '')
		.replace(/<script[\s\S]*?<\/script>/gi, '')
		.replace(/<\/?#[^>]*>/g, '')
		.replace(/\son\w+="[^"]*"/gi, '')
		.replace(/src="\$\{[^}]*\}"/g, 'src="" data-field-image="1"')
		.replace(/\$\{[^}]*\}/g, t => {
			const f = parseToken(t.slice(2, -1))!;
			const name = ctx.labelOf(f.path);
			return `<span class="_chip">${name.replace(/</g, '&lt;')}</span>`;
		});
}

export default function DocumentEditor({
	model,
	onModel,
	kind,
	variables,
	data,
	dataKey,
	dataLabel,
	view,
	errorPaths,
	subject,
	onSubject,
}: Readonly<DocumentEditorProps>) {
	const [rail, setRail] = useState<'add' | 'fields' | 'outline'>('add');
	const [selected, setSelected] = useState<string | undefined>();
	const [showData, setShowData] = useState(true);
	const [chipEdit, setChipEdit] = useState<
		{ token: string; replace: (n: string) => void } | undefined
	>();
	const pageRef = useRef<HTMLDivElement>(null);

	const labels = useMemo(() => {
		const m = new Map<string, string>();
		variables.forEach(v => m.set(v.path, v.label ?? words(v.path.split('.').pop() ?? v.path)));
		return m;
	}, [variables]);

	// Loop variables of list blocks (r in <#list bf.details as r>) map to their list's item fields.
	const labelOfIn = (alias?: string, list?: string) => (p: string) => {
		let path = p;
		if (alias && list && (p === alias || p.startsWith(alias + '.')))
			path = `${list}[0]${p.slice(alias.length)}`;
		return (
			labels.get(path) ??
			labels.get(path.replace(/\[0\]/g, '')) ??
			words(path.split('.').pop() ?? path)
		);
	};
	const labelOf = labelOfIn();

	const arrays = variables.filter(v => v.container && /ARRAY/i.test(v.type ?? ''));
	const leaves = variables.filter(v => !v.container);

	const setBlocks = (blocks: DocBlock[]) => onModel({ ...model, blocks });
	const updateBlock = (id: string, patch: Partial<DocBlock>) => {
		const upd = (list: DocBlock[]) => list.map(b => (b.id === id ? { ...b, ...patch } : b));
		onModel({
			...model,
			blocks: upd(model.blocks),
			page: { ...model.page, header: upd(model.page.header), footer: upd(model.page.footer) },
		});
	};
	const setProps = (b: DocBlock, patch: any) =>
		updateBlock(b.id, { props: { ...b.props, ...patch } });

	const insertBlock = (type: DocBlockType) => {
		const nb = newBlock(type, kind);
		const i = model.blocks.findIndex(b => b.id === selected);
		const next = [...model.blocks];
		next.splice(i >= 0 ? i + 1 : next.length, 0, nb);
		setBlocks(next);
		setSelected(nb.id);
		requestAnimationFrame(() =>
			pageRef.current
				?.querySelector(`[data-block="${nb.id}"]`)
				?.scrollIntoView({ block: 'center', behavior: 'smooth' }),
		);
	};

	const move = (id: string, d: number) => {
		const i = model.blocks.findIndex(b => b.id === id);
		const j = i + d;
		if (i < 0 || j < 0 || j >= model.blocks.length) return;
		const next = [...model.blocks];
		[next[i], next[j]] = [next[j], next[i]];
		setBlocks(next);
	};

	const pickField = (picked: string) => {
		// Fields picked in Document mode carry a value for when they are empty, so a record without
		// one still renders.
		const token = makeToken(parseToken(picked.slice(2, -1))!.path);
		if (insertFieldAtCursor(token)) return;
		// No text to put it in: add it as a line of its own after the selected block.
		const nb = block('text', { html: `<p>${token}</p>` });
		const i = model.blocks.findIndex(b => b.id === selected);
		const next = [...model.blocks];
		next.splice(i >= 0 ? i + 1 : next.length, 0, nb);
		setBlocks(next);
		setSelected(nb.id);
	};

	const all = [...model.page.header, ...model.blocks, ...model.page.footer];
	const sel = all.find(b => b.id === selected);
	const errorIds = new Set(
		all
			.filter(b =>
				blockPaths(b).some(p => errorPaths.some(e => e.startsWith(p) || p.startsWith(e))),
			)
			.map(b => b.id),
	);

	const cssScope = '.compTemplateEditor ._docPage';
	const scopedCss = useMemo(
		() =>
			scopeCss(
				kind === 'email'
					? EMAIL_BASE_STYLE + '\n' + (model.style ?? '')
					: model.style?.trim()
						? model.style
						: DOC_BASE_STYLE,
				cssScope,
			),
		[model.style, kind],
	);

	const ctxFor = (alias?: string, list?: string, item?: any): ChipContext => ({
		labelOf: labelOfIn(alias, list),
		data,
		dataKey,
		scope: alias ? { [alias]: item } : {},
		showData,
		list,
		alias,
	});

	const renderBlock = (b: DocBlock, where: 'body' | 'header' | 'footer') => {
		const p = b.props ?? {};
		const hidden = showData && data && !evalShowIf(b.showIf, data);
		const isSel = selected === b.id;
		const ctx = ctxFor();
		const chipClick = (token: string, replace: (n: string) => void) =>
			setChipEdit({ token, replace });
		let inner: React.ReactNode = null;
		switch (b.type) {
			case 'title':
				inner = (
					<ChipText
						className="band"
						singleLine
						value={p.text ?? ''}
						ctx={ctx}
						onChange={v => setProps(b, { text: v })}
						onChipClick={chipClick}
						onFocusText={() => setSelected(b.id)}
					/>
				);
				break;
			case 'heading':
				inner = (
					<ChipText
						className="sec"
						singleLine
						value={p.text ?? ''}
						ctx={ctx}
						onChange={v => setProps(b, { text: v })}
						onChipClick={chipClick}
						onFocusText={() => setSelected(b.id)}
					/>
				);
				break;
			case 'text':
				inner = (
					<ChipText
						className="_docText"
						placeholder="Write here. Click a field on the left to put it where the cursor is."
						value={p.html ?? ''}
						ctx={ctx}
						onChange={v => setProps(b, { html: v })}
						onChipClick={chipClick}
						onFocusText={() => setSelected(b.id)}
					/>
				);
				break;
			case 'fields': {
				const cls = (p.columns ?? 1) === 2 ? 'two' : 'one';
				if (p.list) {
					const items: any[] = showData ? (valueAt(data, p.list) ?? []) : [];
					const rows =
						items.length > 0
							? items.map((it, i) => (
									<div className="kv" key={i}>
										<span className="k">{`${it?.k ?? ''}`}</span>
										<span className="v">{`${it?.v ?? ''}`}</span>
									</div>
								))
							: [0, 1, 2].map(i => (
									<div className="kv" key={i}>
										<span className="k">
											<span className="_chip">
												{labelOfIn(p.alias, p.list)(`${p.alias}.k`)}
											</span>
										</span>
										<span className="v">
											<span className="_chip">
												{labelOfIn(p.alias, p.list)(`${p.alias}.v`)}
											</span>
										</span>
									</div>
								));
					inner = (
						<>
							<div className={cls}>{rows}</div>
							<div className="_docNote">
								One row for each item of {labelOf(p.list)}
								{showData && data && items.length === 0
									? ': none for this record'
									: ''}
							</div>
						</>
					);
				} else {
					inner = (
						<div className={cls}>
							{((p.rows ?? []) as FieldRow[]).map((r, i) => (
								<div className="kv" key={i}>
									<span className="k">
										<ChipText
											singleLine
											value={r.label}
											ctx={ctx}
											onChange={v => {
												const rows = [...p.rows];
												rows[i] = { ...rows[i], label: v };
												setProps(b, { rows });
											}}
											onFocusText={() => setSelected(b.id)}
										/>
									</span>
									<span className="v">
										<ChipText
											singleLine
											value={r.value}
											placeholder="Click a field"
											ctx={ctx}
											onChange={v => {
												const rows = [...p.rows];
												rows[i] = { ...rows[i], value: v };
												setProps(b, { rows });
											}}
											onChipClick={chipClick}
											onFocusText={() => setSelected(b.id)}
										/>
									</span>
								</div>
							))}
						</div>
					);
				}
				break;
			}
			case 'table': {
				const cols = (p.columns ?? []) as TableColumn[];
				const items: any[] = showData && p.list ? (valueAt(data, p.list) ?? []) : [];
				const lab = labelOfIn(p.alias, p.list);
				inner = (
					<>
						<table className={p.cls || 'rt'}>
							<tbody>
								<tr>
									{cols.map((c, i) => (
										<th
											key={i}
											style={c.width ? { width: c.width } : undefined}
										>
											<ChipText
												singleLine
												value={c.label}
												ctx={ctx}
												onChange={v => {
													const columns = [...cols];
													columns[i] = { ...columns[i], label: v };
													setProps(b, { columns });
												}}
												onFocusText={() => setSelected(b.id)}
											/>
										</th>
									))}
								</tr>
								{(items.length > 0 ? items.slice(0, 12) : [undefined]).map(
									(it, r) => (
										<tr key={r}>
											{cols.map((c, i) => (
												<td key={i}>
													{r === 0 ? (
														<ChipText
															singleLine
															value={c.value}
															placeholder="Click a field"
															ctx={ctxFor(p.alias, p.list, it)}
															onChange={v => {
																const columns = [...cols];
																columns[i] = {
																	...columns[i],
																	value: v,
																};
																setProps(b, { columns });
															}}
															onChipClick={chipClick}
															onFocusText={() => setSelected(b.id)}
														/>
													) : (
														<span
															dangerouslySetInnerHTML={{
																__html: segments(c.value)
																	.map(sg =>
																		sg.field
																			? formatValue(
																					valueAt(
																						data,
																						sg.field
																							.path,
																						{
																							[p.alias]:
																								it,
																						},
																					),
																					sg.field,
																				).replace(
																					/</g,
																					'&lt;',
																				)
																			: (sg.text ?? ''),
																	)
																	.join(''),
															}}
														/>
													)}
												</td>
											))}
										</tr>
									),
								)}
							</tbody>
						</table>
						<div className="_docNote">
							{p.list
								? `One row for each item of ${lab(p.list)}`
								: 'Pick the list it repeats for, on the right'}
						</div>
					</>
				);
				break;
			}
			case 'terms': {
				const items: any[] = p.list
					? showData
						? (valueAt(data, p.list) ?? [])
						: []
					: (p.items ?? []);
				inner = p.list ? (
					<>
						<ol>
							{(items.length ? items : [labelOf(p.list)]).map((t, i) => (
								<li key={i}>{`${t}`}</li>
							))}
						</ol>
						<div className="_docNote">One line for each of {labelOf(p.list)}</div>
					</>
				) : (
					<ol>
						{items.map((t: string, i: number) => (
							<li key={i}>
								<ChipText
									value={t}
									ctx={ctx}
									onChange={v => {
										const next = [...p.items];
										next[i] = v;
										setProps(b, { items: next });
									}}
									onChipClick={chipClick}
									onFocusText={() => setSelected(b.id)}
								/>
							</li>
						))}
					</ol>
				);
				break;
			}
			case 'signatures': {
				const people: any[] = p.list ? (showData ? (valueAt(data, p.list) ?? []) : []) : [];
				const boxes = p.list
					? (people.length ? people : [{}, {}]).map(
							x => `${x?.[p.nameField || 'name'] ?? 'Name'}`,
						)
					: Array.from({ length: Math.max(1, Number(p.count) || 1) }).map(
							(_, i) => (p.labels ?? [])[i] ?? 'Signature',
						);
				inner = (
					<div className="sigs">
						{boxes.map((n, i) => (
							<div className="sigbox" key={i}>
								<div className="sigarea" />
								<div className="sigcap">
									<b>{n}</b>
								</div>
								<div className="sigcap">Date :</div>
							</div>
						))}
					</div>
				);
				break;
			}
			case 'button':
				inner = (
					<p>
						<span className="btn">
							<ChipText
								singleLine
								value={p.text ?? ''}
								ctx={ctx}
								onChange={v => setProps(b, { text: v })}
								onFocusText={() => setSelected(b.id)}
							/>
						</span>
					</p>
				);
				break;
			case 'image': {
				const f = /^\$\{([^}]*)\}$/.exec(p.src ?? '');
				const src = f ? valueAt(data, parseToken(f[1])!.path) : p.src;
				inner = src ? (
					<img
						src={src}
						style={{ width: p.width || undefined, maxWidth: '100%' }}
						alt=""
					/>
				) : (
					<div className="_docPlaceholder">
						<i className="fa fa-regular fa-image" />{' '}
						{f
							? `${labelOf(parseToken(f[1])!.path)}: empty`
							: 'Image: set its address on the right'}
					</div>
				);
				break;
			}
			case 'pageBreak':
				inner = (
					<div className="_docBreak">Page break: what follows starts on a new page</div>
				);
				break;
			case 'spacer':
				inner = (
					<div
						className="_docSpacer"
						style={{
							height: `${Number(p.height) || 6}${kind === 'pdf' ? 'mm' : 'px'}`,
						}}
					/>
				);
				break;
			case 'html':
				inner = (
					<div className="_docHtml">
						<div dangerouslySetInnerHTML={{ __html: htmlPreview(p.html ?? '', ctx) }} />
					</div>
				);
				break;
		}
		const tag = showIfText(b.showIf, labelOf);
		return (
			<div
				key={b.id}
				data-block={b.id}
				className={`_docBlock _t_${b.type} ${isSel ? '_sel' : ''} ${hidden ? '_hiddenNow' : ''} ${errorIds.has(b.id) ? '_err' : ''}`}
				onMouseDown={() => setSelected(b.id)}
			>
				{(tag || b.type === 'html') && (
					<div className="_docTags">
						{b.type === 'html' && <span className="_docTag">HTML</span>}
						{tag && (
							<span className="_docTag _if" title={tag}>
								<i className="fa fa-solid fa-eye" /> {tag}
								{hidden ? ' (hidden for this record)' : ''}
							</span>
						)}
					</div>
				)}
				{inner}
				{isSel && where === 'body' && (
					<div className="_docBlockBar" onMouseDown={e => e.stopPropagation()}>
						<button title="Move up" onClick={() => move(b.id, -1)}>
							<i className="fa fa-solid fa-arrow-up" />
						</button>
						<button title="Move down" onClick={() => move(b.id, 1)}>
							<i className="fa fa-solid fa-arrow-down" />
						</button>
						<button
							title="Copy"
							onClick={() => {
								const i = model.blocks.findIndex(x => x.id === b.id);
								const copy = {
									...JSON.parse(JSON.stringify(b)),
									id: block(b.type).id,
								};
								const next = [...model.blocks];
								next.splice(i + 1, 0, copy);
								setBlocks(next);
							}}
						>
							<i className="fa fa-regular fa-copy" />
						</button>
						<button
							title="Remove"
							onClick={() => {
								setBlocks(model.blocks.filter(x => x.id !== b.id));
								setSelected(undefined);
							}}
						>
							<i className="fa fa-regular fa-trash-can" />
						</button>
					</div>
				)}
			</div>
		);
	};

	// ------------------------------------------------------------------ inspector (right)
	const inspector = sel && (
		<aside className="_docInspector">
			<div className="_docInspectorHead">
				<span>{ADD.find(a => a.type === sel.type)?.label ?? sel.type}</span>
				<button className="_iconBtn" title="Close" onClick={() => setSelected(undefined)}>
					<i className="fa fa-solid fa-xmark" />
				</button>
			</div>
			<BlockSettings
				b={sel}
				kind={kind}
				arrays={arrays}
				leaves={leaves}
				labelOf={labelOf}
				setProps={patch => setProps(sel, patch)}
			/>
			{model.page.header.every(h => h.id !== sel.id) &&
				model.page.footer.every(h => h.id !== sel.id) && (
					<ShowIfEditor
						value={sel.showIf}
						fields={variables}
						labelOf={labelOf}
						onChange={s => updateBlock(sel.id, { showIf: s })}
					/>
				)}
		</aside>
	);

	const pageStyle: React.CSSProperties =
		kind === 'pdf'
			? {
					width: model.page.size === 'A4' ? '210mm' : '216mm',
					minHeight: model.page.size === 'A4' ? '297mm' : '279mm',
					padding: `0 ${model.page.margin.right}mm 0 ${model.page.margin.left}mm`,
				}
			: { width: 600 };

	return (
		<div className="_doc">
			{view === 'page' && (
				<aside className="_docRail">
					<div className="_segmented _docRailTabs">
						<button
							className={rail === 'add' ? '_on' : ''}
							onClick={() => setRail('add')}
						>
							Add
						</button>
						<button
							className={rail === 'fields' ? '_on' : ''}
							onClick={() => setRail('fields')}
						>
							Fields
						</button>
						<button
							className={rail === 'outline' ? '_on' : ''}
							onClick={() => setRail('outline')}
						>
							Outline
						</button>
					</div>
					{rail === 'add' && (
						<div className="_docAdd">
							<p className="_panelHint">
								Click to add it{' '}
								{selected ? 'after the selected block' : 'at the end'}.
							</p>
							{ADD.filter(a => a.kinds.includes(kind)).map(a => (
								<button
									key={a.type}
									className="_docAddItem"
									onClick={() => insertBlock(a.type)}
								>
									<i className={`fa fa-solid ${a.icon}`} />
									<span>
										<b>{a.label}</b>
										<small>{a.hint}</small>
									</span>
								</button>
							))}
						</div>
					)}
					{rail === 'fields' && (
						<FieldList
							schema={{ type: 'OBJECT', properties: {} }}
							entries={variables}
							onInsert={pickField}
							hideTokens
							hint={
								hasActiveText()
									? 'Click a field to put it where the cursor is.'
									: 'Click in a text first, then click a field. Without a cursor it is added as a new line.'
							}
						/>
					)}
					{rail === 'outline' && (
						<div className="_docOutline">
							{model.blocks.map(b => (
								<button
									key={b.id}
									className={`_docOutlineItem ${selected === b.id ? '_on' : ''} ${b.type === 'heading' || b.type === 'title' ? '_head' : ''}`}
									onClick={() => {
										setSelected(b.id);
										pageRef.current
											?.querySelector(`[data-block="${b.id}"]`)
											?.scrollIntoView({
												block: 'center',
												behavior: 'smooth',
											});
									}}
								>
									{blockTitle(b, labelOf)}
									{b.showIf && (
										<i
											className="fa fa-solid fa-eye"
											title={showIfText(b.showIf, labelOf)}
										/>
									)}
								</button>
							))}
						</div>
					)}
				</aside>
			)}

			{view === 'page' && (
				<div
					className="_docStage"
					onMouseDown={e => e.target === e.currentTarget && setSelected(undefined)}
				>
					<div className="_docStageBar">
						<label className="_docToggle">
							<input
								type="checkbox"
								checked={showData}
								onChange={e => setShowData(e.target.checked)}
							/>
							<span>Show {dataLabel}</span>
						</label>
					</div>
					<style>{scopedCss}</style>
					{kind === 'email' && onSubject && (
						<div className="_docSubject" style={{ width: 600 }}>
							<span>Subject</span>
							<ChipText
								singleLine
								value={subject ?? ''}
								ctx={ctxFor()}
								onChange={onSubject}
							/>
						</div>
					)}
					<div className={`_docPage _${kind}`} style={pageStyle} ref={pageRef}>
						{kind === 'pdf' && (
							<div
								className="_docBand _docHeader"
								style={{ minHeight: `${model.page.margin.top}mm` }}
								onMouseDown={e => e.stopPropagation()}
							>
								<span className="_docBandLabel">Header, on every page</span>
								{model.page.header.length ? (
									model.page.header.map(b => renderBlock(b, 'header'))
								) : (
									<button
										className="_docBandAdd"
										onClick={() =>
											onModel({
												...model,
												page: {
													...model.page,
													header: [
														block('text', {
															html: `<p>${makeToken('tenant.name', 'plain', '')}</p>`,
														}),
													],
												},
											})
										}
									>
										+ Add a header
									</button>
								)}
							</div>
						)}
						<div className="_docBody">
							{model.blocks.length === 0 && (
								<div className="_docEmpty">
									Add a block from the left to start the page.
								</div>
							)}
							{model.blocks.map(b => renderBlock(b, 'body'))}
						</div>
						{kind === 'pdf' && (
							<div
								className="_docBand _docFooter"
								style={{ minHeight: `${model.page.margin.bottom}mm` }}
								onMouseDown={e => e.stopPropagation()}
							>
								<span className="_docBandLabel">Footer, on every page</span>
								{model.page.footer.map(b => renderBlock(b, 'footer'))}
								{model.page.pageNumbers && <span className="_docPageNo">01</span>}
							</div>
						)}
					</div>
				</div>
			)}

			{view === 'page' &&
				(inspector || <PageSettings model={model} onModel={onModel} kind={kind} />)}

			{chipEdit && (
				<ChipEditor
					token={chipEdit.token}
					labelOf={labelOf}
					onClose={() => setChipEdit(undefined)}
					onApply={next => {
						chipEdit.replace(next);
						setChipEdit(undefined);
					}}
				/>
			)}
		</div>
	);
}

// ------------------------------------------------------------------ pieces

// "The case: " before a field name, so two fields with the same name can be told apart (no code).
function groupOf(path: string, options: VariableEntry[], labelOf: (p: string) => string): string {
	const parent = path.replace(/\.[^.]*$/, '');
	if (parent === path) return '';
	const o = options.find(x => x.path === parent);
	return `${o?.label ?? labelOf(parent)}: `;
}

function FieldSelect({
	value,
	options,
	labelOf,
	onChange,
	placeholder,
}: Readonly<{
	value?: string;
	options: VariableEntry[];
	labelOf: (p: string) => string;
	onChange: (path: string) => void;
	placeholder?: string;
}>) {
	return (
		<select className="_fld" value={value ?? ''} onChange={e => onChange(e.target.value)}>
			<option value="">{placeholder ?? 'Pick a field'}</option>
			{options.map(o => (
				<option key={o.path} value={o.path.replace(/\[0\]/g, '')}>
					{groupOf(o.path, options, labelOf) + (o.label ?? labelOf(o.path))}
				</option>
			))}
		</select>
	);
}

function BlockSettings({
	b,
	kind,
	arrays,
	leaves,
	labelOf,
	setProps,
}: Readonly<{
	b: DocBlock;
	kind: 'pdf' | 'email';
	arrays: VariableEntry[];
	leaves: VariableEntry[];
	labelOf: (p: string) => string;
	setProps: (patch: any) => void;
}>) {
	const p = b.props ?? {};
	const itemFields = (list: string) =>
		leaves
			.filter(l => l.path.startsWith(`${list}[0].`))
			.map(l => ({ ...l, path: l.path.slice(`${list}[0].`.length) }));
	switch (b.type) {
		case 'title':
		case 'heading':
		case 'text':
			return (
				<p className="_panelHint">
					Type on the page. To add a field, click where it goes, then click the field in
					Fields on the left. Click a field on the page to change how it shows.
				</p>
			);
		case 'fields':
			return (
				<div className="_docSettings">
					<label className="_field">
						<span>Rows come from</span>
						<select
							className="_fld"
							value={p.list ? 'list' : 'rows'}
							onChange={e =>
								setProps(
									e.target.value === 'list'
										? {
												list: arrays[0]?.path ?? '',
												alias: 'r',
												rows: undefined,
											}
										: {
												list: undefined,
												rows: p.rows ?? [{ label: 'Label', value: '' }],
											},
								)
							}
						>
							<option value="rows">Rows I choose</option>
							<option value="list">
								A list in the data (label and value per item)
							</option>
						</select>
					</label>
					{p.list !== undefined && (
						<label className="_field">
							<span>List</span>
							<FieldSelect
								value={p.list}
								options={arrays}
								labelOf={labelOf}
								onChange={v => setProps({ list: v })}
							/>
						</label>
					)}
					<label className="_field">
						<span>Columns</span>
						<select
							className="_fld"
							value={p.columns ?? 1}
							onChange={e => setProps({ columns: Number(e.target.value) })}
						>
							<option value={1}>One</option>
							<option value={2}>Two</option>
						</select>
					</label>
					{!p.list && (
						<>
							{((p.rows ?? []) as FieldRow[]).map((r, i) => (
								<div className="_kvRow" key={i}>
									<input
										className="_fld"
										value={r.label}
										onChange={e => {
											const rows = [...p.rows];
											rows[i] = { ...rows[i], label: e.target.value };
											setProps({ rows });
										}}
									/>
									<FieldSelect
										value={
											parseToken(
												(/\$\{([^}]*)\}/.exec(r.value) ?? [])[1] ?? '',
											)?.path
										}
										options={leaves}
										labelOf={labelOf}
										onChange={v => {
											const rows = [...p.rows];
											rows[i] = { ...rows[i], value: v ? makeToken(v) : '' };
											setProps({ rows });
										}}
									/>
									<button
										className="_iconBtn"
										title="Remove the row"
										onClick={() =>
											setProps({
												rows: p.rows.filter((_: any, j: number) => j !== i),
											})
										}
									>
										<i className="fa fa-regular fa-trash-can" />
									</button>
								</div>
							))}
							<button
								className="_addBtn"
								onClick={() =>
									setProps({
										rows: [...(p.rows ?? []), { label: 'Label', value: '' }],
									})
								}
							>
								<i className="fa fa-solid fa-plus" /> Add a row
							</button>
						</>
					)}
				</div>
			);
		case 'table': {
			const cols = (p.columns ?? []) as TableColumn[];
			const fields = p.list ? itemFields(p.list) : [];
			const alias = p.alias || 'row';
			return (
				<div className="_docSettings">
					<label className="_field">
						<span>One row for each item of</span>
						<FieldSelect
							value={p.list}
							options={arrays}
							labelOf={labelOf}
							onChange={v => setProps({ list: v })}
							placeholder="Pick a list"
						/>
					</label>
					<span className="_fieldLabel">Columns</span>
					{cols.map((c, i) => (
						<div className="_kvRow" key={i}>
							<input
								className="_fld"
								value={c.label.replace(/<[^>]*>/g, '')}
								onChange={e => {
									const columns = [...cols];
									columns[i] = { ...columns[i], label: e.target.value };
									setProps({ columns });
								}}
							/>
							<select
								className="_fld"
								value={
									parseToken(
										(/\$\{([^}]*)\}/.exec(c.value) ?? [])[1] ?? '',
									)?.path.replace(`${alias}.`, '') ?? ''
								}
								onChange={e => {
									const columns = [...cols];
									columns[i] = {
										...columns[i],
										value: e.target.value
											? makeToken(`${alias}.${e.target.value}`)
											: '',
									};
									setProps({ columns });
								}}
							>
								<option value="">Pick a field</option>
								{fields.map(f => (
									<option key={f.path} value={f.path}>
										{f.label ?? f.path}
									</option>
								))}
							</select>
							<button
								className="_iconBtn"
								title="Remove the column"
								onClick={() =>
									setProps({ columns: cols.filter((_, j) => j !== i) })
								}
							>
								<i className="fa fa-regular fa-trash-can" />
							</button>
						</div>
					))}
					<button
						className="_addBtn"
						onClick={() =>
							setProps({ columns: [...cols, { label: 'Column', value: '' }] })
						}
					>
						<i className="fa fa-solid fa-plus" /> Add a column
					</button>
				</div>
			);
		}
		case 'terms':
			return (
				<div className="_docSettings">
					<label className="_field">
						<span>Terms come from</span>
						<select
							className="_fld"
							value={p.list ? 'list' : 'items'}
							onChange={e =>
								setProps(
									e.target.value === 'list'
										? { list: arrays[0]?.path ?? '', alias: 't' }
										: { list: undefined, items: p.items ?? ['First term.'] },
								)
							}
						>
							<option value="items">Terms I write here</option>
							<option value="list">A list in the data</option>
						</select>
					</label>
					{p.list !== undefined ? (
						<FieldSelect
							value={p.list}
							options={arrays}
							labelOf={labelOf}
							onChange={v => setProps({ list: v })}
						/>
					) : (
						<button
							className="_addBtn"
							onClick={() => setProps({ items: [...(p.items ?? []), 'New term.'] })}
						>
							<i className="fa fa-solid fa-plus" /> Add a term
						</button>
					)}
				</div>
			);
		case 'signatures':
			return (
				<div className="_docSettings">
					<label className="_field">
						<span>Boxes</span>
						<select
							className="_fld"
							value={p.list ? 'list' : 'count'}
							onChange={e =>
								setProps(
									e.target.value === 'list'
										? {
												list:
													arrays.find(a => /sign/i.test(a.path))?.path ??
													arrays[0]?.path,
												nameField: 'name',
												roleField: 'roleLabel',
											}
										: { list: undefined, count: 2 },
								)
							}
						>
							<option value="count">A fixed number</option>
							<option value="list">One per person in a list</option>
						</select>
					</label>
					{p.list !== undefined ? (
						<FieldSelect
							value={p.list}
							options={arrays}
							labelOf={labelOf}
							onChange={v => setProps({ list: v })}
						/>
					) : (
						<input
							className="_fld"
							type="number"
							min={1}
							max={6}
							value={p.count ?? 1}
							onChange={e => setProps({ count: Number(e.target.value) })}
						/>
					)}
				</div>
			);
		case 'image':
			return (
				<div className="_docSettings">
					<label className="_field">
						<span>Picture from a field</span>
						<FieldSelect
							value={
								parseToken((/\$\{([^}]*)\}/.exec(p.src ?? '') ?? [])[1] ?? '')?.path
							}
							options={leaves.filter(l => /logo|image|photo|url|src/i.test(l.path))}
							labelOf={labelOf}
							onChange={v => setProps({ src: v ? `\${${v}!''}` : '' })}
						/>
					</label>
					<label className="_field">
						<span>Or an address</span>
						<input
							className="_fld"
							value={/^\$\{/.test(p.src ?? '') ? '' : (p.src ?? '')}
							onChange={e => setProps({ src: e.target.value })}
						/>
					</label>
					<label className="_field">
						<span>Width</span>
						<input
							className="_fld"
							value={p.width ?? ''}
							placeholder={kind === 'pdf' ? '40mm' : '200px'}
							onChange={e => setProps({ width: e.target.value })}
						/>
					</label>
				</div>
			);
		case 'spacer':
			return (
				<label className="_field">
					<span>Height ({kind === 'pdf' ? 'mm' : 'px'})</span>
					<input
						className="_fld"
						type="number"
						value={p.height ?? 6}
						onChange={e => setProps({ height: Number(e.target.value) })}
					/>
				</label>
			);
		case 'button':
			return (
				<label className="_field">
					<span>Opens</span>
					<input
						className="_fld"
						value={p.href ?? ''}
						placeholder="https://... or a field"
						onChange={e => setProps({ href: e.target.value })}
					/>
				</label>
			);
		case 'html':
			return (
				<div className="_docSettings">
					<p className="_panelHint">
						This part is HTML the page cannot split into blocks. Edit it here; the page
						shows it roughly, the PDF view shows it exactly.
					</p>
					<textarea
						className="_fld _docHtmlEdit"
						value={p.html ?? ''}
						onChange={e => setProps({ html: e.target.value })}
					/>
				</div>
			);
	}
	return null;
}

function ShowIfEditor({
	value,
	fields,
	labelOf,
	onChange,
}: Readonly<{
	value?: ShowIf;
	fields: VariableEntry[];
	labelOf: (p: string) => string;
	onChange: (s: ShowIf | undefined) => void;
}>) {
	const on = !!value;
	const op = OPS.find(o => o.op === value?.op);
	return (
		<div className="_docShowIf">
			<label className="_docToggle">
				<input
					type="checkbox"
					checked={on}
					onChange={e =>
						onChange(e.target.checked ? { field: '', op: 'filled' } : undefined)
					}
				/>
				<span>Show only if</span>
			</label>
			{value && !value.raw && (
				<>
					<FieldSelect
						value={value.field}
						options={fields}
						labelOf={labelOf}
						onChange={f => onChange({ ...value, field: f })}
					/>
					<select
						className="_fld"
						value={value.op}
						onChange={e => onChange({ ...value, op: e.target.value as ShowIfOp })}
					>
						{OPS.map(o => (
							<option key={o.op} value={o.op}>
								{o.label}
							</option>
						))}
					</select>
					{op?.needsValue && (
						<input
							className="_fld"
							value={value.value ?? ''}
							placeholder="Value"
							onChange={e => onChange({ ...value, value: e.target.value })}
						/>
					)}
				</>
			)}
			{value?.raw && (
				<p className="_panelHint">
					Written in Code: <code>{value.raw}</code>
				</p>
			)}
		</div>
	);
}

function PageSettings({
	model,
	onModel,
	kind,
}: Readonly<{ model: DocModel; onModel: (m: DocModel) => void; kind: 'pdf' | 'email' }>) {
	if (kind !== 'pdf') return null;
	const pg = model.page;
	const set = (patch: any) => onModel({ ...model, page: { ...pg, ...patch } });
	const m = pg.margin;
	return (
		<aside className="_docInspector">
			<div className="_docInspectorHead">
				<span>Page</span>
			</div>
			<p className="_panelHint">Click a block on the page to change it.</p>
			<label className="_field">
				<span>Paper</span>
				<select
					className="_fld"
					value={pg.size}
					onChange={e => set({ size: e.target.value })}
				>
					<option value="A4">A4</option>
					<option value="Letter">Letter</option>
				</select>
			</label>
			<span className="_fieldLabel">Margins (mm): top, right, bottom, left</span>
			<div className="_kvRow">
				{(['top', 'right', 'bottom', 'left'] as const).map(k => (
					<input
						key={k}
						className="_fld"
						type="number"
						value={m[k]}
						title={k}
						onChange={e => set({ margin: { ...m, [k]: Number(e.target.value) } })}
					/>
				))}
			</div>
			<label className="_docToggle">
				<input
					type="checkbox"
					checked={pg.pageNumbers}
					onChange={e => set({ pageNumbers: e.target.checked })}
				/>
				<span>Page numbers</span>
			</label>
		</aside>
	);
}

function ChipEditor({
	token,
	labelOf,
	onApply,
	onClose,
}: Readonly<{
	token: string;
	labelOf: (p: string) => string;
	onApply: (t: string) => void;
	onClose: () => void;
}>) {
	const f = parseToken(token.slice(2, -1))!;
	const [format, setFormat] = useState<FieldFormat>(f.format);
	const [fallback, setFallback] = useState(f.fallback ?? '-');
	useEffect(() => {
		const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
		window.addEventListener('keydown', k);
		return () => window.removeEventListener('keydown', k);
	}, [onClose]);
	return (
		<div className="_chipEditor" role="dialog">
			<div className="_docInspectorHead">
				<span>{labelOf(f.path)}</span>
				<button className="_iconBtn" title="Close" onClick={onClose}>
					<i className="fa fa-solid fa-xmark" />
				</button>
			</div>
			<label className="_field">
				<span>Show as</span>
				<select
					className="_fld"
					value={format}
					onChange={e => setFormat(e.target.value as FieldFormat)}
				>
					{FORMATS.map(x => (
						<option key={x.f} value={x.f}>
							{x.label}
						</option>
					))}
				</select>
			</label>
			{!format.startsWith('amount') && (
				<label className="_field">
					<span>When it is empty, show</span>
					<input
						className="_fld"
						value={fallback}
						onChange={e => setFallback(e.target.value)}
					/>
				</label>
			)}
			<button
				className="_docPrimary"
				onClick={() => onApply(makeToken(f.path, format, fallback).slice(0))}
			>
				Apply
			</button>
		</div>
	);
}
