import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	addListenerAndCallImmediately,
	addListenerAndCallImmediatelyWithChildrenActivity,
	getDataFromPath,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import {
	Component,
	ComponentPropertyDefinition,
	ComponentProps,
	LocationHistory,
	PageDefinition,
} from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponent';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import CodeEditor from './components/CodeEditor';
import { ContextMenu, ContextMenuDetails } from './components/ContextMenu';
import IssuePopup, { Issue } from './components/IssuePopup';
import DnDEditor from './editors/DnDEditor/DnDEditor';
import { MASTER_FUNCTIONS } from './functions/masterFunctions';
import PageOperations from './functions/PageOperations';
import { propertiesDefinition, stylePropertiesDefinition } from './pageEditorProperties';
import GridStyle from './PageEditorStyle';
import { allPaths } from '../../util/allPaths';
import { LOCAL_STORE_PREFIX, PAGE_STORE_PREFIX, STORE_PREFIX } from '../../constants';
import ComponentDefinitions from '../';
import duplicate from '../../util/duplicate';

function savePersonalizationCurry(
	personalizationPath: string,
	pageName: string,
	onChangePersonalization: any,
	locationHistory: Array<LocationHistory>,
	pageDefinition: PageDefinition,
) {
	if (!onChangePersonalization) return (key: string, value: any) => {};
	let handle: any = -1;

	return (key: string, value: any) => {
		if (handle !== -1) clearTimeout(handle);

		setData(`${personalizationPath}.${key}`, value, pageName);
		handle = setTimeout(() => {
			(async () =>
				await runEvent(
					onChangePersonalization,
					'pageEditorSave',
					pageName,
					locationHistory,
					pageDefinition,
				))();
		}, 2000);
	};
}

