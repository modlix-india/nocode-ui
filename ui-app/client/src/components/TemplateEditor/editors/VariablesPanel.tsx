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

const LazyEditor = React.lazy(() =>
	import('@monaco-editor/react').then(module => ({ default: module.default })),
);

type Mode = 'event' | 'custom' | 'json';

const FIELD_TYPES = ['STRING', 'INTEGER', 'DOUBLE', 'BOOLEAN', 'OBJECT', 'ARRAY'];

interface VariablesPanelProps {
	value: any; // Kirun schema structure
	onChange: (v: any) => void; // manual edits (schema only)
	onPickSchema: (schema: any) => void; // event selection: fill schema + default sample
	headers: PreviewHeaders;
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
}: Readonly<VariablesPanelProps>) {
	const [mode, setMode] = useState<Mode>('event');
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
				The data shape this template renders against. Pick the event it responds to, build
				the fields, or paste a schema. Fields become insertable {'${variables}'}.
			</p>

			<div className="_segmented">
				<button className={mode === 'event' ? '_on' : ''} onClick={() => setMode('event')}>
					Event
				</button>
				<button className={mode === 'custom' ? '_on' : ''} onClick={() => setMode('custom')}>
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

			{mode === 'custom' && <CustomFields value={value} onChange={onChange} />}

			{mode === 'json' && <JsonSchemaEditor value={value} onChange={onChange} />}
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
			<button className="_addBtn" onClick={() => setRows([...rows, { name: '', type: 'STRING' }])}>
				<i className="fa fa-solid fa-plus" /> Add field
			</button>
		</div>
	);
}

function JsonSchemaEditor({ value, onChange }: Readonly<{ value: any; onChange: (v: any) => void }>) {
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
