import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usedComponents } from '../../App/usedComponents';
import { shortUUID } from '../../util/shortUUID';
import {
	PageStoreExtractor,
	addListenerAndCallImmediatelyWithChildrenActivity,
	getDataFromPath,
	getPathFromLocation,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { ComponentProps, StyleResolution } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import ComponentDefinitions from '../index';
import useDefinition from '../util/useDefinition';
import {
	DesktopIcon,
	EditorToggleIcon,
	JsonIcon,
	MobileIcon,
	ModlixIcon,
	TabletIcon,
	ThemeIcon,
} from './components/ThemeEditorIcons';
import { propertiesDefinition, stylePropertiesDefinition } from './themeEditorProperties';
import { Variables } from './components/Variables';
import { APP_KEY, MESSAGE_KEY, themableComponents } from './components/themableComponents';
import Editor from '@monaco-editor/react';
import { SubComponentDefinitions } from '../PageEditor/SubCompInfo';

const PANEL_WIDTH_KEY = 'modlixThemeEditorPanelWidth';
const PANEL_MIN = 300;
const PANEL_DEFAULT = 600;

export default function ThemeEditor(props: Readonly<ComponentProps>) {
	const {
		pageDefinition: { translations },
		pageDefinition,
		definition: { bindingPath, bindingPath2 },
		locationHistory,
		definition,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const {
		key,
		properties: {} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);

	const [currentComponent, setCurrentComponent] = useState<string>('_app');
	const [device, setDevice] = useState<string>('DESKTOP');
	const [themeGroup, setThemeGroup] = useState<StyleResolution>(StyleResolution.ALL);
	const [showJSON, setShowJSON] = useState(false);
	const [url, setUrl] = useState('');
	const [close, setClose] = useState(false);

	// Panel width. The variable list used to be a hard 600px, which left the 1280px
	// desktop preview clipped in any pane narrower than about 1900px. Draggable, and
	// remembered per browser so you set it once.
	const [panelWidth, setPanelWidth] = useState<number>(() => {
		const stored = Number(window.localStorage.getItem(PANEL_WIDTH_KEY));
		return Number.isFinite(stored) && stored >= PANEL_MIN ? stored : PANEL_DEFAULT;
	});
	const rootRef = useRef<HTMLDivElement>(null);
	const dragRef = useRef<{ startX: number; startWidth: number } | undefined>(undefined);

	const iFrameRef = useRef<HTMLIFrameElement>(null);
	const editorRef = useRef<any>(null);

	const bindingPathPath =
		bindingPath && getPathFromLocation(bindingPath, locationHistory, pageExtractor);

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	const [_, setChanged] = useState(Date.now());

	useEffect(() => {
		if (!bindingPathPath) return;

		function onMessageFromSlave(e: any) {
			const {
				data: { type },
			} = e;

			if (!type?.startsWith('SLAVE_') || !iFrameRef.current) return;

			if (type === 'SLAVE_STARTED') {
				iFrameRef.current?.contentWindow?.postMessage({
					type: 'EDITOR_TYPE',
					payload: { type: 'THEME_EDITOR' },
				});
				const msg = {
					type: 'EDITOR_APP_THEME',
					payload: getDataFromPath(bindingPathPath, locationHistory, pageExtractor),
				};
				iFrameRef.current?.contentWindow?.postMessage(msg);
			}
		}

		if (iFrameRef.current) {
			window.addEventListener('message', onMessageFromSlave);
		}

		return addListenerAndCallImmediatelyWithChildrenActivity(
			pageExtractor.getPageName(),
			(_, payload) => {
				const msg = {
					type: 'EDITOR_APP_THEME',
					payload,
				};
				iFrameRef.current?.contentWindow?.postMessage(msg);
				setChanged(Date.now());
			},
			bindingPathPath,
		);
	}, [bindingPathPath, iFrameRef.current, setChanged]);

	useEffect(
		() =>
			Array.from(ComponentDefinitions.values())
				.filter(e => e.externalStylePropsForThemeJson)
				.map(e => e.name)
				.forEach(usedComponents.using),
		[],
	);

	const theme = getDataFromPath(bindingPathPath, locationHistory, pageExtractor);

	useEffect(() => {
		function onMove(e: MouseEvent) {
			if (!dragRef.current) return;
			e.preventDefault();
			const max = Math.max(
				PANEL_MIN,
				(rootRef.current?.clientWidth ?? PANEL_DEFAULT * 2) - 360,
			);
			const next = Math.min(
				max,
				Math.max(
					PANEL_MIN,
					dragRef.current.startWidth + (e.clientX - dragRef.current.startX),
				),
			);
			setPanelWidth(next);
		}

		function onUp() {
			if (!dragRef.current) return;
			dragRef.current = undefined;
			document.body.style.removeProperty('cursor');
			document.body.style.removeProperty('user-select');
		}

		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onUp);
		return () => {
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onUp);
		};
	}, []);

	useEffect(() => {
		window.localStorage.setItem(PANEL_WIDTH_KEY, String(panelWidth));
	}, [panelWidth]);

	const startPanelDrag = (e: React.MouseEvent) => {
		e.preventDefault();
		dragRef.current = { startX: e.clientX, startWidth: panelWidth };
		document.body.style.cursor = 'col-resize';
		document.body.style.userSelect = 'none';
	};

	// Page names for the preview picker. Optional: without bindingPath2 the URL box
	// still takes any path typed by hand, which is how `editTheme` uses it.
	const previewPagesPath =
		bindingPath2 && getPathFromLocation(bindingPath2, locationHistory, pageExtractor);
	const [previewPages, setPreviewPages] = useState<Array<string>>([]);

	useEffect(() => {
		if (!previewPagesPath) return;
		return addListenerAndCallImmediatelyWithChildrenActivity(
			pageExtractor.getPageName(),
			(_, v) =>
				setPreviewPages(
					Array.isArray(v)
						? v.map(e => (typeof e === 'string' ? e : (e?.name ?? ''))).filter(Boolean)
						: [],
				),
			previewPagesPath,
		);
	}, [previewPagesPath]);

	useEffect(
		() => setUrl(`/${theme?.appCode}/${theme?.clientCode}/page/`),
		[theme?.appCode, theme?.clientCode],
	);
	const iframeComp =
		theme && url ? (
			<div className="_iframeWrapper">
				<div className="_editorTopBar">
					<button className="_smallButton" onClick={() => setClose(!close)}>
						<EditorToggleIcon close={close} />
					</button>
					<div className="_separator" />
					<div
						className={`_icon ${device == 'DESKTOP' ? '_selected' : ''}`}
						title="Desktop"
						onClick={() => setDevice('DESKTOP')}
					>
						<DesktopIcon />
					</div>
					<div
						className={`_icon ${device == 'TABLET' ? '_selected' : ''}`}
						title="Tablet"
						onClick={() => setDevice('TABLET')}
					>
						<TabletIcon />
					</div>
					<div
						className={`_icon ${device == 'MOBILE' ? '_selected' : ''}`}
						title="Mobile"
						onClick={() => setDevice('MOBILE')}
					>
						<MobileIcon />
					</div>
					<div className="_separator" />
					<button className="_smallButton" onClick={() => setShowJSON(!showJSON)}>
						{showJSON ? <ThemeIcon /> : <JsonIcon />}
					</button>
					<div className="_separator" />
					<URLInput
						value={url}
						onChange={setUrl}
						pages={previewPages}
						base={`/${theme?.appCode}/${theme?.clientCode}/page/`}
					/>
				</div>
				<div className={`_iframeContainer _${device}`}>
					<iframe
						className={`_${device}`}
						ref={iFrameRef}
						src={url}
						title="Theme Editor"
					/>
				</div>
			</div>
		) : null;

	let editor;

	if (!close) {
		if (!showJSON) {
			editor = (
				<div className="_variableContainer" style={{ width: panelWidth }}>
					<div className="_devices">
						<select
							value={themeGroup}
							onChange={e => setThemeGroup(e.target.value as StyleResolution)}
						>
							{Object.values(StyleResolution).map(e => (
								<option key={e} value={e}>
									{e}
								</option>
							))}
						</select>
					</div>
					<div className="_compsVariables">
						<div className="_components">
							{themableComponents().map(comp => (
								<button
									key={comp.key}
									onClick={() => setCurrentComponent(comp.key)}
									className={`_component ${comp.key === currentComponent ? '_active' : ''}`}
								>
									{comp.key === APP_KEY || comp.key === MESSAGE_KEY ? (
										<ModlixIcon />
									) : (
										SubComponentDefinitions[comp.key]?.find(
											e => e.mainComponent,
										)?.icon
									)}
									{comp.displayName}
								</button>
							))}
						</div>
						<Variables
							theme={theme}
							themeGroup={themeGroup}
							component={currentComponent}
							onComponentChange={setCurrentComponent}
							onThemeChange={props => {
								props.forEach(prop =>
									setData(
										`${bindingPathPath}.variables.${prop.themeGroup}.${prop.variableName}`,
										prop.value == '' ? undefined : prop.value,
										context.pageName,
										true,
									),
								);
							}}
						/>
					</div>
				</div>
			);
		} else {
			editor = (
				<div className="_editorContainer" style={{ width: panelWidth }}>
					<div className="_editorWrapper">
						<Editor
							width="100%"
							language="json"
							height="100%"
							defaultValue={''}
							onChange={ev => {
								if (!bindingPathPath) return;

								try {
									const toStore = JSON.parse(ev ?? '');
									setData(bindingPathPath, toStore, context.pageName);
								} catch (err) {}
							}}
							onMount={editor => {
								editorRef.current = editor;
								editor.getModel()?.setValue(JSON.stringify(theme, undefined, 2));
								setChanged(Date.now());
							}}
						/>
					</div>
				</div>
			);
		}
	}

	return (
		<div className="comp compThemeEditor" ref={rootRef} style={resolvedStyles.comp ?? {}}>
			<HelperComponent context={context} definition={definition} />
			{editor}
			{editor && iframeComp ? (
				<button
					type="button"
					className="_panelResizer"
					title="Drag to resize, double click to reset"
					onMouseDown={startPanelDrag}
					onDoubleClick={() => setPanelWidth(PANEL_DEFAULT)}
				/>
			) : null}
			{iframeComp}
		</div>
	);
}

