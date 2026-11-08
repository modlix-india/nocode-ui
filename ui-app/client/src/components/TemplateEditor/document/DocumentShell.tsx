import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LANGUAGE_CODES } from '../commons';
import PartEditor from '../editors/PartEditor';
import PreviewPane from '../editors/PreviewPane';
import { docAi, fetchHtmlPreview, fetchPdfPreview, PreviewHeaders } from '../util/previewApi';
import { aiFields } from './aiBlocks';
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
import { compileDocument, diffModels, DocModel, importDocument } from './docModel';

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
	// The editor's AI endpoint (the aiEndpoint property); the Document look posts to <it>/doc.
	aiEndpoint?: string;
	// Editor Look AUTO: back to the classic editor for this template.
	onClassic?: () => void;
	// Another version to compare with (for a project or unit copy: the template it was copied from).
	compare?: { template?: any; label?: string; onOpen?: () => void };
}

// The cases sample sets cover, one AI request each.
const SET_CASES = [
	'One set: a single buyer, no co-applicant, every optional field empty.',
	'One set: two co-applicants, all details filled.',
	'One set: very long names, a long address and a large amount.',
	'One set: a company as the buyer, or the record type that differs most from the base.',
];

export interface SampleSet {
	id: string;
	name: string;
	description?: string;
	data: any;
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
	aiEndpoint,
	onClassic,
	compare,
}: Readonly<DocumentShellProps>) {
	const t = template ?? {};
	const kind: 'pdf' | 'email' = type === 'pdf' ? 'pdf' : 'email';
	const typeDef = TEMPLATE_TYPES[type];
	const [view, setView] = useState<DocView>('page');
	const [pickerOpen, setPickerOpen] = useState(false);
	const [moreOpenMenu, setMoreOpen] = useState(false);
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

	// Compare: the version as it was when it opened (until saved), or the one the page gives.
	const opened = useRef<{ key: string; t: any } | undefined>(undefined);
	const openKey = `${t.id ?? ''}|${t.name ?? ''}`;
	if (template && opened.current?.key !== openKey) opened.current = { key: openKey, t: template };
	const [compareWith, setCompareWith] = useState<'saved' | 'given' | undefined>();
	const [compareOpen, setCompareOpen] = useState(false);
	const otherTemplate =
		compareWith === 'saved'
			? opened.current?.t
			: compareWith === 'given'
				? compare?.template
				: undefined;
	const diff = useMemo(() => {
		if (!otherTemplate) return undefined;
		const other =
			otherTemplate.design?.document?.[lang] ??
			importDocument(getPartValue(otherTemplate, lang, 'body'), kind);
		return diffModels(other, model);
	}, [otherTemplate, model, lang, kind]);
	const compareLabel =
		compareWith === 'saved'
			? 'the version you opened'
			: (compare?.label ?? 'the template it was copied from');

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

	// Sample sets: saved with the template (design.sampleSets), made by the app's makers or by AI.
	const sets: SampleSet[] = Array.isArray(t.design?.sampleSets) ? t.design.sampleSets : [];
	const [setId, setSetId] = useState<string | undefined>();
	const [setsBusy, setSetsBusy] = useState(false);
	const [setsNote, setSetsNote] = useState<string | undefined>();
	const [newSetName, setNewSetName] = useState('');
	const activeSet = setId ? sets.find(x => x.id === setId) : undefined;
	const saveSets = (next: SampleSet[]) =>
		onChange({ ...t, design: { ...(t.design ?? {}), sampleSets: next } });
	const ai = aiEndpoint ? (body: any) => docAi(aiEndpoint, body, headers) : undefined;

	const usingRecord =
		!!records.recordId && records.recordData && typeof records.recordData === 'object';
	const data = usingRecord ? records.recordData : activeSet ? activeSet.data : previewDataOf(t);
	// A short key of the data's content: chips refresh when it changes, not on every edit.
	const dataJson = useMemo(() => JSON.stringify(data ?? null), [data]);
	const dataKey = useMemo(() => {
		let h = 0;
		for (let i = 0; i < dataJson.length; i++) h = (h * 31 + dataJson.charCodeAt(i)) | 0;
		return `${dataJson.length}:${h}`;
	}, [dataJson]);
	const recordLabel = usingRecord
		? (records.records?.find(r => r.id === records.recordId)?.label ?? 'the record')
		: activeSet
			? activeSet.name
			: 'the sample data';

	const makeSets = async () => {
		if (!ai) return;
		setSetsBusy(true);
		setSetsNote(undefined);
		try {
			// One set per request, all at once: each answers in seconds, where four in one would outlast
			// the gateway.
			const base = {
				mode: 'samples',
				fields: aiFields(variables),
				schema: t.variableSchema ?? {},
				sample: previewDataOf(t) ?? {},
				count: 1,
			};
			const answers = await Promise.allSettled(
				SET_CASES.map(c => ai({ ...base, prompt: c })),
			);
			const res = {
				sets: answers.flatMap(a => (a.status === 'fulfilled' ? (a.value?.sets ?? []) : [])),
				message: undefined as string | undefined,
			};
			if (!res.sets.length) throw new Error('none');
			res.message = `${res.sets.length} sample set${res.sets.length === 1 ? '' : 's'} made.`;
			const made: SampleSet[] = (res?.sets ?? []).map((x: any, i: number) => ({
				id: `s${Date.now().toString(36)}${i}`,
				name: `${x.name ?? `Set ${i + 1}`}`,
				description: x.description,
				data: x.data,
			}));
			if (made.length) saveSets([...sets, ...made]);
			setSetsNote(res?.message ?? `${made.length} sets made.`);
		} catch (e: any) {
			setSetsNote(e?.response?.data?.detail ?? 'The AI could not make sets. Try again.');
		} finally {
			setSetsBusy(false);
		}
	};

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
						<b>{usingRecord || activeSet ? recordLabel : 'Sample data'}</b>
						{records.recordId && !usingRecord && (
							<span className="_muted"> loading…</span>
						)}
						<i className="fa fa-solid fa-chevron-down" />
					</button>
					{pickerOpen && (
						<div className="_docPickerMenu">
							<button
								className={`_docPickerItem ${!records.recordId && !setId ? '_on' : ''}`}
								onClick={() => {
									records.onPick?.(undefined);
									setSetId(undefined);
									setPickerOpen(false);
								}}
							>
								Sample data <small>the template's own example</small>
							</button>
							<div className="_docPickerHead">Sample sets</div>
							{sets.length === 0 && (
								<div className="_muted">
									None yet. Make them with AI, or save the data in use.
								</div>
							)}
							{sets.map(x => (
								<div
									key={x.id}
									className={`_docPickerSet ${setId === x.id && !records.recordId ? '_on' : ''}`}
								>
									<button
										className="_docPickerItem"
										onClick={() => {
											setSetId(x.id);
											if (records.recordId) records.onPick?.(undefined);
											setPickerOpen(false);
										}}
									>
										{x.name}
										{x.description && <small>{x.description}</small>}
									</button>
									<button
										className="_iconBtn"
										title="Remove this set"
										onClick={() => {
											if (setId === x.id) setSetId(undefined);
											saveSets(sets.filter(y => y.id !== x.id));
										}}
									>
										<i className="fa fa-regular fa-trash-can" />
									</button>
								</div>
							))}
							<div className="_docPickerActions">
								{ai && (
									<button
										className="_addBtn"
										disabled={setsBusy}
										onClick={makeSets}
									>
										<i className="fa fa-solid fa-wand-magic-sparkles" />{' '}
										{setsBusy ? 'Making sets…' : 'Make sets with AI'}
									</button>
								)}
								<input
									className="_fld"
									placeholder="Name, to save the data in use"
									value={newSetName}
									onChange={e => setNewSetName(e.target.value)}
								/>
								<button
									className="_addBtn"
									disabled={!newSetName.trim()}
									onClick={() => {
										saveSets([
											...sets,
											{
												id: `s${Date.now().toString(36)}`,
												name: newSetName.trim(),
												data,
											},
										]);
										setNewSetName('');
									}}
								>
									<i className="fa fa-solid fa-plus" /> Save as a set
								</button>
								{setsNote && <div className="_docAiNote">{setsNote}</div>}
							</div>
							<div className="_docPickerHead">Records</div>
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
				<div className="_docPicker">
					<button
						className={`_docPickerBtn ${diff ? '_docCompareOn' : ''}`}
						onClick={() => {
							setCompareOpen(o => !o);
							compare?.onOpen?.();
						}}
						title="See what changed"
					>
						<i className="fa fa-solid fa-code-compare" />{' '}
						{diff
							? `${diff.count} change${diff.count === 1 ? '' : 's'} from ${compareLabel}`
							: 'Compare'}
						<i className="fa fa-solid fa-chevron-down" />
					</button>
					{compareOpen && (
						<div className="_docPickerMenu">
							<button
								className={`_docPickerItem ${!compareWith ? '_on' : ''}`}
								onClick={() => {
									setCompareWith(undefined);
									setCompareOpen(false);
								}}
							>
								No comparing
							</button>
							<button
								className={`_docPickerItem ${compareWith === 'saved' ? '_on' : ''}`}
								onClick={() => {
									setCompareWith('saved');
									setCompareOpen(false);
								}}
							>
								The version you opened <small>what you changed before saving</small>
							</button>
							{compare && (
								<button
									className={`_docPickerItem ${compareWith === 'given' ? '_on' : ''}`}
									disabled={!compare.template}
									onClick={() => {
										setCompareWith('given');
										setCompareOpen(false);
									}}
								>
									{compare.label ?? 'The template it was copied from'}
									<small>
										{compare.template
											? 'what this copy does differently'
											: compare.template === null
												? 'this template is not a copy of another'
												: 'loading…'}
									</small>
								</button>
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
				<div className="_docPicker _docMore">
					<button className="_docPickerBtn" onClick={() => setMoreOpen(o => !o)}>
						More <i className="fa fa-solid fa-chevron-down" />
					</button>
					{moreOpenMenu && (
						<div className="_docPickerMenu _docMoreMenu">
							{(['variables', 'sample', 'settings'] as const).map(k => (
								<button
									key={k}
									className={`_docPickerItem ${moreOpen === k ? '_on' : ''}`}
									onClick={() => {
										onMore(moreOpen === k ? undefined : k);
										setMoreOpen(false);
									}}
								>
									{k === 'variables'
										? 'Fields setup'
										: k === 'sample'
											? 'Sample data'
											: 'Settings'}
									<small>
										{k === 'variables'
											? 'where the fields come from'
											: k === 'sample'
												? 'the example the preview uses'
												: 'language, sender, recipients'}
									</small>
								</button>
							))}
							{onClassic && (
								<button className="_docPickerItem" onClick={onClassic}>
									Classic editor{' '}
									<small>the editor as before, with the HTML</small>
								</button>
							)}
						</div>
					)}
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
						dataLabel={usingRecord || activeSet ? recordLabel : 'sample data'}
						ai={ai}
						diff={diff}
						inboxFrom={data?.sender || data?.tenant?.name || ''}
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
