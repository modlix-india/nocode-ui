import React, { CSSProperties, useId, useRef } from 'react';
import {
	AutomationDoc,
	AutomationNode,
	Catalog,
	CatalogParam,
	ConditionGroup,
	ConditionLeaf,
	OptionsRef,
	TRIGGER_KEY,
	Variable,
} from './automationTypes';
import { cloneDoc, updateNode } from './editOps';
import { fromPeriod, PeriodUnit, toPeriod } from './period';
import {
	conditionToWords,
	findAction,
	findTrigger,
	isGroup,
	nodeTitle,
	OPERATORS,
	operatorNeedsValue,
	pickLabel,
	variablesFor,
} from './sentences';
import { useOptions } from './useOptions';

/**
 * The side panel for the selected card: one form per card type, each writing
 * the whole document back through `onChange`. Plain inputs on purpose, styled
 * by the component's own sheet, so the panel works the same on a page and in
 * the chat.
 */

interface PanelProps {
	doc: AutomationDoc;
	catalog?: Catalog;
	nodeKey: string;
	appCode?: string;
	onChange: (doc: AutomationDoc) => void;
	onClose: () => void;
	style?: CSSProperties;
	slot?: React.ReactNode;
}

const UNITS: Array<{ value: PeriodUnit; label: string }> = [
	{ value: 'days', label: 'days' },
	{ value: 'hours', label: 'hours' },
	{ value: 'minutes', label: 'minutes' },
];

const asPath = (v: string) => `{{${v}}}`;
const pathOf = (v: any): string => {
	const m = /^\{\{\s*([^}]+?)\s*\}\}$/.exec(String(v ?? ''));
	return m ? m[1] : '';
};

function Field({
	label,
	children,
	hint,
}: {
	label: string;
	children: React.ReactNode;
	hint?: string;
}) {
	const id = useId();
	return (
		<div className="_afField">
			<label className="_afFieldLabel" htmlFor={id}>
				{label}
			</label>
			{React.Children.map(children, (c, i) =>
				i === 0 && React.isValidElement(c)
					? React.cloneElement(c as React.ReactElement<any>, { id })
					: c,
			)}
			{hint && <span className="_afHint">{hint}</span>}
		</div>
	);
}

/** A select of the options a function answers, falling back to free text while none have arrived. */
function OptionsInput({
	options: ref,
	appCode,
	value,
	onChange,
	id,
	placeholder,
}: {
	options: OptionsRef;
	appCode?: string;
	value: any;
	onChange: (v: any) => void;
	id?: string;
	placeholder?: string;
}) {
	const opts = useOptions(ref, appCode);
	if (!opts.length)
		return (
			<input
				id={id}
				className="_afInput"
				value={value ?? ''}
				placeholder={placeholder}
				onChange={e => onChange(e.target.value)}
			/>
		);
	const known = opts.some(o => String(o.value) === String(value));
	return (
		<select
			id={id}
			className="_afSelect"
			value={known ? String(value) : ''}
			onChange={e => {
				const o = opts.find(x => String(x.value) === e.target.value);
				onChange(o ? o.value : e.target.value);
			}}
		>
			<option value="">{value && !known ? String(value) : 'Choose…'}</option>
			{opts.map(o => (
				<option key={String(o.value)} value={String(o.value)}>
					{o.label}
				</option>
			))}
		</select>
	);
}

/** A text input with an "Insert" picker that drops a `{{path}}` in at the cursor. */
function VariableInput({
	value,
	onChange,
	vars,
	id,
	label,
}: {
	value: any;
	onChange: (v: string) => void;
	vars: Variable[];
	id?: string;
	label: string;
}) {
	const ref = useRef<HTMLInputElement>(null);
	const text = value === undefined || value === null ? '' : String(value);
	return (
		<span className="_afVarInput">
			<input
				id={id}
				ref={ref}
				className="_afInput"
				value={text}
				onChange={e => onChange(e.target.value)}
			/>
			{vars.length > 0 && (
				<select
					className="_afSelect _afInsert"
					aria-label={`Insert a value into ${label}`}
					value=""
					onChange={e => {
						if (!e.target.value) return;
						const el = ref.current;
						const at = el?.selectionStart ?? text.length;
						const end = el?.selectionEnd ?? at;
						onChange(text.slice(0, at) + asPath(e.target.value) + text.slice(end));
					}}
				>
					<option value="">Insert…</option>
					{vars.map(v => (
						<option key={v.path} value={v.path}>
							{pickLabel(v)}
						</option>
					))}
				</select>
			)}
		</span>
	);
}

