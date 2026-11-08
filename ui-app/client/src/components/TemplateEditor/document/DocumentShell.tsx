import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LANGUAGE_CODES } from '../commons';
import PartEditor from '../editors/PartEditor';
import PreviewPane from '../editors/PreviewPane';
import { fetchHtmlPreview, fetchPdfPreview, PreviewHeaders } from '../util/previewApi';
import {
	getPartValue,
	previewDataOf,
	setPartValue,
	TEMPLATE_TYPE_ICONS,
	TEMPLATE_TYPES,
	TemplateTypeKey,
} from '../util/templateTypes';
import { VariableEntry } from '../util/variableUtils';
import DocumentEditor, { DocView, PreviewRecord } from './DocumentEditor';
import { compileDocument, DocModel, importDocument } from './docModel';

// The Document look of the Template Editor (component property editorLook = DOCUMENT): one bar on
// top (type, language, what the preview uses, Page / Preview / Code), and the page itself. The
// classic panels (Variables setup, Sample data, Settings) stay reachable from More.

export interface RecordSource {
	records?: PreviewRecord[];
	recordId?: string;
	recordData?: any;
	onPick?: (id: string | undefined) => void;
	onOpen?: () => void;
}

interface DocumentShellProps {
	template: any;
	onChange: (t: any) => void;
	type: TemplateTypeKey;
	lang: string;
	onLang: (l: string) => void;
	variables: VariableEntry[];
	headers: PreviewHeaders;
	records: RecordSource;
	morePanel: React.ReactNode;
	onMore: (panel: 'variables' | 'sample' | 'settings' | undefined) => void;
	moreOpen?: string;
}

// "The following has evaluated to null or missing: bf.x" -> the field, for plain words.
export function errorInWords(
	msg: string,
	labelOf: (p: string) => string,
	recordLabel: string,
): { text: string; paths: string[] } {
	const miss = /evaluated to null or missing:\s*([\w.()[\]]+)/.exec(msg);
	if (miss) {
		const path = miss[1].replace(/[()]/g, '');
		return {
			text: `The field ${labelOf(path)} (${path}) is empty for ${recordLabel}, so the document cannot be made. Click the field on the page and give it a value to show when it is empty, or show its block only if it has a value.`,
			paths: [path],
		};
	}
	const line = /line (\d+)/i.exec(msg);
	if (line)
		return {
			text: `Line ${line[1]} of the HTML: ${msg.replace(/\s*\(?on line \d+\)?/i, '')}. Open Code to fix it.`,
			paths: [],
		};
	return { text: msg, paths: [] };
}

