import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MarkdownParser } from '../../commonComponents/Markdown/MarkdownParser';
import {
	addListenerAndCallImmediately,
	getDataFromPath,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { BlockEditor, type BlockEditorRef } from './blockEditor/BlockEditor';
import { createDocument } from './blockEditor/core/document';
import type { BlockType, EditorDocument } from './blockEditor/core/types';
import { blocksToMarkdown, markdownToBlocks } from './blockEditor/markdown';
import {
	DEFAULT_BLOCK_TYPES,
	propertiesDefinition,
	stylePropertiesDefinition,
} from './markdownEditorProperties';
import { uploadPastedFile } from './uploadPastedFile';

type Mode = 'editDoc' | 'editText' | 'preview';

const MODE_LABELS: Record<Mode, string> = {
	editDoc: 'Edit',
	editText: 'Markdown',
	preview: 'Preview',
};

const DEFAULT_MODES: Mode[] = ['editDoc', 'editText', 'preview'];

// Style keys of the markdown renderer (MarkdownParser). A component that sets
// any of them was styled for that renderer, so read-only keeps using it.
const RENDERER_STYLE_KEYS = [
	'markdownContainer',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'em',
	'b',
	'p',
	'mark',
	's',
	'sup',
	'sub',
	'br',
	'ol',
	'oli',
	'ul',
	'ulli',
	'tlli',
	'tlcheckbox',
	'links',
	'linksHover',
	'images',
	'icBlock',
	'codeBlock',
	'codeBlockKeywords',
	'codeBlockVariables',
	'table',
	'th',
	'tr',
	'td',
	'blockQuotes',
	'hr',
	'video',
	'footNoteLink',
	'footNote',
];

// Typing re-serializes the whole document, so the store is written once the
// burst settles. Blur, mode switches and unmount flush immediately.
const WRITE_DELAY_MS = 150;

function asText(value: unknown): string {
	if (typeof value === 'string') return value;
	if (value === undefined || value === null) return '';
	return String(value);
}

function toDocument(markdown: string): EditorDocument {
	return createDocument(markdown.trim() ? markdownToBlocks(markdown) : undefined);
}

function toMarkdown(doc: EditorDocument): string {
	return blocksToMarkdown(doc.blocks).replace(/\s+$/, '');
}

export default function MarkdownEditor(props: Readonly<ComponentProps>) {
	const {
		definition,
		definition: { key: componentKey, bindingPath },
		locationHistory,
		context,
		pageDefinition,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);

	const {
		properties: {
			readOnly,
			emptyStringValue,
			onChange,
			onBlur,
			editType,
			pathForPastedFiles,
			pastedFilesStorage,
			placeholder,
			blockTypes,
			readOnlyView,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);

	const modes = useMemo<Mode[]>(() => {
		const chosen = (Array.isArray(editType) ? editType : []).filter(
			(m: string): m is Mode => m === 'editDoc' || m === 'editText' || m === 'preview',
		);
		return chosen.length ? chosen : DEFAULT_MODES;
	}, [Array.isArray(editType) ? editType.join(',') : '']);
	const [mode, setMode] = useState<Mode>(modes[0]);
	useEffect(() => {
		if (!modes.includes(mode)) setMode(modes[0]);
	}, [modes, mode]);

	const allowedBlockTypes = useMemo<BlockType[]>(
		() =>
			(Array.isArray(blockTypes) && blockTypes.length
				? blockTypes
				: DEFAULT_BLOCK_TYPES) as BlockType[],
		[Array.isArray(blockTypes) ? blockTypes.join(',') : ''],
	);

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	// The markdown as last read from or written to the store.
	const [markdown, setMarkdown] = useState<string>(() =>
		asText(
			bindingPathPath ? getDataFromPath(bindingPathPath, locationHistory, pageExtractor) : '',
		),
	);
	const markdownRef = useRef(markdown);
	markdownRef.current = markdown;

	const editorRef = useRef<BlockEditorRef>(null);
	// The document the block editor mounts with. Rebuilt from the markdown each
	// time the editor (re)mounts, e.g. after editing in Markdown mode.
	const [editorMount, setEditorMount] = useState(() => ({
		key: 0,
		doc: toDocument(markdown),
	}));

	// Markdown this component wrote recently. The store echoes every write back
	// through the listener; those echoes must not reload the editor.
	const recentWrites = useRef<string[]>([]);
	const pendingDoc = useRef<EditorDocument | null>(null);
	const writeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	const runChangeEvent = useCallback(() => {
		if (!onChange) return;
		(async () =>
			await runEvent(
				onChange,
				onChange,
				context.pageName,
				locationHistory,
				pageDefinition,
			))();
	}, [onChange, context.pageName, locationHistory, pageDefinition]);

	const writeMarkdown = useCallback(
		(text: string) => {
			if (!bindingPathPath) return;
			recentWrites.current = [...recentWrites.current.slice(-19), text];
			markdownRef.current = text;
			setMarkdown(text);
			if (text === '') {
				if (emptyStringValue === 'EMPTYSTRING')
					setData(bindingPathPath, '', context.pageName);
				else setData(bindingPathPath, undefined, context.pageName, true);
			} else {
				setData(bindingPathPath, text, context.pageName);
			}
			runChangeEvent();
		},
		[bindingPathPath, emptyStringValue, context.pageName, runChangeEvent],
	);

	const flush = useCallback(() => {
		if (writeTimer.current) {
			clearTimeout(writeTimer.current);
			writeTimer.current = undefined;
		}
		const doc = pendingDoc.current;
		if (!doc) return;
		pendingDoc.current = null;
		const text = toMarkdown(doc);
		if (text !== markdownRef.current) writeMarkdown(text);
	}, [writeMarkdown]);

	const flushRef = useRef(flush);
	flushRef.current = flush;
	useEffect(() => () => flushRef.current(), []);

	useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			pageExtractor.getPageName(),
			(_, fromStore) => {
				const text = asText(fromStore);
				if (text === markdownRef.current || recentWrites.current.includes(text)) return;
				// Changed outside the editor: drop any unsaved burst and reload.
				pendingDoc.current = null;
				if (writeTimer.current) clearTimeout(writeTimer.current);
				markdownRef.current = text;
				setMarkdown(text);
				const doc = toDocument(text);
				if (editorRef.current) editorRef.current.setDocument(doc);
				else setEditorMount(m => ({ key: m.key + 1, doc }));
			},
			bindingPathPath,
		);
	}, [bindingPathPath]);

	const handleDocChange = useCallback((doc: EditorDocument) => {
		pendingDoc.current = doc;
		if (writeTimer.current) clearTimeout(writeTimer.current);
		writeTimer.current = setTimeout(() => flushRef.current(), WRITE_DELAY_MS);
	}, []);

	const runBlurEvent = useCallback(() => {
		if (!onBlur) return;
		runEvent(onBlur, onBlur, context.pageName, locationHistory, pageDefinition);
	}, [onBlur, context.pageName, locationHistory, pageDefinition]);

	const handleEditorBlur = useCallback(() => {
		flushRef.current();
		runBlurEvent();
	}, [runBlurEvent]);

	const handleImageUpload = useCallback(
		(file: File): Promise<string> =>
			uploadPastedFile(file, pastedFilesStorage, pathForPastedFiles),
		[pastedFilesStorage, pathForPastedFiles],
	);

	const styleProperties = processComponentStylePseudoClasses(
		pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	const usesRendererStyles = RENDERER_STYLE_KEYS.some(
		k => styleProperties[k] && Object.keys(styleProperties[k]).length > 0,
	);
	const previewAsMarkdown = readOnlyView ? readOnlyView === 'MARKDOWN' : usesRendererStyles;
	const showPreview = !!readOnly || mode === 'preview';

	const switchMode = (next: Mode) => {
		if (next === mode) return;
		flushRef.current();
		// The block editor stays mounted between Edit and a document-style
		// Preview; it is rebuilt from the markdown when it was not on screen.
		if (next === 'editDoc' && (mode === 'editText' || previewAsMarkdown)) {
			setEditorMount(m => ({ key: m.key + 1, doc: toDocument(markdownRef.current) }));
		}
		setMode(next);
	};

	let content: React.ReactNode;
	if (showPreview && previewAsMarkdown) {
		content = (
			<MarkdownParser
				componentKey={componentKey}
				text={markdown}
				styles={styleProperties}
				className="_preview"
			/>
		);
	} else if (!showPreview && mode === 'editText') {
		content = (
			<textarea
				className="_rawText"
				style={styleProperties.textArea ?? {}}
				value={markdown}
				spellCheck={false}
				placeholder={placeholder}
				onChange={e => writeMarkdown(e.target.value)}
				onBlur={runBlurEvent}
				onKeyDown={e => {
					if (e.key !== 'Tab') return;
					e.preventDefault();
					const el = e.currentTarget;
					const { selectionStart, selectionEnd, value } = el;
					const next = value.slice(0, selectionStart) + '  ' + value.slice(selectionEnd);
					writeMarkdown(next);
					requestAnimationFrame(() =>
						el.setSelectionRange(selectionStart + 2, selectionStart + 2),
					);
				}}
			/>
		);
	} else {
		content = (
			<div
				className={`_editorArea${showPreview ? ' _readOnly' : ''}`}
				style={styleProperties.editor ?? {}}
			>
				<BlockEditor
					key={editorMount.key}
					ref={editorRef}
					readOnly={showPreview}
					initialDocument={editorMount.doc}
					onChange={handleDocChange}
					onBlur={handleEditorBlur}
					placeholder={placeholder}
					allowedBlockTypes={allowedBlockTypes}
					markdownSafe
					onImageUpload={handleImageUpload}
					hideHeadingRail
				/>
			</div>
		);
	}

	const modeSwitch =
		!readOnly && modes.length > 1 ? (
			<div className="_modeSwitch" role="tablist" style={styleProperties.modeSwitch ?? {}}>
				{modes.map(m => (
					<button
						key={m}
						type="button"
						role="tab"
						aria-selected={m === mode}
						className={`_modeButton${m === mode ? ' _active' : ''}`}
						onMouseDown={e => e.preventDefault()}
						onClick={() => switchMode(m)}
					>
						{MODE_LABELS[m]}
					</button>
				))}
			</div>
		) : null;

	return (
		<div
			className={`comp compMarkdownEditor${readOnly ? ' _readOnly' : ''}`}
			style={styleProperties.comp ?? {}}
		>
			<HelperComponent context={props.context} definition={definition} />
			{modeSwitch}
			{content}
		</div>
	);
}
