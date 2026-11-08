import React, { Suspense, useEffect, useRef, useState } from 'react';
import {
	EventOption,
	fetchEventDefinitions,
	fetchEventSchema,
	PLATFORM_EVENT_CATALOG,
	platformEventSchema,
} from '../util/eventsApi';
import { PreviewHeaders } from '../util/previewApi';
import { emptyObjectSchema } from '../util/schemaSample';
import { collectVariables, VariableEntry } from '../util/variableUtils';

const LazyEditor = React.lazy(() =>
	import('@monaco-editor/react').then(module => ({ default: module.default })),
);

type Mode = 'fields' | 'event' | 'custom' | 'json';

const FIELD_TYPES = ['STRING', 'INTEGER', 'DOUBLE', 'BOOLEAN', 'OBJECT', 'ARRAY'];

interface VariablesPanelProps {
	value: any; // Kirun schema structure
	onChange: (v: any) => void; // manual edits (schema only)
	onPickSchema: (schema: any) => void; // event selection: fill schema + default sample
	headers: PreviewHeaders;
	// Puts a field's token where the cursor is (Code mode). Without it a click copies the token.
	onInsert?: (token: string) => void;
}

function typeOf(fieldSchema: any): string {
	const t = fieldSchema?.type;
	if (Array.isArray(t)) return `${t[0] ?? 'STRING'}`.toUpperCase();
	if (typeof t === 'string') return t.toUpperCase();
	return 'STRING';
}

function leafSchema(type: string): any {
	if (type === 'OBJECT') return { type: ['OBJECT'], properties: {} };
	if (type === 'ARRAY') return { type: ['ARRAY'], items: { type: ['STRING'] } };
	return { type: [type] };
}

// Variables = the Kirun schema of the data the template renders against.
// Sourced from an event's payload shape, a simple field builder, or raw JSON.
export default function VariablesPanel({
	value,
	onChange,
	onPickSchema,
	headers,
	onInsert,
}: Readonly<VariablesPanelProps>) {
	const hasFields = Object.keys(value?.properties ?? {}).length > 0;
	// With fields defined, the panel opens on the list of fields (what each one holds); without,
	// on choosing where they come from.
	const [mode, setMode] = useState<Mode>(hasFields ? 'fields' : 'event');
	const [appEvents, setAppEvents] = useState<EventOption[]>([]);

	useEffect(() => {
		let live = true;
		fetchEventDefinitions(headers).then(e => live && setAppEvents(e));
		return () => {
			live = false;
		};
	}, [headers]);

	const properties: Record<string, any> = value?.properties ?? {};

	const selectEvent = async (val: string) => {
		if (!val) return;
		if (val.startsWith('app:')) {
			const schema = await fetchEventSchema(val.slice(4), headers).catch(() => undefined);
			onPickSchema(schema ?? emptyObjectSchema());
		} else {
			onPickSchema(platformEventSchema(val.slice(9)) ?? emptyObjectSchema());
		}
	};

	return (
		<div className="_panel">
			<p className="_panelHint">
				{mode === 'fields'
					? 'The fields this template can show. Click one to put it where the cursor is.'
					: 'The data shape this template renders against. Pick the event it responds to, build the fields, or paste a schema. Fields become insertable ${variables}.'}
			</p>

			<div className="_segmented">
				{hasFields && (
					<button
						className={mode === 'fields' ? '_on' : ''}
						onClick={() => setMode('fields')}
					>
						Fields
					</button>
				)}
				<button className={mode === 'event' ? '_on' : ''} onClick={() => setMode('event')}>
					Event
				</button>
				<button
					className={mode === 'custom' ? '_on' : ''}
					onClick={() => setMode('custom')}
				>
					Custom
				</button>
				<button className={mode === 'json' ? '_on' : ''} onClick={() => setMode('json')}>
					JSON
				</button>
			</div>

			{mode === 'event' && (
				<div className="_modeBody">
					<select className="_fld" value="" onChange={e => selectEvent(e.target.value)}>
						<option value="">Select an event…</option>
						{appEvents.length > 0 && (
							<optgroup label="App events">
								{appEvents.map(ev => (
									<option key={ev.id} value={`app:${ev.id}`}>
										{ev.name}
									</option>
								))}
							</optgroup>
						)}
						<optgroup label="Platform events">
							{PLATFORM_EVENT_CATALOG.map(ev => (
								<option key={ev.name} value={`platform:${ev.name}`}>
									{ev.name}
								</option>
							))}
						</optgroup>
					</select>
					<FieldSummary properties={properties} />
				</div>
			)}

			{mode === 'fields' && <FieldList schema={value} onInsert={onInsert} />}

			{mode === 'custom' && <CustomFields value={value} onChange={onChange} />}

			{mode === 'json' && <JsonSchemaEditor value={value} onChange={onChange} />}
		</div>
	);
}