function PeriodInput({
	value,
	onChange,
	label,
}: {
	value?: string;
	onChange: (p: string) => void;
	label: string;
}) {
	const { amount, unit } = fromPeriod(value);
	return (
		<span className="_afPeriod">
			<input
				className="_afInput _afNumber"
				type="number"
				min={0}
				aria-label={`${label}: amount`}
				value={amount}
				onChange={e => onChange(toPeriod(Number(e.target.value), unit))}
			/>
			<select
				className="_afSelect"
				aria-label={`${label}: unit`}
				value={unit}
				onChange={e => onChange(toPeriod(amount, e.target.value as PeriodUnit))}
			>
				{UNITS.map(u => (
					<option key={u.value} value={u.value}>
						{u.label}
					</option>
				))}
			</select>
		</span>
	);
}

// ───────────────────────────── conditions ─────────────────────────────

function ConditionRow({
	leaf,
	vars,
	appCode,
	onChange,
	onRemove,
	index,
}: {
	leaf: ConditionLeaf;
	vars: Variable[];
	appCode?: string;
	onChange: (l: ConditionLeaf) => void;
	onRemove: () => void;
	index: number;
}) {
	const v = vars.find(x => x.path === leaf.field);
	const op = OPERATORS.find(o => o.value === leaf.operator);
	const n = index + 1;
	const valueInput = (val: any, set: (x: any) => void, which: string) =>
		v?.options ? (
			<OptionsInput
				options={v.options}
				appCode={appCode}
				value={val}
				onChange={set}
				placeholder={which}
			/>
		) : (
			<input
				className="_afInput"
				aria-label={`Condition ${n}: ${which}`}
				value={val ?? ''}
				onChange={e => set(e.target.value)}
			/>
		);
	return (
		<div className="_afCondRow" role="group" aria-label={`Condition ${n}`}>
			<select
				className="_afSelect"
				aria-label={`Condition ${n}: field`}
				value={leaf.field ?? ''}
				onChange={e => onChange({ ...leaf, field: e.target.value })}
			>
				<option value="">Choose a field…</option>
				{vars.map(x => (
					<option key={x.path} value={x.path}>
						{pickLabel(x)}
					</option>
				))}
				{leaf.field && !v && <option value={leaf.field}>{leaf.field}</option>}
			</select>
			<select
				className="_afSelect"
				aria-label={`Condition ${n}: comparison`}
				value={leaf.operator ?? 'EQUALS'}
				onChange={e => {
					const next: ConditionLeaf = { ...leaf, operator: e.target.value };
					if (!operatorNeedsValue(e.target.value)) {
						delete next.value;
						delete next.toValue;
					}
					if (e.target.value !== 'BETWEEN') delete next.toValue;
					onChange(next);
				}}
			>
				{OPERATORS.map(o => (
					<option key={o.value} value={o.value}>
						{o.label}
					</option>
				))}
			</select>
			{(op?.needsValue ?? true) &&
				valueInput(leaf.value, x => onChange({ ...leaf, value: x }), 'value')}
			{op?.needsTo &&
				valueInput(leaf.toValue, x => onChange({ ...leaf, toValue: x }), 'up to')}
			<button
				type="button"
				className="_afTool _remove"
				aria-label={`Remove condition ${n}`}
				title="Remove"
				onClick={onRemove}
			>
				<i className="fa fa-solid fa-xmark" aria-hidden="true" />
			</button>
		</div>
	);
}

