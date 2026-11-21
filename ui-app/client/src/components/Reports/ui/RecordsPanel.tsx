import React, { useEffect, useRef, useState } from 'react';
import { errorText, ReportTransport, runReport } from '../reportApi';
import { downloadText, exportFileName, toCsv } from '../reportExport';
import { FormatOptions } from '../reportFormat';
import {
	CatalogLink,
	ReportErrorBody,
	ReportSpec,
	ReportSuccess,
	SessionFilter,
} from '../reportTypes';
import { LinkContext, Navigator, rowLinkOf } from '../reportLinks';
import { recordsSpec } from '../reportSpecUtil';
import { DataTable, IconButton, Icon } from './common';
import { Dialog } from './portal';

/** Rows per page on screen, and the most a CSV export takes (CONTRACT 8.1). */
export const RECORDS_PAGE = 100;
export const RECORDS_EXPORT_MAX = 5000;

/** Records carry `_id` for the row link; it is never a column a person reads. */
export function hideRecordId(out: ReportSuccess): ReportSuccess {
	if (!out.columns.some(c => c.key === '_id' && !c.hidden)) return out;
	return {
		...out,
		columns: out.columns.map(c => (c.key === '_id' ? { ...c, hidden: true } : c)),
	};
}

/**
 * View records (CONTRACT 8.1 / 8.3): the records behind a widget or a clicked mark, a page of
 * 100 at a time through `reportRun` (the runner reads with the viewer's scope), each row opening
 * the source's record link, and a CSV of up to 5000.
 */
export function RecordsPanel({
	transport,
	runFunction,
	spec,
	extra,
	title,
	link,
	linkContext,
	navigate,
	fmt,
	onClose,
}: Readonly<{
	transport?: ReportTransport;
	runFunction: string;
	/** The widget's effective spec (source, segment, filters). */
	spec: ReportSpec;
	/** A clicked mark's Keep only filters. */
	extra?: SessionFilter[];
	title: string;
	link?: CatalogLink;
	linkContext?: Omit<LinkContext, 'row'>;
	navigate: Navigator;
	fmt: FormatOptions;
	onClose: () => void;
}>) {
	const [page, setPage] = useState(0);
	const [state, setState] = useState<{
		status: 'loading' | 'ok' | 'error';
		out?: ReportSuccess;
		error?: ReportErrorBody;
	}>({ status: 'loading' });
	const [csv, setCsv] = useState<{ busy: boolean; error?: string }>({ busy: false });
	const seq = useRef(0);

	useEffect(() => {
		if (!transport) return;
		const id = ++seq.current;
		setState(s => ({ ...s, status: 'loading' }));
		runReport(transport, runFunction, recordsSpec(spec, extra, page, RECORDS_PAGE)).then(r => {
			if (id !== seq.current) return;
			if (r.ok) setState({ status: 'ok', out: hideRecordId(r) });
			else setState(s => ({ status: 'error', error: r.error, out: s.out }));
		});
	}, [transport, runFunction, spec, extra, page]);

	const out = state.out;
	const total = Number.isFinite(out?.total) ? Number(out!.total) : undefined;
	const size = out?.size || RECORDS_PAGE;
	const first = page * size;
	const shownTo = first + (out?.rows.length ?? 0);
	const hasNext =
		total !== undefined
			? shownTo < total
			: typeof out?.truncated === 'boolean'
				? out.truncated
				: (out?.rows.length ?? 0) >= size;

	const exportCsv = async () => {
		if (!transport) return;
		setCsv({ busy: true });
		const r = await runReport(
			transport,
			runFunction,
			recordsSpec(spec, extra, 0, RECORDS_EXPORT_MAX, true),
			{ timeoutMs: 60000 },
		);
		if (!r.ok) {
			setCsv({ busy: false, error: errorText(r.error) });
			return;
		}
		downloadText(
			toCsv(hideRecordId(r)),
			exportFileName(`${title} records`, 'csv'),
			'text/csv;charset=utf-8',
		);
		setCsv({ busy: false });
	};

	return (
		<Dialog kind="modal" label={`${title} records`} onClose={onClose}>
			<div className="_rpDrawerHead">
				<span>{title}: records</span>
				<button
					type="button"
					className="_rpBtn"
					disabled={csv.busy || !out}
					onClick={exportCsv}
				>
					<Icon name={csv.busy ? 'fa-spinner fa-spin' : 'fa-file-csv'} /> CSV
				</button>
				<IconButton icon="fa-xmark" label="Close" onClick={onClose} />
			</div>
			<div className="_rpDrawerBody">
				{(extra ?? []).length ? (
					<div className="_rpRow">
						{extra!.map((f, i) => (
							<span key={i} className="_rpChip">
								{f.label ?? f.field}
							</span>
						))}
					</div>
				) : null}
				{csv.error ? (
					<div className="_rpError" role="alert">
						{csv.error}
					</div>
				) : null}
				{state.status === 'error' ? (
					<div className="_rpError" role="alert">
						{errorText(state.error)}
					</div>
				) : null}
				{!out && state.status === 'loading' ? (
					<div className="_rpSkeleton" aria-busy="true" style={{ minHeight: 160 }} />
				) : null}
				{out ? (
					out.rows.length ? (
						<DataTable
							out={out}
							fmt={{ ...fmt, numberFormat: undefined }}
							rowHref={link ? r => rowLinkOf(link, r, linkContext) : undefined}
							navigate={navigate}
						/>
					) : (
						<div className="_rpMuted">No records</div>
					)
				) : null}
			</div>
			<div className="_rpDrawerFoot" style={{ alignItems: 'center' }}>
				<span className="_rpMuted" style={{ flex: 1 }} aria-live="polite">
					{out && out.rows.length
						? `${first + 1} to ${shownTo}${total !== undefined ? ` of ${total}` : ''}`
						: ''}
					{state.status === 'loading' && out ? ' · Loading' : ''}
				</span>
				<button
					type="button"
					className="_rpBtn"
					disabled={page === 0 || state.status === 'loading'}
					onClick={() => setPage(p => Math.max(0, p - 1))}
				>
					<Icon name="fa-chevron-left" /> Previous
				</button>
				<button
					type="button"
					className="_rpBtn"
					disabled={!hasNext || state.status === 'loading'}
					onClick={() => setPage(p => p + 1)}
				>
					Next <Icon name="fa-chevron-right" />
				</button>
			</div>
		</Dialog>
	);
}