function PageEditor(props: ComponentProps) {
	const {
		definition,
		definition: { bindingPath, bindingPath2 },
		pageDefinition,
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: { logo, theme, onSave, onChangePersonalization, onDeletePersonalization } = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	// binding path for the page definition to load
	const defPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	// binding path for the editor's personalization.
	const personalizationPath = bindingPath2
		? getPathFromLocation(bindingPath2, locationHistory, pageExtractor)
		: undefined;

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	const personalization = personalizationPath
		? getDataFromPath(personalizationPath, locationHistory, pageExtractor) ?? {}
		: {};

	// Managing theme with local state.
	const [localTheme, setLocalTheme] = useState(personalization.theme ?? theme);

	// Checking if someone changed the theme
	useEffect(() => {
		if (!personalizationPath) return;

		return addListenerAndCallImmediately(
			(_, v) => setLocalTheme(v ?? theme),
			pageExtractor,
			`${personalizationPath}.theme`,
		);
	}, [personalizationPath]);

	useEffect(() => setData('Store.pageData._global.collapseMenu', true), []);

	// Function to save the page
	const saveFunction = useCallback(() => {
		if (!onSave || !pageDefinition.eventFunctions?.[onSave]) return;

		(async () =>
			await runEvent(
				pageDefinition.eventFunctions[onSave],
				'pageEditorSave',
				context.pageName,
				locationHistory,
				pageDefinition,
			))();
	}, [onSave]);

	// Clear the personalization
	const deletePersonalization = useCallback(() => {
		if (!onDeletePersonalization || !pageDefinition.eventFunctions?.[onDeletePersonalization])
			return;

		(async () =>
			await runEvent(
				pageDefinition.eventFunctions[onDeletePersonalization],
				onDeletePersonalization,
				context.pageName,
				locationHistory,
				pageDefinition,
			))();
	}, [onDeletePersonalization]);

	// Function to save the personalization
	const savePersonalization = useMemo(() => {
		if (!personalizationPath) return (key: string, value: any) => {};

		return savePersonalizationCurry(
			personalizationPath,
			context.pageName,
			pageDefinition.eventFunctions?.[onChangePersonalization],
			locationHistory,
			pageDefinition,
		);
	}, [
		personalizationPath,
		context.pageName,
		onChangePersonalization,
		locationHistory,
		pageDefinition,
	]);

	// Managing url and client code of the URL.
	const [url, setUrl] = useState<string>('');
	const [clientCode, setClientCode] = useState<string>('');

	const editPageDefinition = !defPath
		? undefined
		: (getDataFromPath(`${defPath}`, locationHistory, pageExtractor) as PageDefinition);

	useEffect(() => {
		if (!editPageDefinition || !personalization) {
			setUrl('');
			setClientCode('');
			return;
		}

		if (personalization?.pageLeftAt?.[editPageDefinition.name]) {
			setUrl(personalization.pageLeftAt[editPageDefinition.name].url);
			setClientCode(personalization.pageLeftAt[editPageDefinition.name].clientCode);
			return;
		}

		setClientCode(editPageDefinition.clientCode);
		setUrl(
			`/${editPageDefinition.appCode}/${
				clientCode === '' ? editPageDefinition.clientCode : clientCode
			}/page/${editPageDefinition.name}`,
		);
		setClientCode(editPageDefinition.clientCode);
	}, [personalization, editPageDefinition]);

	// Function to remember url for a client.
	const urlChange = useCallback(
		(v: string) => {
			setUrl(v ?? '');
			if (!personalizationPath || !editPageDefinition!.name) return;
			savePersonalization(`pageLeftAt.${editPageDefinition!.name}.url`, v);
			savePersonalization(
				`pageLeftAt.${editPageDefinition!.name}.clientCode`,
				clientCode === '' ? editPageDefinition!.clientCode : clientCode,
			);
		},
		[setUrl, savePersonalization, editPageDefinition?.name],
	);

	const ref = useRef<HTMLIFrameElement>(null);
	const [selectedComponent, setSelectedComponentOriginal] = useState<string>('');
	const [selectedSubComponent, setSelectedSubComponent] = useState<string>('');
	const [issue, setIssue] = useState<Issue>();
	const [contextMenu, setContextMenu] = useState<ContextMenuDetails>();
	const [showCodeEditor, setShowCodeEditor] = useState<string | undefined>(undefined);

	const setSelectedComponent = useCallback(
		(v: string) => {
			setSelectedComponentOriginal(v ?? '');
			setSelectedSubComponent('');
			if (!defPath) return;

			let pageDef = getDataFromPath(
				defPath!,
				locationHistory,
				pageExtractor,
			) as PageDefinition;
			if (!pageDef?.componentDefinition?.[v]) return;

			const def = ComponentDefinitions.get(pageDef.componentDefinition[v].type);
			if (!def?.needShowInDesginMode) return;

			pageDef = duplicate(pageDef);

			Object.values(pageDef.componentDefinition).forEach(e => {
				if (e.key === v) {
					if (!e.properties) e.properties = {};
					e.properties.showInDesign = { value: true };
				} else if (e.properties?.showInDesign) {
					delete e.properties.showInDesign;
				}
			});

			setData(defPath, pageDef, pageExtractor.getPageName());
		},
		[setSelectedComponentOriginal, setSelectedSubComponent, defPath],
	);

	const [styleSelectorPref, setStyleSelectorPref] = useState<any>({});

	// Creating an object to manage the changes because of various operations like drag and drop.
	const operations = useMemo(
		() =>
			new PageOperations(
				defPath,
				locationHistory,
				pageExtractor,
				setIssue,
				selectedComponent,
				selectedSubComponent,
				key => setSelectedComponent(key),
				styleSelectorPref,
			),
		[
			defPath,
			locationHistory,
			pageExtractor,
			selectedComponent,
			setIssue,
			setSelectedComponent,
			styleSelectorPref,
			selectedSubComponent,
		],
	);

	// On changing the definition of the page, this effect sends to the iframe/slave.
	useEffect(() => {
		if (!defPath) return;
		return addListenerAndCallImmediatelyWithChildrenActivity(
			(_, payload) => {
				if (!ref.current) return;
				ref.current.contentWindow?.postMessage({
					type: 'EDITOR_DEFINITION',
					payload,
				});
			},
			pageExtractor,
			defPath,
		);
	}, [defPath, ref.current]);

	// On changing the personalization, this effect sends to the iframe/slave.
	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediatelyWithChildrenActivity(
			(_, payload) => {
				if (!ref.current) return;
				ref.current.contentWindow?.postMessage({
					type: 'EDITOR_PERSONALIZATION',
					payload,
				});
			},
			pageExtractor,
			personalizationPath,
		);
	}, [personalizationPath, ref.current]);

	// On changing the selection, this effect sends to the iframe/slave.
	useEffect(() => {
		if (!defPath) return;
		if (!ref.current) return;
		ref.current.contentWindow?.postMessage({
			type: 'EDITOR_SELECTION',
			payload: selectedComponent,
		});
	}, [selectedComponent, ref.current]);

	// On changing the sub selection, this effect sends to the iframe/slave.
	useEffect(() => {
		if (!defPath) return;
		if (!ref.current) return;
		ref.current.contentWindow?.postMessage({
			type: 'EDITOR_SUB_SELECTION',
			payload: selectedSubComponent,
		});
	}, [selectedSubComponent, ref.current]);

	// The type of the editor should be sent to iframe/slave.
	useEffect(() => {
		if (!ref.current) return;
		ref.current.contentWindow?.postMessage({
			type: 'EDITOR_TYPE',
			payload: 'PAGE',
		});
	}, [ref.current]);

	// This will be used to store slave store.
	const [slaveStore, setSlaveStore] = useState<any>(undefined);

	// Effect to listen to all the messages from the iframe/slave.
	useEffect(() => {
		function onMessageFromSlave(e: MessageEvent) {
			const {
				data: { type, payload },
			} = e;

			if (!type || !type.startsWith('SLAVE_') || !ref.current) return;
			if (!MASTER_FUNCTIONS.has(type)) throw Error('Unknown message from Slave : ' + type);

			MASTER_FUNCTIONS.get(type)?.(
				{
					iframe: ref.current,
					editPageDefinition,
					defPath,
					personalization,
					personalizationPath,
					onSelectedComponentChange: key => setSelectedComponent(key),
					onSelectedSubComponentChange: key => setSelectedSubComponent(key),
					operations,
					onContextMenu: (m: ContextMenuDetails) => setContextMenu(m),
					onSlaveStore: (store: any) => {
						setSlaveStore({
							store,
							localStore: Object.entries(window.localStorage)
								.filter((e: [string, string]) => e[0].startsWith('designmode_'))
								.reduce((a, c: [string, string]) => {
									let key = c[0].substring('designmode_'.length);
									if (c[1].length && (c[1][0] === '[' || c[1][0] === '{')) {
										try {
											a[key] = JSON.parse(c[1]);
										} catch (e) {
											a[key] = c[1];
										}
									} else {
										a[key] = c[1];
									}
									return a;
								}, {} as any),
						});
					},
				},
				payload,
			);
		}

		window.addEventListener('message', onMessageFromSlave);
		return () => window.removeEventListener('message', onMessageFromSlave);
	}, [
		ref.current,
		editPageDefinition,
		defPath,
		personalization,
		personalizationPath,
		setSelectedComponent,
		operations,
		setSelectedSubComponent,
		setContextMenu,
		setSlaveStore,
	]);

	const undoStackRef = useRef<Array<PageDefinition>>([]);
	const redoStackRef = useRef<Array<PageDefinition>>([]);
	const firstTimeRef = useRef<Array<PageDefinition>>([]);
	const latestVersion = useRef<number>(0);

	const storePaths = useMemo<Set<string>>(
		() =>
			allPaths(
				STORE_PREFIX,
				slaveStore?.store,
				allPaths(
					LOCAL_STORE_PREFIX,
					slaveStore?.localStore,
					allPaths(
						PAGE_STORE_PREFIX,
						slaveStore?.store?.pageData?.[editPageDefinition?.name ?? ''],
					),
				),
			),
		[slaveStore],
	);

	// If the personalization is not loaded, we don't load the view.
	if (personalizationPath && !personalization) return <></>;

	return (
		<>
			<div className={`comp compPageEditor ${localTheme}`} style={resolvedStyles.comp ?? {}}>
				<HelperComponent key={`${key}_hlp`} definition={definition} />
				<DnDEditor
					personalizationPath={personalizationPath}
					defPath={defPath}
					url={url}
					pageName={context.pageName}
					pageExtractor={pageExtractor}
					onSave={saveFunction}
					onChangePersonalization={savePersonalization}
					iframeRef={ref}
					locationHistory={locationHistory}
					selectedComponent={selectedComponent}
					onSelectedComponentChanged={(key: string) => setSelectedComponent(key)}
					pageOperations={operations}
					onPageReload={() => {
						ref.current?.contentWindow?.location.reload();
						setSelectedComponent('');
						setSelectedSubComponent('');
					}}
					theme={localTheme}
					logo={logo}
					onUrlChange={urlChange}
					onDeletePersonalization={deletePersonalization}
					onContextMenu={(m: ContextMenuDetails) => setContextMenu(m)}
					onShowCodeEditor={evName => setShowCodeEditor(evName)}
					undoStackRef={undoStackRef}
					redoStackRef={redoStackRef}
					firstTimeRef={firstTimeRef}
					latestVersion={latestVersion}
					slaveStore={slaveStore}
					editPageName={editPageDefinition?.name}
					selectedSubComponent={selectedSubComponent}
					onSelectedSubComponentChanged={(key: string) => setSelectedSubComponent(key)}
					storePaths={storePaths}
					setStyleSelectorPref={setStyleSelectorPref}
					styleSelectorPref={styleSelectorPref}
				/>
				<CodeEditor
					showCodeEditor={showCodeEditor}
					onSetShowCodeEditor={funcName => setShowCodeEditor(funcName)}
					defPath={defPath}
					personalizationPath={personalizationPath}
					locationHistory={locationHistory}
					context={context}
					pageDefinition={pageDefinition}
					pageExtractor={pageExtractor}
					slaveStore={slaveStore}
					undoStackRef={undoStackRef}
					redoStackRef={redoStackRef}
					firstTimeRef={firstTimeRef}
					latestVersion={latestVersion}
					definition={definition}
					storePaths={storePaths}
					selectedSubComponent={selectedSubComponent}
					selectedComponent={selectedComponent}
					onSelectedSubComponentChanged={(key: string) => setSelectedSubComponent(key)}
					onSelectedComponentChanged={(key: string) => setSelectedComponent(key)}
				/>
			</div>
			<IssuePopup
				issue={issue}
				personalizationPath={personalizationPath}
				pageExtractor={pageExtractor}
				onClearIssue={() => setIssue(undefined)}
			/>
			<ContextMenu
				menuDetails={contextMenu}
				personalizationPath={personalizationPath}
				pageExtractor={pageExtractor}
				onCloseContextmenu={() => setContextMenu(undefined)}
				pageOperations={operations}
			/>
		</>
	);
}

const component: Component = {
	icon: 'fa-solid fa-newspaper',
	name: 'PageEditor',
	displayName: 'Page Editor',
	description: 'Page Editor component',
	component: PageEditor,
	isHidden: true,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	styleComponent: GridStyle,
	bindingPaths: {
		bindingPath: { name: 'Definition' },
		bindingPath2: { name: 'Personalization' },
	},
};

export default component;