export function ConditionBuilder({
	value,
	vars,
	appCode,
	onChange,
	label,
}: {
	value?: ConditionGroup;
	vars: Variable[];
	appCode?: string;
	onChange: (c: ConditionGroup | undefined) => void;
	label: string;
}) {
	const group: ConditionGroup =
		value && isGroup(value) ? value : { operator: 'AND', conditions: [] };
	const set = (conditions: ConditionGroup['conditions'], operator = group.operator) =>
		onChange(conditions.length ? { ...group, operator, conditions } : undefined);
	return (
		<div className="_afCond" role="group" aria-label={label}>
			{group.conditions.length > 1 && (
				<select
					className="_afSelect _afJoiner"
					aria-label={`${label}: match`}
					value={group.operator}
					onChange={e => set(group.conditions, e.target.value as 'AND' | 'OR')}
				>
					<option value="AND">All of these</option>
					<option value="OR">Any of these</option>
				</select>
			)}
			{group.conditions.map((c, i) =>
				isGroup(c) ? (
					<div key={i} className="_afCondRow _group">
						<span className="_afHint">{conditionToWords(c, vars)}</span>
						<button
							type="button"
							className="_afTool _remove"
							aria-label={`Remove condition ${i + 1}`}
							onClick={() => set(group.conditions.filter((_, j) => j !== i))}
						>
							<i className="fa fa-solid fa-xmark" aria-hidden="true" />
						</button>
					</div>
				) : (
					<ConditionRow
						key={i}
						index={i}
						leaf={c}
						vars={vars}
						appCode={appCode}
						onChange={l => set(group.conditions.map((x, j) => (j === i ? l : x)))}
						onRemove={() => set(group.conditions.filter((_, j) => j !== i))}
					/>
				),
			)}
			<button
				type="button"
				className="_afLinkButton"
				onClick={() =>
					set([
						...group.conditions,
						{ field: vars[0]?.path ?? '', operator: 'EQUALS', value: '' },
					])
				}
			>
				+ Add a condition
			</button>
		</div>
	);
}

// ───────────────────────────── panels ─────────────────────────────

function TriggerPanel({ doc, catalog, appCode, onChange }: PanelProps) {
	const trig = findTrigger(catalog, doc.trigger?.key);
	const vars = variablesFor(doc, catalog);
	return (
		<>
			<Field label="What starts this" hint={trig?.description}>
				<select
					className="_afSelect"
					value={doc.trigger?.key ?? ''}
					onChange={e => {
						const d = cloneDoc(doc);
						const same = d.trigger?.key === e.target.value;
						d.trigger = {
							key: e.target.value,
							...(same && d.trigger?.filter ? { filter: d.trigger.filter } : {}),
						};
						onChange(d);
					}}
				>
					<option value="">Choose…</option>
					{(catalog?.triggers ?? []).map(t => (
						<option key={t.key} value={t.key}>
							{t.title}
						</option>
					))}
					{doc.trigger?.key && !trig && (
						<option value={doc.trigger.key}>{doc.trigger.key}</option>
					)}
				</select>
			</Field>
			{doc.trigger?.key && (
				<div className="_afField">
					<span className="_afFieldLabel">Only when</span>
					<ConditionBuilder
						label="Only when"
						value={doc.trigger?.filter}
						vars={vars}
						appCode={appCode}
						onChange={filter => {
							const d = cloneDoc(doc);
							d.trigger = {
								key: d.trigger?.key ?? '',
								...(filter ? { filter } : {}),
							};
							onChange(d);
						}}
					/>
				</div>
			)}
		</>
	);
}

function ParamInput({
	param,
	value,
	vars,
	appCode,
	onChange,
}: {
	param: CatalogParam;
	value: any;
	vars: Variable[];
	appCode?: string;
	onChange: (v: any) => void;
}) {
	const label = `${param.label}${param.required ? ' *' : ''}`;
	if (param.options)
		return (
			<Field label={label}>
				<OptionsInput
					options={param.options}
					appCode={appCode}
					value={value}
					onChange={onChange}
				/>
			</Field>
		);
	if (param.choices?.length)
		return (
			<Field label={label}>
				<select
					className="_afSelect"
					value={value ?? ''}
					onChange={e => onChange(e.target.value === '' ? undefined : e.target.value)}
				>
					<option value="">Choose…</option>
					{value !== undefined &&
					value !== '' &&
					!param.choices.some(c => String(c.value) === String(value)) ? (
						<option value={value}>{String(value)}</option>
					) : null}
					{param.choices.map(c => (
						<option key={String(c.value)} value={c.value}>
							{c.label}
						</option>
					))}
				</select>
			</Field>
		);
	if (param.type?.toLowerCase() === 'boolean')
		return (
			<Field label={label}>
				<select
					className="_afSelect"
					value={value === true ? 'true' : value === false ? 'false' : ''}
					onChange={e =>
						onChange(e.target.value === '' ? undefined : e.target.value === 'true')
					}
				>
					<option value="">Choose…</option>
					<option value="true">Yes</option>
					<option value="false">No</option>
				</select>
			</Field>
		);
	return (
		<Field label={label}>
			<VariableInput
				label={param.label}
				value={value}
				vars={param.variables === false ? [] : vars}
				onChange={onChange}
			/>
		</Field>
	);
}

