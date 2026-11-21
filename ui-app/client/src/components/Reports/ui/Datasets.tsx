import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
	DatasetFunctions,
	deleteDataset,
	listDatasets,
	renameDataset,
	saveDataset,
	SaveProgress,
} from '../datasetApi';
import {
	assignSlots,
	badCount,
	convertRows,
	DATASET_LIMITS,
	DatasetColumnType,
	datasetSourceId,
	DatasetInfo,
	DayOrder,
	DraftColumn,
	draftColumns,
	nameError,
	nameFromFile,
	ParsedCsv,
	parseCsv,
	TYPE_LABELS,
} from '../datasetModel';
import { invalidateCatalog, markSourceChanged, ReportTransport } from '../reportApi';
import { Icon } from './common';
import { Dialog } from './portal';

/**
 * CSV data import and the user's dataset list (CONTRACT 10, P1c). The file is read and parsed
 * in the browser; the user checks the first 20 rows, the inferred types (with overrides), the
 * column labels and a name; rows go to `<ns>.reportDatasetSave` in parts of 1000 with progress.
 * Every change reloads the catalog, where each dataset is a `dataset:<id>` source.
 */

const PREVIEW_ROWS = 20;
const fmt = (n: number) => n.toLocaleString();

function readText(file: Blob): Promise<string> {
	if (typeof (file as any).text === 'function') return (file as any).text();
	return new Promise((resolve, reject) => {
		const r = new FileReader();
		r.onload = () => resolve(String(r.result ?? ''));
		r.onerror = () => reject(r.error);
		r.readAsText(file);
	});
}

/** The caller's datasets; `reload` after a change. */
export function useDatasets(
	transport: ReportTransport | undefined,
	fns: DatasetFunctions | undefined,
) {
	const [state, setState] = useState<{
		list?: DatasetInfo[];
		error?: string;
		loading: boolean;
	}>({ loading: true });
	const [round, setRound] = useState(0);
	useEffect(() => {
		if (!transport || !fns) return;
		let alive = true;
		setState(s => ({ ...s, loading: true, error: undefined }));
		listDatasets(transport, fns).then(
			list => alive && setState({ list, loading: false }),
			e =>
				alive &&
				setState({ loading: false, error: e?.message ?? 'Your data could not be loaded.' }),
		);
		return () => {
			alive = false;
		};
	}, [transport, fns?.list, round]); // eslint-disable-line react-hooks/exhaustive-deps
	const reload = useCallback(() => setRound(r => r + 1), []);
	return { ...state, reload };
}

/** Columns past the caps start as Skip, so a wide file can still be set up. */
function capDrafts(drafts: DraftColumn[]): { drafts: DraftColumn[]; skipped: number } {
	const count: Record<string, number> = {};
	let total = 0;
	let skipped = 0;
	const out = drafts.map(d => {
		if (d.type === 'SKIP') return d;
		const t = d.type;
		if (total >= DATASET_LIMITS.columns || (count[t] ?? 0) >= DATASET_LIMITS.slots[t]) {
			skipped++;
			return { ...d, type: 'SKIP' as const };
		}
		count[t] = (count[t] ?? 0) + 1;
		total++;
		return d;
	});
	return { drafts: out, skipped };
}

type ImportStep =
	| { kind: 'pick'; error?: string; reading?: boolean }
	| {
			kind: 'setup';
			csv: ParsedCsv;
			fileName: string;
			drafts: DraftColumn[];
			name: string;
			note?: string;
			error?: string;
	  }
	| { kind: 'saving'; progress: SaveProgress; name: string }
	| { kind: 'failed'; error: string; datasetId?: string; retry: () => void }
	| { kind: 'done'; datasetId: string; name: string; rows: number; warnings: string[] };

