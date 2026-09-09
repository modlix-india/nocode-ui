import React, { Suspense, useMemo, useState } from 'react';
import {
	DEFAULT_INFER_OPTIONS,
	inferSchema,
	InferOptions,
	suggestRootArrayAs,
} from './inferSchema';
import { diffSchemas, mergeSchemas, pickRootIdentity } from './schemaUtils';

const LazyEditor = React.lazy(() =>
	import('@monaco-editor/react').then(module => ({ default: module.default })),
);

/**
 * Build a schema from a pasted payload.
 *
 * Merge and Replace are both offered every time, with the preview showing what each would do.
 * Replace is the obvious choice on an empty schema; Merge is the one that matters on the second
 * run, when the schema already carries hand-written descriptions and constraints that a replace
 * would throw away.
 */
export default function SampleImport({
	current,
	rootType,
	onApply,
	onClose,
}: Readonly<{
	current: any;
	rootType?: string;
	onApply: (v: any) => void;
	onClose: () => void;
}>) {
	const [text, setText] = useState('');
	const [rootArrayAs, setRootArrayAs] = useState<InferOptions['rootArrayAs'] | undefined>();
	const [requiredFromAll, setRequiredFromAll] = useState(false);
	const [detectFormats, setDetectFormats] = useState(true);

	const parsed = useMemo(() => {
		if (!text.trim()) return { value: undefined, error: undefined };
		try {
			return { value: JSON.parse(text), error: undefined };
		} catch (e: any) {
			return { value: undefined, error: e?.message ?? 'Invalid JSON' };
		}
	}, [text]);

	const rootIsArray = Array.isArray(parsed.value);
	const effectiveRootArrayAs = rootArrayAs ?? suggestRootArrayAs(parsed.value);

	const inferred = useMemo(() => {
		if (parsed.value === undefined) return undefined;
		return inferSchema(parsed.value, {
			rootArrayAs: effectiveRootArrayAs,
			requiredFrom: requiredFromAll ? 'ALL_RECORDS' : 'NONE',
			detectFormats,
		});
	}, [parsed.value, effectiveRootArrayAs, requiredFromAll, detectFormats]);

	const diff = useMemo(
		() => (inferred ? diffSchemas(current, inferred.schema) : undefined),
		[current, inferred],
	);

	const currentIsEmpty = !current?.properties || !Object.keys(current.properties).length;

	const apply = (replace: boolean) => {
		if (!inferred) return;
		const next = replace
			? {
					// updateAt('') replaces the whole root, and only type and version are put back
					// downstream, so the schema's identity has to be carried over here.
					...pickRootIdentity(current),
					...inferred.schema,
					...(rootType ? { type: rootType } : {}),
				}
			: mergeSchemas(current, inferred.schema);
		onApply(next);
	};

	const rootChoice = rootIsArray && (
		<div className="_importOption">
			<span className="_importOptionLabel">The pasted array is</span>
			<label>
				<input
					type="radio"
					name="rootArrayAs"
					checked={effectiveRootArrayAs === 'ELEMENT'}
					onChange={() => setRootArrayAs('ELEMENT')}
				/>
				a list of records (build the shape of one)
			</label>
			<label>
				<input
					type="radio"
					name="rootArrayAs"
					checked={effectiveRootArrayAs === 'ARRAY'}
					onChange={() => setRootArrayAs('ARRAY')}
				/>
				the value itself (build an array schema)
			</label>
		</div>
	);

	return (
		<div className="_popupBackground" onClick={onClose}>
			<div
				className="_popupContainer _sampleImport"
				onClick={e => e.stopPropagation()}
				role="presentation"
			>
				<div className="_popupTitle">Build a schema from a sample payload</div>
				<div className="_jsonEditorContainer">
					<Suspense fallback={<div className="_editorLoading">Loading…</div>}>
						<LazyEditor
							language="json"
							height="100%"
							value={text}
							onChange={(v: string | undefined) => setText(v ?? '')}
							options={{
								minimap: { enabled: false },
								fontSize: 12,
								automaticLayout: true,
								scrollBeyondLastLine: false,
							}}
						/>
					</Suspense>
				</div>

				{rootChoice}
				<div className="_importOption">
					<label>
						<input
							type="checkbox"
							checked={detectFormats}
							onChange={e => setDetectFormats(e.target.checked)}
						/>
						Detect date, date-time and email formats
					</label>
					<label>
						<input
							type="checkbox"
							checked={requiredFromAll}
							onChange={e => setRequiredFromAll(e.target.checked)}
						/>
						Mark a field required when every record has it
						<span className="_hint">
							Off by default: one record cannot tell "required" from "happened to be
							present".
						</span>
					</label>
				</div>

				{parsed.error ? <div className="_error">{parsed.error}</div> : undefined}
				<ImportSummary diff={diff} stats={inferred?.stats} />

				<div className="_popupButtons">
					<button
						type="button"
						disabled={!inferred}
						title={
							currentIsEmpty
								? 'Add these fields to the schema'
								: 'Add the fields this sample has and the schema lacks. Nothing already here is changed.'
						}
						onClick={() => apply(false)}
					>
						Merge
					</button>
					<button
						type="button"
						disabled={!inferred}
						title="Discard the current fields and use the sample's shape. Name, namespace and version are kept."
						onClick={() => apply(true)}
					>
						Replace
					</button>
					<button type="button" onClick={onClose}>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
}

function ImportSummary({
	diff,
	stats,
}: Readonly<{ diff: ReturnType<typeof diffSchemas> | undefined; stats: any }>) {
	if (!diff)
		return <div className="_importSummary">Paste a payload to see what it would do.</div>;

	const parts: string[] = [];
	parts.push(`Merge adds ${diff.added.length} propert${diff.added.length === 1 ? 'y' : 'ies'}`);
	parts.push(`leaves ${diff.unchanged.length + diff.retyped.length} already here untouched`);
	if (diff.retyped.length)
		parts.push(
			`${diff.retyped.length} would keep a type the sample disagrees with (${diff.retyped
				.slice(0, 3)
				.map(r => `${r.path}: ${r.from} not ${r.to}`)
				.join('; ')})`,
		);

	const notes: string[] = [];
	if (stats?.untyped?.length)
		notes.push(
			`${stats.untyped.length} field(s) were null in the sample and have no type yet: ${stats.untyped
				.slice(0, 5)
				.join(', ')}`,
		);
	if (stats?.truncated?.length)
		notes.push(`${stats.truncated.length} branch(es) were deeper than the limit and were cut`);
	if (stats?.nodes > 500) notes.push(`${stats.nodes} nodes: this will be a very large tree`);

	return (
		<div className="_importSummary">
			<div>{parts.join(', ')}.</div>
			{notes.map(n => (
				<div key={n} className="_hint">
					{n}
				</div>
			))}
		</div>
	);
}