function ActionPanel({ doc, catalog, nodeKey, appCode, onChange }: PanelProps) {
	const node = doc.nodes![nodeKey];
	const act = findAction(catalog, node.action);
	const vars = variablesFor(doc, catalog, nodeKey);
	const set = (patch: Partial<AutomationNode>) => onChange(updateNode(doc, nodeKey, patch));
	return (
		<>
			<Field label="What to do" hint={act?.builtIn ? 'Available in every app' : undefined}>
				<select
					className="_afSelect"
					value={node.action ?? ''}
					onChange={e => {
						const next = findAction(catalog, e.target.value);
						const keep: Record<string, any> = {};
						for (const p of next?.params ?? [])
							if (node.params?.[p.name] !== undefined)
								keep[p.name] = node.params[p.name];
						set({ action: e.target.value, params: keep });
					}}
				>
					<option value="">Choose…</option>
					{(catalog?.actions ?? []).map(a => (
						<option key={a.key} value={a.key}>
							{a.title}
						</option>
					))}
					{node.action && !act && <option value={node.action}>{node.action}</option>}
				</select>
			</Field>
			{(act?.params ?? []).map(p => (
				<ParamInput
					key={p.name}
					param={p}
					value={node.params?.[p.name]}
					vars={vars}
					appCode={appCode}
					onChange={v => {
						const params = { ...(node.params ?? {}) };
						if (v === undefined || v === '') delete params[p.name];
						else params[p.name] = v;
						set({ params });
					}}
				/>
			))}
			{node.action && (
				<Field label="If it fails">
					<select
						className="_afSelect"
						value={node.onFail ?? 'STOP'}
						onChange={e => set({ onFail: e.target.value as 'STOP' | 'CONTINUE' })}
					>
						<option value="STOP">Stop the automation</option>
						<option value="CONTINUE">Carry on with the next step</option>
					</select>
				</Field>
			)}
		</>
	);
}

type WaitKind = 'for' | 'until' | 'event';