export function DatasetImportDialog({
	transport,
	fns,
	existing,
	replace,
	dayOrder = 'DMY',
	onClose,
	onDone,
}: Readonly<{
	transport: ReportTransport;
	fns: DatasetFunctions;
	/** The user's datasets (names must differ, at most 20). */
	existing: DatasetInfo[];
	/** Replace this dataset's rows with a newer CSV (keeps its id, so its widgets keep working). */
	replace?: DatasetInfo;
	/** How to read 05/06/2026 when the file does not tell (from the catalog's locale). */
	dayOrder?: DayOrder;
	onClose: () => void;
	/** After a save: the dataset's id (its source is `dataset:<id>`). */
	onDone?: (datasetId: string, name: string) => void;
}>) {
	const [step, setStep] = useState<ImportStep>({ kind: 'pick' });
	const atCap = !replace && existing.length >= DATASET_LIMITS.perUser;

	const pick = async (file: File | undefined) => {
		if (!file) return;
		if (file.size > DATASET_LIMITS.fileBytes)
			return setStep({ kind: 'pick', error: 'This file is larger than 10 MB.' });
		setStep({ kind: 'pick', reading: true });
		let text: string;
		try {
			text = await readText(file);
		} catch {
			return setStep({ kind: 'pick', error: 'The file could not be read.' });
		}
		const csv = parseCsv(text);
		if (csv.truncated)
			return setStep({
				kind: 'pick',
				error: `This file has more than ${fmt(DATASET_LIMITS.rows)} rows.`,
			});
		if (!csv.header.length || !csv.rows.length)
			return setStep({
				kind: 'pick',
				error: 'No rows found. The first line must name the columns.',
			});
		let drafts = draftColumns(csv, dayOrder);
		if (replace)
			drafts = drafts.map(d => {
				const prev = replace.columns.find(
					p => p.csvHeader.toLowerCase() === d.csvHeader.toLowerCase(),
				);
				return prev ? { ...d, label: prev.label, type: prev.type } : d;
			});
		const capped = capDrafts(drafts);
		setStep({
			kind: 'setup',
			csv,
			fileName: file.name,
			drafts: capped.drafts,
			name: replace?.name ?? nameFromFile(file.name),
			note: capped.skipped
				? `${capped.skipped} columns are set to Skip: at most ${DATASET_LIMITS.columns} columns (${DATASET_LIMITS.slots.TEXT} text, ${DATASET_LIMITS.slots.NUMBER} number, ${DATASET_LIMITS.slots.DATE} date).`
				: undefined,
		});
	};

	const upload = async (s: Extract<ImportStep, { kind: 'setup' }>, retryId?: string) => {
		const nErr = nameError(s.name, existing, replace?._id ?? retryId);
		if (nErr) return setStep({ ...s, error: nErr });
		const slots = assignSlots(s.drafts, replace?.columns);
		if (!slots.ok) return setStep({ ...s, error: slots.error });
		const { rows, stats } = convertRows(s.csv.rows, slots.columns);
		const name = s.name.trim();
		const columns = slots.columns.map(({ slot, label, type, csvHeader }) => ({
			slot,
			label,
			type,
			csvHeader,
		}));
		setStep({ kind: 'saving', name, progress: { part: 0, parts: 1, rowsSent: 0 } });
		try {
			const id = await saveDataset(
				transport,
				fns,
				{ datasetId: replace?._id ?? retryId, name, columns, rows },
				progress => setStep({ kind: 'saving', name, progress }),
			);
			markSourceChanged(datasetSourceId(id));
			invalidateCatalog();
			const warnings = [
				...Object.entries(stats.bad).map(
					([label, n]) =>
						`${fmt(n)} values in ${label} did not read as its type and were left empty.`,
				),
				...(stats.cut
					? [`${fmt(stats.cut)} long text values were cut to 255 characters.`]
					: []),
				...(stats.empty ? [`${fmt(stats.empty)} empty rows were left out.`] : []),
			];
			setStep({ kind: 'done', datasetId: id, name, rows: rows.length, warnings });
			onDone?.(id, name);
		} catch (e: any) {
			const datasetId = e?.datasetId as string | undefined;
			if (datasetId) invalidateCatalog();
			setStep({
				kind: 'failed',
				error: e?.message ?? 'The data could not be saved.',
				datasetId,
				retry: () => upload(s, datasetId),
			});
		}
	};

	const title = replace ? `Replace data: ${replace.name}` : 'Import data';
	const busy = step.kind === 'saving';
	return (
		<Dialog kind="modal" label={title} onClose={() => !busy && onClose()}>
			<div className="_rpDrawerHead">
				<span>{title}</span>
				<button
					type="button"
					className="_rpIconBtn"
					aria-label="Close"
					title="Close"
					disabled={busy}
					onClick={onClose}
				>
					<Icon name="fa-xmark" />
				</button>
			</div>
			<div className="_rpDrawerBody">
				{step.kind === 'pick' ? (
					<>
						<p className="_rpMuted" style={{ margin: 0 }}>
							A CSV file whose first line names the columns. Up to 10 MB,{' '}
							{fmt(DATASET_LIMITS.rows)} rows and {DATASET_LIMITS.columns} columns.
							The data is yours only: nobody else sees it.
						</p>
						{replace ? (
							<p className="_rpMuted" style={{ margin: 0 }}>
								Columns with the same header keep their place, so widgets on this
								data keep working.
							</p>
						) : null}
						{atCap ? (
							<div className="_rpError" role="alert">
								You can keep at most {DATASET_LIMITS.perUser} datasets. Delete one
								first.
							</div>
						) : (
							<label className="_rpDrop">
								<Icon name="fa-file-csv" />
								<span>{step.reading ? 'Reading the file' : 'Pick a CSV file'}</span>
								<input
									type="file"
									accept=".csv,text/csv,text/plain"
									aria-label="CSV file"
									onChange={e => pick(e.target.files?.[0])}
								/>
							</label>
						)}
						{step.error ? (
							<div className="_rpError" role="alert">
								{step.error}
							</div>
						) : null}
					</>
				) : null}
				{step.kind === 'setup' ? <SetupStep step={step} onChange={setStep} /> : null}
				{step.kind === 'saving' ? (
					<div className="_rpGroup" role="status" aria-live="polite">
						<span>
							Saving {step.name}: part {Math.max(1, step.progress.part)} of{' '}
							{step.progress.parts} ({fmt(step.progress.rowsSent)} rows done)
						</span>
						<progress
							className="_rpProgress"
							max={step.progress.parts}
							value={step.progress.part}
						/>
					</div>
				) : null}
				{step.kind === 'failed' ? (
					<div className="_rpGroup">
						<div className="_rpError" role="alert">
							{step.error}
						</div>
						{step.datasetId ? (
							<span className="_rpMuted">
								Try again replaces what was saved so far.
							</span>
						) : null}
					</div>
				) : null}
				{step.kind === 'done' ? (
					<div className="_rpGroup" role="status">
						<span>
							Saved {step.name} with {fmt(step.rows)} rows. It is now in the Data list
							of the report editor.
						</span>
						{step.warnings.map(w => (
							<span key={w} className="_rpMuted">
								{w}
							</span>
						))}
					</div>
				) : null}
			</div>
			<div className="_rpDrawerFoot">
				{step.kind === 'setup' ? (
					<>
						<button
							type="button"
							className="_rpBtn"
							onClick={() => setStep({ kind: 'pick' })}
						>
							Pick another file
						</button>
						<button
							type="button"
							className="_rpBtn _primary"
							onClick={() => upload(step)}
						>
							<Icon name="fa-upload" /> {replace ? 'Replace data' : 'Save data'}
						</button>
					</>
				) : step.kind === 'failed' ? (
					<>
						<button type="button" className="_rpBtn" onClick={onClose}>
							Close
						</button>
						<button type="button" className="_rpBtn _primary" onClick={step.retry}>
							Try again
						</button>
					</>
				) : (
					<button type="button" className="_rpBtn" disabled={busy} onClick={onClose}>
						{step.kind === 'done' ? 'Done' : 'Cancel'}
					</button>
				)}
			</div>
		</Dialog>
	);
}