// Title of a group: the top-level object's own title, else its key in words.
function groupTitle(group: string, all: VariableEntry[]): string {
	if (!group) return 'General';
	const head = all.find(v => v.path === group);
	if (head?.label) return head.label;
	return group.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase());
}

// Every field of the schema with its name in words and what it holds, grouped by the object it
// sits in. A click inserts its token (or copies it when nothing can take an insert).
export function FieldList({
	schema,
	entries,
	onInsert,
	hint,
	hideTokens,
}: Readonly<{
	schema: any;
	entries?: VariableEntry[];
	onInsert?: (token: string) => void;
	hint?: string;
	// Plain words only (Document look): the ${...} under each field is left out.
	hideTokens?: boolean;
}>) {
	const [query, setQuery] = useState('');
	const [copied, setCopied] = useState<string | undefined>();
	const all = entries ?? collectVariables(schema);
	const q = query.trim().toLowerCase();
	const leaves = all.filter(
		v =>
			!v.container &&
			(!q ||
				v.path.toLowerCase().includes(q) ||
				(v.label ?? '').toLowerCase().includes(q) ||
				(v.description ?? '').toLowerCase().includes(q)),
	);
	const groups: string[] = [];
	leaves.forEach(v => {
		if (!groups.includes(v.group)) groups.push(v.group);
	});

	const pick = (token: string) => {
		if (onInsert) {
			onInsert(token);
			return;
		}
		void navigator.clipboard?.writeText?.(token)?.catch(() => undefined);
		setCopied(token);
	};

	return (
		<div className="_modeBody _fieldList">
			{hint && <p className="_panelHint">{hint}</p>}
			<input
				className="_fld"
				placeholder="Find a field"
				value={query}
				onChange={e => setQuery(e.target.value)}
			/>
			{leaves.length === 0 && <div className="_muted">No field matches.</div>}
			{groups.map(g => {
				const head = all.find(v => v.path === g);
				return (
					<div key={g || '_'} className="_fieldGroup">
						<div className="_fieldGroupTitle">
							{groupTitle(g, all)}
							{head?.type && /ARRAY/i.test(head.type) && (
								<span className="_muted"> (one row each)</span>
							)}
						</div>
						{head?.description && (
							<div className="_fieldGroupHint">{head.description}</div>
						)}
						{leaves
							.filter(v => v.group === g)
							.map(v => (
								<button
									type="button"
									key={v.path}
									className="_fieldItem"
									title={onInsert ? 'Put it where the cursor is' : 'Copy'}
									onClick={() => pick(v.token)}
								>
									<span className="_fieldItemName">
										{v.label ?? v.path.split('.').pop()}
										{copied === v.token && (
											<span className="_muted"> copied</span>
										)}
									</span>
									{v.description && (
										<span className="_fieldItemHint">{v.description}</span>
									)}
									{!hideTokens && (
										<code className="_fieldItemToken">{v.token}</code>
									)}
								</button>
							))}
					</div>
				);
			})}
		</div>
	);
}

function FieldSummary({ properties }: Readonly<{ properties: Record<string, any> }>) {
	const keys = Object.keys(properties);
	if (keys.length === 0) return <div className="_muted">No fields yet.</div>;
	return (
		<div className="_fieldSummary">
			{keys.map(k => (
				<div key={k} className="_fieldRow">
					<code>{k}</code>
					<span className="_muted">{typeOf(properties[k]).toLowerCase()}</span>
				</div>
			))}
		</div>
	);
}