function WaitPanel({ doc, catalog, nodeKey, appCode, onChange }: PanelProps) {
	const node = doc.nodes![nodeKey];
	const kind: WaitKind = node.untilEvent ? 'event' : node.until !== undefined ? 'until' : 'for';
	const vars = variablesFor(doc, catalog, nodeKey);
	const set = (patch: Partial<AutomationNode>) => onChange(updateNode(doc, nodeKey, patch));
	const pick = (k: WaitKind) => {
		if (k === kind) return;
		if (k === 'for')
			set({ for: 'P1D', until: undefined, untilEvent: undefined, timeout: undefined });
		if (k === 'until')
			set({
				until: vars[0] ? asPath(vars[0].path) : '',
				for: undefined,
				untilEvent: undefined,
				timeout: undefined,
			});
		if (k === 'event')
			set({ untilEvent: { key: '' }, timeout: 'P2D', for: undefined, until: undefined });
	};
	const name = useId();
	const ev = findTrigger(catalog, node.untilEvent?.key);
	const eventVars: Variable[] = [
		...(ev?.fields ?? []).map(f => ({
			path: `event.${f.name}`,
			label: f.label,
			type: f.type,
			options: f.options,
		})),
		...vars,
	];
	return (
		<>
			<div className="_afField" role="radiogroup" aria-label="Wait">
				{(
					[
						['for', 'For a while'],
						['until', 'Until a date in the record'],
						['event', 'Until something happens'],
					] as Array<[WaitKind, string]>
				).map(([k, label]) => (
					<label key={k} className="_afRadio">
						<input
							type="radio"
							name={name}
							checked={kind === k}
							onChange={() => pick(k)}
						/>
						{label}
					</label>
				))}
			</div>
			{kind === 'for' && (
				<div className="_afField">
					<span className="_afFieldLabel">How long</span>
					<PeriodInput
						label="How long"
						value={node.for}
						onChange={p => set({ for: p })}
					/>
				</div>
			)}
			{kind === 'until' && (
				<Field label="Until">
					<select
						className="_afSelect"
						value={pathOf(node.until)}
						onChange={e => set({ until: e.target.value ? asPath(e.target.value) : '' })}
					>
						<option value="">Choose…</option>
						{vars.map(v => (
							<option key={v.path} value={v.path}>
								{pickLabel(v)}
							</option>
						))}
					</select>
				</Field>
			)}
			{kind === 'event' && (
				<>
					<Field label="Until">
						<select
							className="_afSelect"
							value={node.untilEvent?.key ?? ''}
							onChange={e => set({ untilEvent: { key: e.target.value } })}
						>
							<option value="">Choose…</option>
							{(catalog?.triggers ?? []).map(t => (
								<option key={t.key} value={t.key}>
									{t.sentence}
								</option>
							))}
						</select>
					</Field>
					{node.untilEvent?.key && (
						<div className="_afField">
							<span className="_afFieldLabel">Only when</span>
							<ConditionBuilder
								label="Only when"
								value={node.untilEvent.filter}
								vars={eventVars}
								appCode={appCode}
								onChange={filter =>
									set({
										untilEvent: {
											key: node.untilEvent!.key,
											...(filter ? { filter } : {}),
										},
									})
								}
							/>
						</div>
					)}
					<div className="_afField">
						<label className="_afRadio">
							<input
								type="checkbox"
								checked={!!node.timeout}
								onChange={e =>
									set({ timeout: e.target.checked ? 'P2D' : undefined })
								}
							/>
							At most
						</label>
						{node.timeout && (
							<PeriodInput
								label="At most"
								value={node.timeout}
								onChange={p => set({ timeout: p })}
							/>
						)}
					</div>
				</>
			)}
		</>
	);
}

function CheckPanel({ doc, catalog, nodeKey, appCode, onChange }: PanelProps) {
	const node = doc.nodes![nodeKey];
	return (
		<div className="_afField">
			<span className="_afFieldLabel">Check that</span>
			<ConditionBuilder
				label="Check that"
				value={node.condition}
				vars={variablesFor(doc, catalog, nodeKey)}
				appCode={appCode}
				onChange={condition =>
					onChange(
						updateNode(doc, nodeKey, {
							condition: condition ?? { operator: 'AND', conditions: [] },
						}),
					)
				}
			/>
		</div>
	);
}

export function FlowEditorPanel(props: Readonly<PanelProps>) {
	const { doc, catalog, nodeKey, onChange, onClose, style, slot } = props;
	const node = nodeKey === TRIGGER_KEY ? undefined : doc.nodes?.[nodeKey];
	if (nodeKey !== TRIGGER_KEY && !node) return null;
	const title = nodeTitle(doc, catalog, nodeKey);
	let body: React.ReactNode = null;
	if (nodeKey === TRIGGER_KEY) body = <TriggerPanel {...props} />;
	else if (node!.type === 'ACTION') body = <ActionPanel {...props} />;
	else if (node!.type === 'WAIT') body = <WaitPanel {...props} />;
	else if (node!.type === 'CHECK') body = <CheckPanel {...props} />;
	return (
		<aside className="_afPanel" style={style} aria-label={`Edit: ${title}`}>
			{slot}
			<div className="_afPanelHead">
				<span className="_afPanelTitle">{title}</span>
				<button
					type="button"
					className="_afTool"
					aria-label="Close the editor"
					title="Close"
					onClick={onClose}
				>
					<i className="fa fa-solid fa-xmark" aria-hidden="true" />
				</button>
			</div>
			{node && (
				<Field label="Name (optional)">
					<input
						className="_afInput"
						value={node.title ?? ''}
						onChange={e =>
							onChange(
								updateNode(doc, nodeKey, { title: e.target.value || undefined }),
							)
						}
					/>
				</Field>
			)}
			{body}
		</aside>
	);
}
