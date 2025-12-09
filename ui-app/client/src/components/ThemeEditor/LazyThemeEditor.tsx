import { useEffect, useRef, useState } from 'react';
import { usedComponents } from '../../App/usedComponents';
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
import Editor from '@monaco-editor/react';

export default function ThemeEditor(props: Readonly<ComponentProps>) {
	const {
		pageDefinition: { translations },
		pageDefinition,
		definition: { bindingPath },
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
			(_, payload) => {
				const msg = {
					type: 'EDITOR_APP_THEME',
					payload,
				};
				iFrameRef.current?.contentWindow?.postMessage(msg);
				setChanged(Date.now());
			},
			pageExtractor,
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
					<URLInput value={url} onChange={setUrl} />
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
				<div className="_variableContainer">
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
							<button
								onClick={() => setCurrentComponent('_app')}
								className={`_component ${currentComponent === '_app' ? '_active' : ''}`}
							>
								<ModlixIcon /> App
							</button>
							<button
								onClick={() => setCurrentComponent('_message')}
								className={`_component ${currentComponent === '_message' ? '_active' : ''}`}
							>
								<ModlixIcon /> Messages
							</button>
							{Array.from(ComponentDefinitions.values())
								.filter(e => e.stylePropertiesForTheme.length)
								.filter(e => !e.isHidden || e.name === 'TableColumnHeader')
								.map(comp => (
									<button
										key={comp.name}
										onClick={() => setCurrentComponent(comp.name)}
										className={`_component ${comp.name === currentComponent ? '_active' : ''}`}
									>
										{
											comp.subComponentDefinition.find(e => e.mainComponent)
												?.icon
										}
										{comp.displayName}
									</button>
								))}
						</div>
						<Variables
							theme={theme}
							themeGroup={themeGroup}
							component={currentComponent}
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
				<div className="_editorContainer">
					<div className="_editorWrapper">
						<Editor
							width="600px"
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
		<div className="comp compThemeEditor" style={resolvedStyles.comp ?? {}}>
			<HelperComponent context={context} definition={definition} />
			{editor}
			{iframeComp}
		</div>
	);
}

function URLInput({
	value,
	onChange,
}: {
	value: string | undefined;
	onChange: (value: string) => void;
}) {
	const [url, setUrl] = useState(value);

	useEffect(() => setUrl(value), [value]);

	return (
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
		/>
	);
}