interface Row {
	name: string;
	type: string;
}

// Simple, reliable OBJECT-schema field builder. Rows (including in-progress empty-name rows) live
// in local state so a newly-added field never vanishes; only named rows are written to the schema.
function CustomFields({ value, onChange }: Readonly<{ value: any; onChange: (v: any) => void }>) {
	const lastEmitted = useRef('');
	const [rows, setRows] = useState<Row[]>(() =>
		Object.entries(value?.properties ?? {}).map(([name, s]) => ({ name, type: typeOf(s) })),
	);

	// Re-sync only when the schema changed from OUTSIDE (e.g. an event was picked), never mid-edit.
	useEffect(() => {
		const incoming = JSON.stringify(value?.properties ?? {});
		if (incoming !== lastEmitted.current) {
			setRows(
				Object.entries(value?.properties ?? {}).map(([name, s]) => ({
					name,
					type: typeOf(s),
				})),
			);
			lastEmitted.current = incoming;
		}
	}, [value]);

	const emit = (next: Row[]) => {
		setRows(next);
		const props: Record<string, any> = {};
		next.forEach(r => {
			if (r.name.trim()) props[r.name.trim()] = leafSchema(r.type);
		});
		lastEmitted.current = JSON.stringify(props);
		onChange({ type: ['OBJECT'], properties: props });
	};

	return (
		<div className="_modeBody">
			{rows.map((r, i) => (
				<div key={i} className="_kvRow">
					<input
						className="_fld"
						value={r.name}
						placeholder="field name"
						onChange={e => {
							const next = [...rows];
							next[i] = { ...next[i], name: e.target.value };
							emit(next);
						}}
					/>
					<select
						className="_fld _fldType"
						value={r.type}
						onChange={e => {
							const next = [...rows];
							next[i] = { ...next[i], type: e.target.value };
							emit(next);
						}}
					>
						{FIELD_TYPES.map(t => (
							<option key={t} value={t}>
								{t.toLowerCase()}
							</option>
						))}
					</select>
					<button
						className="_iconBtn"
						title="Remove"
						onClick={() => emit(rows.filter((_, j) => j !== i))}
					>
						<i className="fa fa-regular fa-trash-can" />
					</button>
				</div>
			))}
			{/* Adding is local only, so an empty new row stays visible until you name it. */}
			<button
				className="_addBtn"
				onClick={() => setRows([...rows, { name: '', type: 'STRING' }])}
			>
				<i className="fa fa-solid fa-plus" /> Add field
			</button>
		</div>
	);
}

function JsonSchemaEditor({
	value,
	onChange,
}: Readonly<{ value: any; onChange: (v: any) => void }>) {
	const lastEmitted = useRef('');
	const [text, setText] = useState(() => JSON.stringify(value ?? emptyObjectSchema(), null, 2));
	const [error, setError] = useState<string | undefined>();

	useEffect(() => {
		const incoming = JSON.stringify(value ?? emptyObjectSchema(), null, 2);
		if (incoming !== lastEmitted.current) {
			setText(incoming);
			lastEmitted.current = incoming;
		}
	}, [value]);

	const onEdit = (t: string) => {
		setText(t);
		try {
			const parsed = JSON.parse(t.trim() === '' ? '{}' : t);
			setError(undefined);
			lastEmitted.current = JSON.stringify(parsed, null, 2);
			onChange(parsed);
		} catch {
			setError('Invalid JSON');
		}
	};

	return (
		<div className="_modeBody">
			<div className="_jsonBox">
				<Suspense fallback={<div className="_editorLoading">Loading…</div>}>
					<LazyEditor
						language="json"
						height="100%"
						value={text}
						onChange={(ev: string | undefined) => onEdit(ev ?? '')}
						options={{
							minimap: { enabled: false },
							fontSize: 12,
							automaticLayout: true,
							scrollBeyondLastLine: false,
						}}
					/>
				</Suspense>
			</div>
			{error && <div className="_panelError">{error}</div>}
		</div>
	);
}