function SetupStep({
	step,
	onChange,
}: Readonly<{
	step: Extract<ImportStep, { kind: 'setup' }>;
	onChange: (s: ImportStep) => void;
}>) {
	const { csv, drafts } = step;
	const setDraft = (i: number, patch: Partial<DraftColumn>) =>
		onChange({
			...step,
			error: undefined,
			drafts: drafts.map((d, j) => (j === i ? { ...d, ...patch } : d)),
		});
	const bad = useMemo(() => drafts.map(d => badCount(csv, d)), [csv, drafts]);
	const kept = drafts.filter(d => d.type !== 'SKIP').length;
	return (
		<>
			<label className="_rpLabel">
				Name
				<input
					className="_rpInput"
					maxLength={DATASET_LIMITS.nameMax}
					value={step.name}
					onChange={e => onChange({ ...step, name: e.target.value, error: undefined })}
				/>
			</label>
			<span className="_rpMuted">
				{step.fileName}: {fmt(csv.rows.length)} rows, {csv.header.length} columns ({kept}{' '}
				kept). Check each column's label and type; the first {PREVIEW_ROWS} rows are shown.
			</span>
			{step.note ? <span className="_rpMuted">{step.note}</span> : null}
			<div className="_rpTableWrap _rpImport">
				<table className="_rpTable">
					<thead>
						<tr>
							{drafts.map((d, i) => (
								<th key={d.csvHeader} className={d.type === 'SKIP' ? '_skip' : ''}>
									<div className="_rpImportHead">
										<input
											className="_rpInput"
											aria-label={`Label of ${d.csvHeader}`}
											maxLength={DATASET_LIMITS.labelMax}
											value={d.label}
											disabled={d.type === 'SKIP'}
											onChange={e => setDraft(i, { label: e.target.value })}
										/>
										<select
											className="_rpSelect"
											aria-label={`Type of ${d.csvHeader}`}
											value={d.type}
											onChange={e =>
												setDraft(i, {
													type: e.target.value as
														DatasetColumnType | 'SKIP',
												})
											}
										>
											{(
												['TEXT', 'NUMBER', 'DATE'] as DatasetColumnType[]
											).map(t => (
												<option key={t} value={t}>
													{TYPE_LABELS[t]}
													{t === d.inferred ? ' (found)' : ''}
												</option>
											))}
											<option value="SKIP">Skip</option>
										</select>
										{bad[i] ? (
											<span className="_rpError">
												{fmt(bad[i])} not{' '}
												{d.type === 'NUMBER' ? 'numbers' : 'dates'}: left
												empty
											</span>
										) : null}
									</div>
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{csv.rows.slice(0, PREVIEW_ROWS).map((r, ri) => (
							<tr key={ri}>
								{drafts.map(d => (
									<td
										key={d.csvHeader}
										className={
											d.type === 'SKIP'
												? '_skip'
												: d.type === 'NUMBER'
													? '_num'
													: ''
										}
									>
										{r[d.index]}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
			{step.error ? (
				<div className="_rpError" role="alert">
					{step.error}
				</div>
			) : null}
		</>
	);
}

type RowAction =
	| { kind: 'rename'; id: string; name: string; error?: string; busy?: boolean }
	| { kind: 'delete'; id: string; busy?: boolean; error?: string };

/** The user's datasets: import, rename, replace with a newer CSV, delete (with a confirm). */
export function DatasetListDialog({
	transport,
	fns,
	dayOrder,
	onClose,
	onImported,
}: Readonly<{
	transport: ReportTransport;
	fns: DatasetFunctions;
	dayOrder?: DayOrder;
	onClose: () => void;
	onImported?: (datasetId: string, name: string) => void;
}>) {
	const ds = useDatasets(transport, fns);
	const [action, setAction] = useState<RowAction | undefined>(undefined);
	const [importing, setImporting] = useState<{ replace?: DatasetInfo } | undefined>(undefined);
	const list = ds.list ?? [];

	const doRename = async (a: Extract<RowAction, { kind: 'rename' }>) => {
		const target = list.find(d => d._id === a.id);
		if (!target) return;
		const err = nameError(a.name, list, a.id);
		if (err) return setAction({ ...a, error: err });
		setAction({ ...a, busy: true, error: undefined });
		try {
			await renameDataset(transport, fns, target, a.name.trim());
			setAction(undefined);
			invalidateCatalog();
			ds.reload();
		} catch (e: any) {
			setAction({
				...a,
				busy: false,
				error: `Could not rename: ${e?.message ?? 'unknown error'}`,
			});
		}
	};
	const doDelete = async (a: Extract<RowAction, { kind: 'delete' }>) => {
		setAction({ ...a, busy: true, error: undefined });
		try {
			await deleteDataset(transport, fns, a.id);
			setAction(undefined);
			invalidateCatalog();
			ds.reload();
		} catch (e: any) {
			setAction({ ...a, busy: false, error: e?.message ?? 'Could not delete.' });
		}
	};

	if (importing)
		return (
			<DatasetImportDialog
				transport={transport}
				fns={fns}
				existing={list}
				replace={importing.replace}
				dayOrder={dayOrder}
				onClose={() => {
					setImporting(undefined);
					ds.reload();
				}}
				onDone={onImported}
			/>
		);

	return (
		<Dialog kind="modal" label="Your data" onClose={onClose}>
			<div className="_rpDrawerHead">
				<span>Your data</span>
				<button
					type="button"
					className="_rpIconBtn"
					aria-label="Close"
					title="Close"
					onClick={onClose}
				>
					<Icon name="fa-xmark" />
				</button>
			</div>
			<div className="_rpDrawerBody">
				<div className="_rpRow" style={{ alignItems: 'center' }}>
					<span className="_rpMuted" style={{ flex: 1 }}>
						Data you imported from CSV files. Only you see it. {list.length} of{' '}
						{DATASET_LIMITS.perUser}.
					</span>
					<button
						type="button"
						className="_rpBtn _primary"
						disabled={!ds.list || list.length >= DATASET_LIMITS.perUser}
						title={
							list.length >= DATASET_LIMITS.perUser
								? `At most ${DATASET_LIMITS.perUser} datasets. Delete one first.`
								: undefined
						}
						onClick={() => setImporting({})}
					>
						<Icon name="fa-file-import" /> Import data
					</button>
				</div>
				{ds.error ? (
					<div className="_rpState" role="alert">
						<span className="_rpError">{ds.error}</span>
						<button type="button" className="_rpBtn" onClick={ds.reload}>
							Try again
						</button>
					</div>
				) : !ds.list ? (
					<div className="_rpSkeleton" aria-busy="true" />
				) : !list.length ? (
					<span className="_rpMuted">No data yet. Import a CSV file to start.</span>
				) : (
					<div className="_rpLib">
						{list.map(d => {
							const a = action?.id === d._id ? action : undefined;
							return (
								<div key={d._id} className="_rpLibRow">
									{a?.kind === 'rename' ? (
										<form
											className="_rpLine"
											style={{ flex: 1 }}
											onSubmit={e => {
												e.preventDefault();
												void doRename(a);
											}}
										>
											<input
												className="_rpInput"
												aria-label="New name"
												autoFocus
												maxLength={DATASET_LIMITS.nameMax}
												value={a.name}
												onChange={e =>
													setAction({
														...a,
														name: e.target.value,
														error: undefined,
													})
												}
											/>
											<button
												type="submit"
												className="_rpBtn _primary"
												disabled={a.busy}
											>
												Save
											</button>
											<button
												type="button"
												className="_rpBtn"
												onClick={() => setAction(undefined)}
											>
												Cancel
											</button>
										</form>
									) : (
										<div className="_rpLibName">
											<span>{d.name}</span>
											<span className="_rpMuted">
												{d.rowCount !== undefined
													? `${fmt(d.rowCount)} rows, `
													: ''}
												{d.columns.length} columns
												{d.updatedAt
													? `, updated ${new Date(d.updatedAt).toLocaleDateString()}`
													: ''}
											</span>
										</div>
									)}
									{a?.kind === 'delete' ? (
										<div className="_rpLine" role="alert">
											<span>
												Delete {d.name}? Widgets on it will show Dataset
												deleted.
											</span>
											<button
												type="button"
												className="_rpBtn"
												onClick={() => setAction(undefined)}
											>
												Cancel
											</button>
											<button
												type="button"
												className="_rpBtn _primary"
												disabled={a.busy}
												onClick={() => doDelete(a)}
											>
												Delete
											</button>
										</div>
									) : a?.kind !== 'rename' ? (
										<div className="_rpLine">
											<button
												type="button"
												className="_rpBtn"
												onClick={() =>
													setAction({
														kind: 'rename',
														id: d._id,
														name: d.name,
													})
												}
											>
												<Icon name="fa-pen" /> Rename
											</button>
											<button
												type="button"
												className="_rpBtn"
												onClick={() => setImporting({ replace: d })}
											>
												<Icon name="fa-arrows-rotate" /> Replace
											</button>
											<button
												type="button"
												className="_rpBtn"
												onClick={() =>
													setAction({ kind: 'delete', id: d._id })
												}
											>
												<Icon name="fa-trash" /> Delete
											</button>
										</div>
									) : null}
									{a?.error ? (
										<div
											className="_rpError"
											role="alert"
											style={{ flex: '1 1 100%' }}
										>
											{a.error}
										</div>
									) : null}
								</div>
							);
						})}
					</div>
				)}
			</div>
			<div className="_rpDrawerFoot">
				<button type="button" className="_rpBtn" onClick={onClose}>
					Close
				</button>
			</div>
		</Dialog>
	);
}

/** How to read 05/06/2026 for a catalog locale: month first only for US English. */
export function dayOrderFor(locale: string | undefined): DayOrder {
	return /^en-US$/i.test(String(locale ?? '')) ? 'MDY' : 'DMY';
}