/**
 * The preview address. Free text, because any path in the app is legitimate, but
 * backed by a datalist of the app's pages so you do not have to remember names.
 */
function URLInput({
	value,
	onChange,
	pages,
	base,
}: {
	value: string | undefined;
	onChange: (value: string) => void;
	pages?: Array<string>;
	base?: string;
}) {
	const [url, setUrl] = useState(value);
	const listId = useMemo(() => `themePreviewPages_${shortUUID()}`, []);

	useEffect(() => setUrl(value), [value]);

	const options = useMemo(
		() =>
			Array.from(new Set(pages ?? []))
				.sort((a, b) => a.localeCompare(b))
				.map(name => `${base ?? ''}${name}`),
		[pages, base],
	);

	return (
		<>
			<input
				type="url"
				value={url ?? ''}
				onChange={e => setUrl(e.target.value)}
				onBlur={e => onChange(e.target.value)}
				onKeyDown={e => {
					if (e.key === 'Enter') {
						e.preventDefault();
						onChange(url ?? '');
					}
				}}
				className="_urlInput"
				list={options.length ? listId : undefined}
				placeholder={options.length ? 'Pick or type a page' : undefined}
			/>
			{options.length ? (
				<datalist id={listId}>
					{options.map(o => (
						<option key={o} value={o} />
					))}
				</datalist>
			) : null}
		</>
	);
}
