import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LOCAL_STORE_PREFIX, STORE_PREFIX } from '../../constants';
import { getDataFromPath, PageStoreExtractor } from '../../context/StoreContext';
import { LocationHistory, PageDefinition, RenderContext } from '../../types/common';
import { updateBlockProps } from './blocks/blockOperations';
import BlockCanvas from './blocks/BlockCanvas';
import BlockPalette from './blocks/BlockPalette';
import BlockPropertiesPanel from './blocks/BlockPropertiesPanel';
import { Block } from './blocks/blockTypes';
import { compileBlocksToHtml } from './blocks/compileBlocksToHtml';
import { htmlToBlocks } from './blocks/htmlToBlocks';
import { LANGUAGE_CODES } from './commons';
import PartEditor from './editors/PartEditor';
import PreviewPane, { PreviewDevice } from './editors/PreviewPane';
import RootSettingsPanel, { RootOptions } from './editors/RootSettingsPanel';
import SampleDataPanel from './editors/SampleDataPanel';
import SettingsPanel from './editors/SettingsPanel';
import VariablesPanel from './editors/VariablesPanel';
import {
	decideMode,
	EditorMode,
	followLanguage,
	partHasDesign,
	partHasHtml,
} from './util/editorModeState';
import AiPanel, { AiMessage } from './editors/AiPanel';
import { fetchHtmlPreview, fetchPdfPreview, generateTemplate, PreviewHeaders } from './util/previewApi';
import { sampleFromSchema } from './util/schemaSample';
import {
	getPartValue,
	resolveTemplateType,
	setPartValue,
	TEMPLATE_TYPES,
	TemplateTypeKey,
} from './util/templateTypes';
import { collectVariables } from './util/variableUtils';

interface LazyTemplateEditorProps {
	template: any;
	onChange: (t: any) => void;
	lockedType?: string;
	aiEndpoint?: string;
	context: RenderContext;
	pageDefinition: PageDefinition;
	locationHistory: Array<LocationHistory>;
	pageExtractor: PageStoreExtractor;
}

type RightPanel = 'variables' | 'sample' | 'settings' | undefined;

interface PreviewState {
	html?: string;
	subject?: string;
	pdfUrl?: string;
	loading: boolean;
	error?: string;
}

function extractError(e: any): string {
	if (e?.response?.data && typeof e.response.data === 'object' && e.response.data.message)
		return e.response.data.message;
	if (e?.response?.status) return `Preview failed (HTTP ${e.response.status})`;
	return e?.message ?? 'Preview failed';
}

