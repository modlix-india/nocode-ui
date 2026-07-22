import React, { Suspense, useEffect, useRef, useState } from 'react';
import {
	EventOption,
	fetchEventDefinitions,
	fetchEventSchema,
	PLATFORM_EVENT_CATALOG,
	platformEventSchema,
} from '../util/eventsApi';
import { PreviewHeaders } from '../util/previewApi';
import { sampleFromSchema } from '../util/schemaSample';

const LazyEditor = React.lazy(() =>
	import('@monaco-editor/react').then(module => ({ default: module.default })),
);

type Mode = 'event' | 'custom' | 'json';

interface SampleDataPanelProps {
	value: any;
	onChange: (v: any) => void;
	variableSchema: any;
	headers: PreviewHeaders;
}

// Sample data the preview renders against. Generate it from an event's payload shape, edit the
// declared fields directly, or edit raw JSON.
export default function SampleDataPanel({
	value,
	onChange,
	variableSchema,
	headers,
}: Readonly<SampleDataPanelProps>) {
	const [mode, setMode] = useState<Mode>('custom');
	const [events, setEvents] = useState<EventOption[]>([]);

	useEffect(() => {
		let live = true;
		fetchEventDefinitions(headers)
			.then(e => live && setEvents(e))
			.catch(() => {});
		return () => {
			live = false;
		};
	}, [headers]);

	const selectEvent = async (val: string) => {
		if (!val) return;
		const schema = val.startsWith('app:')
			? await fetchEventSchema(val.slice(4), headers).catch(() => undefined)
			: platformEventSchema(val.slice(9));
		if (schema) onChange(sampleFromSchema(schema));
	};

	const properties: Record<string, any> = variableSchema?.properties ?? {};

	return (
		<div className="_panel">
			<p className="_panelHint">Sample data used to render the preview.</p>

			<div className="_segmented">
				<button className={mode === 'event' ? '_on' : ''} onClick={() => setMode('event')}>
					From event
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
					<select className="_fld" defaultValue="" onChange={e => selectEvent(e.target.value)}>
						<option value="">Generate sample from an event…</option>
						{events.length > 0 && (
							<optgroup label="App events">
								{events.map(ev => (
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
					{variableSchema?.properties && (
						<button
							className="_addBtn"
							onClick={() => onChange(sampleFromSchema(variableSchema))}
						>
							<i className="fa fa-solid fa-wand-magic-sparkles" /> Generate from Variables
						</button>
					)}
				</div>
			)}

			{mode === 'custom' && (
				<CustomSample properties={properties} value={value} onChange={onChange} />
			)}

			{mode === 'json' && <JsonSample value={value} onChange={onChange} />}
		</div>
	);
}

function CustomSample({
	properties,
	value,
	onChange,
}: Readonly<{ properties: Record<string, any>; value: any; onChange: (v: any) => void }>) {
	const keys = Object.keys(properties);
	if (keys.length === 0)
		return (
			<div className="_modeBody">
				<div className="_muted">
					Define fields in the Variables panel to fill them here, or use JSON.
				</div>
			</div>
		);

	const isScalar = (k: string) => {
		const t = properties[k]?.type;
		const first = Array.isArray(t) ? `${t[0]}`.toUpperCase() : `${t}`.toUpperCase();
		return !['OBJECT', 'ARRAY'].includes(first);
	};

	return (
		<div className="_modeBody">
			{keys.map(k => (
				<label className="_field" key={k}>
					<span>{k}</span>
					{isScalar(k) ? (
						<input
							className="_fld"
							value={value?.[k] ?? ''}
							onChange={e => onChange({ ...(value ?? {}), [k]: e.target.value })}
						/>
					) : (
						<span className="_muted _nestedNote">nested — edit in JSON</span>
					)}
				</label>
			))}
		</div>
	);
}

function JsonSample({ value, onChange }: Readonly<{ value: any; onChange: (v: any) => void }>) {
	const lastEmitted = useRef('');
	const [text, setText] = useState(() => JSON.stringify(value ?? {}, null, 2));
	const [error, setError] = useState<string | undefined>();

	useEffect(() => {
		const incoming = JSON.stringify(value ?? {}, null, 2);
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