export default function DocumentShell({
	template,
	onChange,
	type,
	lang,
	onLang,
	variables,
	headers,
	records,
	morePanel,
	onMore,
	moreOpen,
}: Readonly<DocumentShellProps>) {
	const t = template ?? {};
	const kind: 'pdf' | 'email' = type === 'pdf' ? 'pdf' : 'email';
	const typeDef = TEMPLATE_TYPES[type];
	const [view, setView] = useState<DocView>('page');
	const [pickerOpen, setPickerOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [preview, setPreview] = useState<{
		html?: string;
		subject?: string;
		pdfUrl?: string;
		loading: boolean;
		error?: string;
	}>({ loading: false });
	const [check, setCheck] = useState<{ text: string; paths: string[] } | undefined>();
	const body = getPartValue(t, lang, 'body');

	// The page model: the saved one for this language, else read from the HTML.
	const saved: DocModel | undefined = t.design?.document?.[lang];
	const imported = useMemo(
		() => (saved ? undefined : importDocument(body, kind)),
		[saved, body, kind],
	);
	const model = saved ?? imported!;

	const onModel = (m: DocModel) => {
		let next = setPartValue(t, lang, 'body', compileDocument(m));
		const design = { ...(next.design ?? {}) };
		design.document = { ...(design.document ?? {}), [lang]: m };
		next = { ...next, design };
		onChange(next);
	};

	// Code edits change the HTML; the page reads it again from there.
	const onCode = (v: string) => {
		let next = setPartValue(t, lang, 'body', v);
		if (next.design?.document?.[lang]) {
			const document = { ...next.design.document };
			delete document[lang];
			next = { ...next, design: { ...next.design, document } };
		}
		onChange(next);
	};

	const usingRecord =
		!!records.recordId && records.recordData && typeof records.recordData === 'object';
	const data = usingRecord ? records.recordData : previewDataOf(t);
	// A short key of the data's content: chips refresh when it changes, not on every edit.
	const dataJson = useMemo(() => JSON.stringify(data ?? null), [data]);
	const dataKey = useMemo(() => {
		let h = 0;
		for (let i = 0; i < dataJson.length; i++) h = (h * 31 + dataJson.charCodeAt(i)) | 0;
		return `${dataJson.length}:${h}`;
	}, [dataJson]);
	const recordLabel = usingRecord
		? (records.records?.find(r => r.id === records.recordId)?.label ?? 'the record')
		: 'the sample data';

	const labelOf = useCallback(
		(p: string) =>
			variables.find(v => v.path === p || v.path.replace(/\[0\]/g, '') === p)?.label ??
			p.split('.').pop() ??
			p,
		[variables],
	);

	// The server checks the template with the data in use (debounced), so a field that would break
	// the document shows on the page, in words, before anyone makes the PDF.
	useEffect(() => {
		if (!body.trim()) return;
		let live = true;
		const h = setTimeout(async () => {
			try {
				await fetchHtmlPreview(t, lang, data, headers);
				if (live) setCheck(undefined);
			} catch (e: any) {
				const msg = e?.response?.data?.message ?? e?.message ?? '';
				if (live && msg) setCheck(errorInWords(msg, labelOf, recordLabel));
			}
		}, 1200);
		return () => {
			live = false;
			clearTimeout(h);
		};
	}, [body, data, lang]); // eslint-disable-line react-hooks/exhaustive-deps

	const pdfRef = useRef<string | undefined>(undefined);
	const runPreview = useCallback(async () => {
		setPreview(p => ({ ...p, loading: true, error: undefined }));
		try {
			if (kind === 'pdf') {
				const url = await fetchPdfPreview(t, data, headers);
				if (pdfRef.current) URL.revokeObjectURL(pdfRef.current);
				pdfRef.current = url;
				setPreview({ pdfUrl: url, loading: false });
			} else {
				const parts = await fetchHtmlPreview(t, lang, data, headers);
				setPreview({ html: parts.body ?? '', subject: parts.subject, loading: false });
			}
		} catch (e: any) {
			const msg = e?.response?.data?.message ?? e?.message ?? 'Preview failed';
			setPreview({ loading: false, error: errorInWords(msg, labelOf, recordLabel).text });
		}
	}, [t, data, headers, kind, lang, labelOf, recordLabel]);

	useEffect(() => {
		if (view !== 'pdf') return;
		const h = setTimeout(runPreview, 500);
		return () => clearTimeout(h);
	}, [view, runPreview]);

	useEffect(
		() => () => {
			if (pdfRef.current) URL.revokeObjectURL(pdfRef.current);
		},
		[],
	);

	const list = (records.records ?? []).filter(
		r => !query.trim() || r.label.toLowerCase().includes(query.trim().toLowerCase()),
	);

	return (
		<div className="_templateEditor _docLook">
			<div className="_docTopBar">
				<div className="_teTypeChip" title="Template type is fixed at creation">
					<i className={`fa fa-solid ${TEMPLATE_TYPE_ICONS[type]}`} />{' '}
					{typeDef.displayName}
				</div>
				<label className="_teSelect">
					<span>Language</span>
					<select value={lang} onChange={e => onLang(e.target.value)}>
						{LANGUAGE_CODES.map(l => (
							<option key={l} value={l}>
								{l}
							</option>
						))}
					</select>
				</label>
				<div className="_docPicker">
					<button
						className="_docPickerBtn"
						onClick={() => {
							setPickerOpen(o => !o);
							if (!pickerOpen) records.onOpen?.();
						}}
					>
						<i className="fa fa-solid fa-database" /> Preview with:{' '}
						<b>{usingRecord ? recordLabel : 'Sample data'}</b>
						{records.recordId && !usingRecord && (
							<span className="_muted"> loading…</span>
						)}
						<i className="fa fa-solid fa-chevron-down" />
					</button>
					{pickerOpen && (
						<div className="_docPickerMenu">
							<button
								className={`_docPickerItem ${!records.recordId ? '_on' : ''}`}
								onClick={() => {
									records.onPick?.(undefined);
									setPickerOpen(false);
								}}
							>
								Sample data <small>the template's own example</small>
							</button>
							{records.onPick ? (
								<>
									<input
										className="_fld"
										autoFocus
										placeholder="Find a record, for example CX-1001"
										value={query}
										onChange={e => setQuery(e.target.value)}
									/>
									<div className="_docPickerList">
										{records.records === undefined && (
											<div className="_muted">Loading…</div>
										)}
										{records.records !== undefined && list.length === 0 && (
											<div className="_muted">No record matches.</div>
										)}
										{list.slice(0, 50).map(r => (
											<button
												key={r.id}
												className={`_docPickerItem ${records.recordId === r.id ? '_on' : ''}`}
												onClick={() => {
													records.onPick?.(r.id);
													setPickerOpen(false);
												}}
											>
												{r.label}
											</button>
										))}
									</div>
								</>
							) : (
								<div className="_muted">
									This screen has no records to preview with.
								</div>
							)}
						</div>
					)}
				</div>
				<div className="_segmented _docViews">
					<button
						className={view === 'page' ? '_on' : ''}
						onClick={() => setView('page')}
					>
						<i className="fa fa-regular fa-file-lines" />{' '}
						{kind === 'pdf' ? 'Page' : 'Email'}
					</button>
					<button className={view === 'pdf' ? '_on' : ''} onClick={() => setView('pdf')}>
						<i className="fa fa-regular fa-eye" />{' '}
						{kind === 'pdf' ? 'PDF' : 'Inbox preview'}
					</button>
					<button
						className={view === 'code' ? '_on' : ''}
						onClick={() => setView('code')}
					>
						<i className="fa fa-solid fa-code" /> Code
					</button>
				</div>
				<div className="_docMore">
					{(['variables', 'sample', 'settings'] as const).map(k => (
						<button
							key={k}
							className={`_teTab ${moreOpen === k ? '_active' : ''}`}
							onClick={() => onMore(moreOpen === k ? undefined : k)}
						>
							{k === 'variables'
								? 'Fields setup'
								: k === 'sample'
									? 'Sample data'
									: 'Settings'}
						</button>
					))}
				</div>
			</div>

			{check && view !== 'code' && (
				<div className="_docCheck">
					<i className="fa fa-solid fa-triangle-exclamation" /> {check.text}
				</div>
			)}

			<div className="_docMain">
				{view === 'page' && (
					<DocumentEditor
						model={model}
						onModel={onModel}
						kind={kind}
						variables={variables}
						data={data}
						dataKey={dataKey}
						dataLabel={usingRecord ? recordLabel : 'sample data'}
						view={view}
						errorPaths={check?.paths ?? []}
						subject={
							typeDef.subjectKey
								? getPartValue(t, lang, typeDef.subjectKey)
								: undefined
						}
						onSubject={
							typeDef.subjectKey
								? v => onChange(setPartValue(t, lang, typeDef.subjectKey!, v))
								: undefined
						}
					/>
				)}
				{view === 'pdf' && (
					<div className="_docPreview">
						<PreviewPane
							format={kind === 'pdf' ? 'pdf' : 'html'}
							html={preview.html}
							pdfUrl={preview.pdfUrl}
							loading={preview.loading}
							error={preview.error}
							device="DESKTOP"
							onDevice={() => undefined}
							onRefresh={runPreview}
							renderedSubject={preview.subject}
							subjectValue={
								typeDef.subjectKey
									? getPartValue(t, lang, typeDef.subjectKey)
									: undefined
							}
						/>
					</div>
				)}
				{view === 'code' && (
					<div className="_docCode">
						<PartEditor
							part={typeDef.parts[0]}
							value={body}
							onChange={onCode}
							variables={variables}
						/>
					</div>
				)}
				{moreOpen && <div className="_teRightPanel _docMorePanel">{morePanel}</div>}
			</div>
		</div>
	);
}
