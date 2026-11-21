import { DatasetColumn, DatasetInfo, batches } from './datasetModel';
import { eventResults, namespaceOf, ReportCallError, ReportTransport } from './reportApi';

/**
 * The app's dataset functions (CONTRACT 10): `<ns>.reportDatasetSave`, `<ns>.reportDatasetList`,
 * `<ns>.reportDatasetDelete`. The owner is always the caller (the app takes it from the session).
 */

/** One part can take a while (up to 1000 rows written by the app's function). */
export const DATASET_PART_TIMEOUT_MS = 120000;

export interface DatasetFunctions {
	save: string;
	list: string;
	remove: string;
}

export function datasetFunctions(
	appNamespace: string | undefined,
	runFunction?: string,
): DatasetFunctions | undefined {
	const ns = appNamespace || namespaceOf(runFunction);
	if (!ns) return undefined;
	return {
		save: `${ns}.reportDatasetSave`,
		list: `${ns}.reportDatasetList`,
		remove: `${ns}.reportDatasetDelete`,
	};
}

/** The function's own answer, unwrapped from `result` and checked for `{ok:false}`. */
function answer(data: any): any {
	const r = eventResults(data);
	const inner = r.result !== undefined && Object.keys(r).length === 1 ? r.result : r;
	const err = inner?.ok === false ? inner : r?.ok === false ? r : undefined;
	if (err)
		throw new ReportCallError(
			String(err.error?.code ?? 'DATASET_FAILED'),
			String(err.error?.message ?? err.message ?? 'The data could not be saved.'),
		);
	return inner;
}

function findArray(v: any): any[] | undefined {
	if (Array.isArray(v)) return v;
	if (!v || typeof v !== 'object') return undefined;
	for (const k of ['datasets', 'result', 'list', 'content']) {
		const a = findArray(v[k]);
		if (a) return a;
	}
	return Object.values(v).find(Array.isArray) as any[] | undefined;
}

function normalize(d: any): DatasetInfo | undefined {
	const id = d?._id ?? d?.id ?? d?.datasetId;
	if (!id) return undefined;
	return {
		_id: String(id),
		name: String(d.name ?? ''),
		columns: Array.isArray(d.columns) ? d.columns : [],
		rowCount: d.rowCount === undefined ? undefined : Number(d.rowCount),
		createdAt: d.createdAt,
		updatedAt: d.updatedAt,
	};
}

/** The caller's own datasets, newest first. */
export async function listDatasets(
	transport: ReportTransport,
	fns: DatasetFunctions,
): Promise<DatasetInfo[]> {
	const a = findArray(answer(await transport.call(fns.list, {}))) ?? [];
	return a
		.map(normalize)
		.filter((d): d is DatasetInfo => !!d)
		.sort((x, y) => String(y.updatedAt ?? '').localeCompare(String(x.updatedAt ?? '')));
}

function idOf(v: any): string | undefined {
	if (!v || typeof v !== 'object') return undefined;
	const id = v.datasetId ?? v._id ?? v.id ?? idOf(v.result) ?? idOf(v.dataset);
	return id ? String(id) : undefined;
}

export interface SaveProgress {
	part: number;
	parts: number;
	rowsSent: number;
}

/**
 * Creates (no `datasetId`) or replaces a dataset in parts of up to 1000 rows. Part 1 makes the
 * dataset (or, on a replace, clears its old rows); later parts carry the id part 1 answered.
 * Throws a ReportCallError naming the part that failed; `datasetId` on it is set once known so a
 * retry can replace instead of making a second dataset.
 */
export async function saveDataset(
	transport: ReportTransport,
	fns: DatasetFunctions,
	input: {
		datasetId?: string;
		name: string;
		columns: DatasetColumn[];
		rows: Array<Array<string | number | null>>;
	},
	onProgress?: (p: SaveProgress) => void,
): Promise<string> {
	const parts = batches(input.rows);
	let datasetId = input.datasetId;
	let sent = 0;
	onProgress?.({ part: 0, parts: parts.length, rowsSent: 0 });
	for (let i = 0; i < parts.length; i++) {
		try {
			const res = answer(
				await transport.call(
					fns.save,
					{
						...(datasetId ? { datasetId } : {}),
						name: input.name,
						columns: input.columns,
						rows: parts[i],
						part: i + 1,
						parts: parts.length,
					},
					{ timeoutMs: DATASET_PART_TIMEOUT_MS },
				),
			);
			datasetId = idOf(res) ?? datasetId;
			if (!datasetId)
				throw new ReportCallError('BAD_OUTPUT', 'The app did not answer a dataset id.');
		} catch (e: any) {
			const err = new ReportCallError(
				e?.code ?? 'DATASET_FAILED',
				`Part ${i + 1} of ${parts.length} did not save: ${e?.message ?? 'unknown error'}`,
			) as ReportCallError & { datasetId?: string };
			err.datasetId = datasetId;
			throw err;
		}
		sent += parts[i].length;
		onProgress?.({ part: i + 1, parts: parts.length, rowsSent: sent });
	}
	return datasetId!;
}

/**
 * Renames a dataset: `part: 0` is a metadata only save (name and column labels; the rows stay).
 * Never a save without `part`: the app reads that as part 1, which on an existing dataset is a
 * replace and clears its rows.
 */
export async function renameDataset(
	transport: ReportTransport,
	fns: DatasetFunctions,
	ds: DatasetInfo,
	name: string,
): Promise<void> {
	answer(
		await transport.call(fns.save, {
			datasetId: ds._id,
			name,
			columns: ds.columns,
			rows: [],
			part: 0,
			parts: 0,
		}),
	);
}

export async function deleteDataset(
	transport: ReportTransport,
	fns: DatasetFunctions,
	datasetId: string,
): Promise<void> {
	answer(await transport.call(fns.remove, { datasetId }));
}