export default function LazyTemplateEditor({
	template,
	onChange,
	lockedType,
	aiEndpoint,
	locationHistory,
	pageExtractor,
}: Readonly<LazyTemplateEditorProps>) {
	const t = template ?? {};
	const type: TemplateTypeKey = resolveTemplateType(t, lockedType);
	const typeDef = TEMPLATE_TYPES[type];
	const forPdf = type === 'pdf';

	const [activeLang, setActiveLang] = useState<string>(t.defaultLanguage || 'en');
	const [activePart, setActivePart] = useState<string>(typeDef.previewPart);
	const [rightPanel, setRightPanel] = useState<RightPanel>(undefined);
	const [device, setDevice] = useState<PreviewDevice>('DESKTOP');
	const [preview, setPreview] = useState<PreviewState>({ loading: false });
	const [mode, setMode] = useState<EditorMode>('code');
	const [selectedBlockId, setSelectedBlockId] = useState<string | undefined>();
	const [aiHistory, setAiHistory] = useState<AiMessage[]>([]);
	const [aiLoading, setAiLoading] = useState(false);
	const [aiError, setAiError] = useState<string | undefined>();

	// The template loads asynchronously (bound to the page store), so language + mode must be
	// re-derived when the data actually arrives, not just at mount. These refs let us honor an
	// explicit user choice while still auto-correcting once the real template shows up.
	const langPickedRef = useRef(false);
	const modeTargetRef = useRef(''); // the target (type|lang|part) we last auto-decided a mode for
	const userModeRef = useRef(false); // did the user manually toggle Visual/Code for that target

	const activePartDef = typeDef.parts.find(p => p.key === activePart) ?? typeDef.parts[0];
	const designBlocks: Block[] = t.design?.[activeLang]?.[activePart] ?? [];

	// Keep the active part valid when the type changes.
	useEffect(() => {
		if (!typeDef.parts.some(p => p.key === activePart)) setActivePart(typeDef.previewPart);
	}, [type]); // eslint-disable-line react-hooks/exhaustive-deps

	// Follow the loaded template's language once it arrives (until the user picks one). Without this,
	// a template whose parts live under a non-'en' default would open showing an empty editor.
	useEffect(() => {
		const next = followLanguage(template, activeLang, langPickedRef.current);
		if (next !== activeLang) setActiveLang(next);
	}, [template]); // eslint-disable-line react-hooks/exhaustive-deps

	// Keep the editor mode correct from current facts (self-healing — see util/editorModeState).
	// Raw HTML that the block editor can't represent is forced into Code; an explicit toggle or a
	// per-keystroke edit is preserved. Runs on every relevant change so it can recover a stale mode
	// left by an async load or a dev Fast-Refresh, not just a one-time content-arrival edge.
	useEffect(() => {
		const targetKey = `${type}|${activeLang}|${activePart}`;
		const { mode: nextMode, targetChanged } = decideMode({
			targetKey,
			prevTargetKey: modeTargetRef.current,
			currentMode: mode,
			userPicked: userModeRef.current,
			hasHtml: partHasHtml(template, activeLang, activePart),
			hasDesign: partHasDesign(template, activeLang, activePart),
		});
		if (targetChanged) {
			modeTargetRef.current = targetKey;
			userModeRef.current = false;
			setSelectedBlockId(undefined);
		}
		if (nextMode) setMode(nextMode);
	}, [type, activeLang, activePart, template, mode]); // eslint-disable-line react-hooks/exhaustive-deps

	const headers = useMemo<PreviewHeaders>(
		() => ({
			Authorization: getDataFromPath(
				`${LOCAL_STORE_PREFIX}.AuthToken`,
				locationHistory,
				pageExtractor,
			),
			clientCode:
				getDataFromPath(
					`${STORE_PREFIX}.auth.loggedInClientCode`,
					locationHistory,
					pageExtractor,
				) ??
				getDataFromPath(
					`${STORE_PREFIX}.application.clientCode`,
					locationHistory,
					pageExtractor,
				),
			appCode: getDataFromPath(
				`${STORE_PREFIX}.application.appCode`,
				locationHistory,
				pageExtractor,
			),
		}),
		[locationHistory, pageExtractor],
	);

	const variables = useMemo(() => collectVariables(t.variableSchema), [t.variableSchema]);

	const pdfUrlRef = useRef<string | undefined>(undefined);
	const doPreview = useCallback(async () => {
		if (!template) return;
		setPreview(p => ({ ...p, loading: true, error: undefined }));
		try {
			if (typeDef.previewFormat === 'pdf') {
				// A blank body can't be rendered to a PDF (the server rejects empty HTML), so a new
				// PDF template would otherwise show a scary error. Show an empty state instead.
				const body = getPartValue(template, activeLang, typeDef.previewPart);
				if (!body.trim()) {
					if (pdfUrlRef.current) {
						URL.revokeObjectURL(pdfUrlRef.current);
						pdfUrlRef.current = undefined;
					}
					setPreview({ loading: false });
					return;
				}
				const url = await fetchPdfPreview(template, template.sampleData, headers);
				if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
				pdfUrlRef.current = url;
				setPreview({ pdfUrl: url, loading: false });
			} else {
				const parts = await fetchHtmlPreview(
					template,
					activeLang,
					template.sampleData,
					headers,
				);
				setPreview({
					html: parts[typeDef.previewPart] ?? '',
					subject: parts.subject,
					loading: false,
				});
			}
		} catch (e) {
			setPreview(p => ({ ...p, loading: false, error: extractError(e) }));
		}
	}, [template, activeLang, typeDef, headers]);

	// Auto-refresh preview (debounced) as the template is edited.
	useEffect(() => {
		const h = setTimeout(() => doPreview(), 800);
		return () => clearTimeout(h);
	}, [doPreview]);

	useEffect(
		() => () => {
			if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
		},
		[],
	);

	const setPart = (value: string) =>
		onChange(setPartValue(template, activeLang, activePart, value));

	// Root/body layout options are persisted on design.options and feed the compiled email shell.
	const rootOptions: RootOptions = t.design?.options ?? {};
	const compileOpts = {
		forPdf,
		maxWidth: rootOptions.maxWidth ?? (forPdf ? 800 : 600),
		bodyBg: rootOptions.bodyBg,
		contentBg: rootOptions.contentBg,
		fontFamily: rootOptions.fontFamily,
	};

	// Persist the block tree AND its compiled HTML together, so rendering always has fresh HTML.
	const onBlocksChange = (blocks: Block[]) => {
		const next = { ...t };
		const design = { ...(next.design ?? {}) };
		const langDesign = { ...(design[activeLang] ?? {}) };
		langDesign[activePart] = blocks;
		design[activeLang] = langDesign;
		next.design = design;

		const parts = { ...(next.templateParts ?? {}) };
		const langParts = { ...(parts[activeLang] ?? {}) };
		langParts[activePart] = compileBlocksToHtml(blocks, compileOpts);
		parts[activeLang] = langParts;
		next.templateParts = parts;

		onChange(next);
	};

	// Change a root/body option, then recompile every part that has a block design so the shell
	// (background/width/font) updates everywhere it applies. Parts authored purely as Code are left
	// untouched (they have no design entry).
	const setRootOptions = (patch: RootOptions) => {
		const design = { ...(t.design ?? {}) };
		const options = { ...(design.options ?? {}), ...patch };
		design.options = options;
		const opts = {
			forPdf,
			maxWidth: options.maxWidth ?? (forPdf ? 800 : 600),
			bodyBg: options.bodyBg,
			contentBg: options.contentBg,
			fontFamily: options.fontFamily,
		};
		const parts = { ...(t.templateParts ?? {}) };
		Object.keys(design).forEach(lang => {
			if (lang === 'options') return;
			const langDesign = design[lang];
			if (!langDesign || typeof langDesign !== 'object') return;
			Object.keys(langDesign).forEach(part => {
				const blocks = langDesign[part];
				if (Array.isArray(blocks) && blocks.length > 0) {
					const langParts = { ...(parts[lang] ?? {}) };
					langParts[part] = compileBlocksToHtml(blocks, opts);
					parts[lang] = langParts;
				}
			});
		});
		onChange({ ...t, design, templateParts: parts });
	};

	// Parse the part's existing custom HTML into editable blocks. Replaces the bespoke layout with
	// the block model (content preserved, unmappable markup kept as Raw HTML blocks) — hence confirm.
	const onImportHtml = () => {
		const html = getPartValue(template, activeLang, activePart);
		if (!html) return;
		if (
			!window.confirm(
				'Import this HTML into editable blocks? The custom layout is simplified into blocks ' +
					'(your content is kept). You can keep editing in Code instead.',
			)
		)
			return;
		userModeRef.current = true; // staying in Visual is the user's choice now
		onBlocksChange(htmlToBlocks(html));
	};

	// Send a prompt to the configured AI endpoint and apply the returned subject/html to the active
	// part. The template change flows through onChange -> the live preview refreshes on the right.
	const onAiPrompt = async (prompt: string) => {
		if (!aiEndpoint) return;
		setAiHistory(h => [...h, { role: 'user', text: prompt }]);
		setAiLoading(true);
		setAiError(undefined);
		try {
			const res = await generateTemplate(
				aiEndpoint,
				{ prompt, template: t, language: activeLang, part: activePart, templateType: type },
				headers,
			);
			let next = t;
			if (typeof res.html === 'string')
				next = setPartValue(next, activeLang, activePart, res.html);
			if (typeof res.subject === 'string' && typeDef.subjectKey)
				next = setPartValue(next, activeLang, typeDef.subjectKey, res.subject);
			if (next !== t) onChange(next);
			setAiHistory(h => [...h, { role: 'assistant', text: res.message || 'Template updated.' }]);
		} catch (e) {
			const msg = extractError(e);
			setAiError(msg);
			setAiHistory(h => [...h, { role: 'assistant', text: `Could not update the template: ${msg}` }]);
		} finally {
			setAiLoading(false);
		}
	};

	const selectedBlock = designBlocks.find(b => b.id === selectedBlockId);
	const inVisualHtml = mode === 'visual' && activePartDef.editor === 'html';
	const showBlockProps = inVisualHtml && !!selectedBlock;
	// In Visual mode with nothing selected (and no tab open), the right panel shows body/layout.
	const showRootSettings = inVisualHtml && !selectedBlock && !rightPanel;

	return (
		<div className="_templateEditor">
			<div className="_teToolbar">
				<div className="_teToolbarLeft">
					<div className="_teTypeChip" title="Template type is fixed at creation">
						<i className="fa fa-solid fa-envelope" /> {typeDef.displayName}
					</div>
					<label className="_teSelect">
						<span>Language</span>
						<select
							value={activeLang}
							onChange={e => {
								langPickedRef.current = true;
								setActiveLang(e.target.value);
							}}
						>
							{LANGUAGE_CODES.map(l => (
								<option key={l} value={l}>
									{l}
								</option>
							))}
						</select>
					</label>
				</div>
				<div className="_teToolbarRight">
					<button
						className={`_teTab ${rightPanel === 'variables' ? '_active' : ''}`}
						onClick={() =>
							setRightPanel(p => (p === 'variables' ? undefined : 'variables'))
						}
					>
						Variables
					</button>
					<button
						className={`_teTab ${rightPanel === 'sample' ? '_active' : ''}`}
						onClick={() => setRightPanel(p => (p === 'sample' ? undefined : 'sample'))}
					>
						Sample Data
					</button>
					<button
						className={`_teTab ${rightPanel === 'settings' ? '_active' : ''}`}
						onClick={() =>
							setRightPanel(p => (p === 'settings' ? undefined : 'settings'))
						}
					>
						Settings
					</button>
				</div>
			</div>

			<div className="_teBody">
				<div className="_teEditorColumn">
					{(activePartDef.editor === 'html' || aiEndpoint) && (
						<div className="_modeToggle">
							{activePartDef.editor === 'html' && (
								<>
									<button
										className={`_modeBtn ${mode === 'visual' ? '_active' : ''}`}
										onClick={() => {
											userModeRef.current = true;
											setMode('visual');
										}}
									>
										<i className="fa fa-solid fa-object-group" /> Visual
									</button>
									<button
										className={`_modeBtn ${mode === 'code' ? '_active' : ''}`}
										onClick={() => {
											userModeRef.current = true;
											setMode('code');
										}}
									>
										<i className="fa fa-solid fa-code" /> Code
									</button>
								</>
							)}
							{aiEndpoint && (
								<button
									className={`_modeBtn ${mode === 'ai' ? '_active' : ''}`}
									onClick={() => {
										userModeRef.current = true;
										setMode('ai');
									}}
								>
									<i className="fa fa-solid fa-wand-magic-sparkles" /> AI
								</button>
							)}
						</div>
					)}
					{typeDef.parts.length > 1 && (
						<div className="_partTabs">
							{typeDef.parts.map(p => (
								<button
									key={p.key}
									className={`_partTab ${activePart === p.key ? '_active' : ''}`}
									onClick={() => setActivePart(p.key)}
								>
									{p.label}
								</button>
							))}
						</div>
					)}

					{mode === 'ai' && aiEndpoint ? (
						<AiPanel
							history={aiHistory}
							loading={aiLoading}
							error={aiError}
							typeName={typeDef.displayName}
							onSubmit={onAiPrompt}
						/>
					) : activePartDef.editor === 'html' && mode === 'visual' ? (
						<div className="_visualArea">
							<BlockPalette />
							<BlockCanvas
								blocks={designBlocks}
								selectedId={selectedBlockId}
								onSelect={setSelectedBlockId}
								onChange={onBlocksChange}
								htmlWithoutDesign={
									designBlocks.length === 0 &&
									!!getPartValue(template, activeLang, activePart)
								}
								onImportHtml={onImportHtml}
							/>
						</div>
					) : (
						<PartEditor
							part={activePartDef}
							value={getPartValue(template, activeLang, activePart)}
							onChange={setPart}
							variables={variables}
						/>
					)}
				</div>

				<div className="_tePreviewColumn">
					<PreviewPane
						format={typeDef.previewFormat}
						html={preview.html}
						pdfUrl={preview.pdfUrl}
						loading={preview.loading}
						error={preview.error}
						device={device}
						onDevice={setDevice}
						onRefresh={doPreview}
						subjectValue={
							typeDef.subjectKey
								? getPartValue(template, activeLang, typeDef.subjectKey)
								: undefined
						}
						onSubjectChange={
							typeDef.subjectKey
								? v =>
										onChange(
											setPartValue(template, activeLang, typeDef.subjectKey!, v),
										)
								: undefined
						}
					/>
				</div>

				{(rightPanel || showBlockProps || showRootSettings) && (
					<div className="_teRightPanel">
						{showBlockProps && selectedBlock ? (
							<BlockPropertiesPanel
								block={selectedBlock}
								variables={variables}
								onClose={() => setSelectedBlockId(undefined)}
								onChange={props =>
									onBlocksChange(
										updateBlockProps(designBlocks, selectedBlock.id, props),
									)
								}
							/>
						) : rightPanel === 'variables' ? (
							<VariablesPanel
								value={t.variableSchema}
								onChange={v => onChange({ ...t, variableSchema: v })}
								onPickSchema={schema =>
									onChange({
										...t,
										variableSchema: schema,
										sampleData: sampleFromSchema(schema),
									})
								}
								headers={headers}
							/>
						) : rightPanel === 'sample' ? (
							<SampleDataPanel
								value={t.sampleData}
								onChange={v => onChange({ ...t, sampleData: v })}
								variableSchema={t.variableSchema}
								headers={headers}
							/>
						) : rightPanel === 'settings' ? (
							<SettingsPanel template={t} type={type} onChange={onChange} />
						) : showRootSettings ? (
							<RootSettingsPanel options={rootOptions} onChange={setRootOptions} />
						) : null}
					</div>
				)}
			</div>
		</div>
	);
}
