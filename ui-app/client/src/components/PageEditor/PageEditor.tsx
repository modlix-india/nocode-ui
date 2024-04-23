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
	ComponentDefinition,
	ComponentPropertyDefinition,
	ComponentProps,
	LocationHistory,
	PageDefinition,
} from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import CodeEditor from './components/CodeEditor';
import { ContextMenu, ContextMenuDetails } from './components/ContextMenu';
import IssuePopup, { Issue } from './components/IssuePopup';
import DnDEditor from './editors/DnDEditor/DnDEditor';
import { MASTER_FUNCTIONS } from './functions/masterFunctions';
import {
	PageOperations,
	removeUnreferenecedComponentDefinitions,
} from './functions/PageOperations';
import { propertiesDefinition, stylePropertiesDefinition } from './pageEditorProperties';
import GridStyle from './PageEditorStyle';
import { allPaths } from '../../util/allPaths';
import { LOCAL_STORE_PREFIX, PAGE_STORE_PREFIX, STORE_PREFIX } from '../../constants';
import ComponentDefinitions from '../';
import { deepEqual, duplicate } from '@fincity/kirun-js';
import { styleDefaults } from './pageEditorStyleProperties';
import { IconHelper } from '../util/IconHelper';
import FormEditor from './components/FormEditor';
import { shortUUID } from '../../util/shortUUID';
import axios from 'axios';
import { getHref } from '../util/getHref';
import SchemaFormEditor from './components/SchemaFormEditor';

interface IntermediateState {
	[key: string]: {
		name: string;
		bindingPath: string;
		type: string;
		options?: any[] | undefined;
		dataType: string;
		label: string;
		order: number;
		children?: { [key: string]: boolean };
		props?: any;
		componentKey: string;
	};
}

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
		definition: { bindingPath, bindingPath2, bindingPath3, bindingPath4 },
		pageDefinition,
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: {
			logo,
			theme,
			onSave,
			onPublish,
			onVersions,
			onChangePersonalization,
			onDeletePersonalization,
			pagesData,
			currentPageId,
			dashboardPageName,
			formStorageUrl,
			settingsPageName,
			addnewPageName,
			editorType,
			sectionsListConnectionName,
			sectionsCategoryList,
		} = {},
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

	// binding path for the application definition.
	const appPath = bindingPath3
		? getPathFromLocation(bindingPath3, locationHistory, pageExtractor)
		: undefined;

	// binding path for the theme definition.
	const themePath = bindingPath4
		? getPathFromLocation(bindingPath4, locationHistory, pageExtractor)
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

		let def = getDataFromPath(defPath!, locationHistory, pageExtractor) as PageDefinition;
		if (!def) return;

		def = removeUnreferenecedComponentDefinitions(def);

		setData(defPath!, def, pageExtractor.getPageName());

		(async () =>
			await runEvent(
				pageDefinition.eventFunctions[onSave],
				'pageEditorSave',
				context.pageName,
				locationHistory,
				pageDefinition,
			))();
	}, [onSave]);

	// Function to publish the page
	const publishFunction = useCallback(() => {
		if (!onPublish || !pageDefinition.eventFunctions?.[onPublish]) return;

		(async () =>
			await runEvent(
				pageDefinition.eventFunctions[onPublish],
				'pageEditorPublish',
				context.pageName,
				locationHistory,
				pageDefinition,
			))();
	}, [onPublish]);

	// Function to get the versions
	const versionsFunction = useCallback(() => {
		if (!onVersions || !pageDefinition.eventFunctions?.[onVersions]) return;

		(async () =>
			await runEvent(
				pageDefinition.eventFunctions[onVersions],
				'pageEditorVersions',
				context.pageName,
				locationHistory,
				pageDefinition,
			))();
	}, [onVersions]);

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

	const appDefinition = !appPath
		? undefined
		: (getDataFromPath(appPath, locationHistory, pageExtractor) as any);

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

		setClientCode(appDefinition?.clientCode ?? editPageDefinition.clientCode);
		setUrl(
			`/${editPageDefinition.appCode}/${
				clientCode === ''
					? appDefinition?.clientCode ?? editPageDefinition.clientCode
					: clientCode
			}/page/${editPageDefinition.name}`,
		);
		setClientCode(appDefinition?.clientCode ?? editPageDefinition.clientCode);
	}, [personalization, editPageDefinition, appDefinition]);

	// Function to remember url for a client.
	const urlChange = useCallback(
		(v: string) => {
			setUrl(v ?? '');
			if (!personalizationPath || !editPageDefinition!.name) return;
			savePersonalization(`pageLeftAt.${editPageDefinition!.name}.url`, v);
			savePersonalization(
				`pageLeftAt.${editPageDefinition!.name}.clientCode`,
				clientCode === ''
					? appDefinition?.clientCode ?? editPageDefinition!.clientCode
					: clientCode,
			);
		},
		[setUrl, savePersonalization, editPageDefinition?.name, appDefinition?.clientCode],
	);

	const desktopRef = useRef<HTMLIFrameElement>(null);
	const tabletRef = useRef<HTMLIFrameElement>(null);
	const mobileRef = useRef<HTMLIFrameElement>(null);

	// To load iframe for the templates
	const [templateIFrame, setTemplateIFrame] = useState<HTMLIFrameElement | undefined>(undefined);
	const [selectedComponent, setSelectedComponentOriginal] = useState<string>('');
	const [selectedSubComponent, setSelectedSubComponentOriginal] = useState<string>('');
	const [issue, setIssue] = useState<Issue>();
	const [contextMenu, setContextMenu] = useState<ContextMenuDetails>();
	const [showCodeEditor, setShowCodeEditor] = useState<string | undefined>(undefined);
	const [generateFormOnComponentKey, setGenerateFormOnComponentKey] = useState<string>('');
	const [showSchemaFormEditor, setShowSchemaFormEditor] = useState<string>('');
	const [selectedComponentsList, setSelectedComponentsListOriginal] = useState<string[]>([]);
	const [intermediateState, setIntermediateState] = useState<IntermediateState>();

	const getIntermediateState = () => {
		const data: PageDefinition = getDataFromPath(defPath, locationHistory, pageExtractor);
		const interState =
			data.componentDefinition?.[showSchemaFormEditor]?.properties?._intermediateDefinition
				?.value;
		if (Object.keys(interState ?? {}).length) return interState as IntermediateState;
		return undefined;
	};

	const setSelectedComponent = useCallback(
		(v: string) => {
			setSelectedComponentsListOriginal([v]);
			setSelectedComponentOriginal(v ?? '');
			setSelectedSubComponentOriginal('');
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
		[setSelectedComponentOriginal, setSelectedSubComponentOriginal, defPath],
	);

	const setSelectedComponentList = useCallback(
		(v: string) => {
			setSelectedComponentOriginal(prev => {
				if (prev === '') return v;
				return prev;
			});
			setSelectedComponentsListOriginal(prevList => {
				const updatedList =
					prevList.indexOf(v) !== -1 ? prevList.filter(e => e !== v) : [...prevList, v];
				return updatedList;
			});
		},
		[setSelectedComponentsListOriginal],
	);

	// it will get called when we select sub component inside a component like 'text' inside 'Text' component
	const setSelectedSubComponent = useCallback(
		(key: string) => {
			if (key === '') {
				setSelectedComponent('');
				setSelectedSubComponentOriginal('');
				return;
			}

			const [componentKey, subComponentKey] = key.split(':');

			setSelectedComponent(componentKey);
			setSelectedSubComponentOriginal(key);
		},
		[selectedComponent],
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
				editorType,
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
				const msg = {
					type: 'EDITOR_DEFINITION',
					payload,
				};
				desktopRef.current?.contentWindow?.postMessage(msg);
				tabletRef.current?.contentWindow?.postMessage(msg);
				mobileRef.current?.contentWindow?.postMessage(msg);
			},
			pageExtractor,
			defPath,
		);
	}, [defPath, desktopRef.current, tabletRef.current, mobileRef.current]);

	// On changing the personalization, this effect sends to the iframe/slave.
	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediatelyWithChildrenActivity(
			(_, payload) => {
				const msg = {
					type: 'EDITOR_PERSONALIZATION',
					payload,
				};

				desktopRef.current?.contentWindow?.postMessage(msg);
				tabletRef.current?.contentWindow?.postMessage(msg);
				mobileRef.current?.contentWindow?.postMessage(msg);
			},
			pageExtractor,
			personalizationPath,
		);
	}, [personalizationPath, desktopRef.current, tabletRef.current, mobileRef.current]);

	// On app def change message to component template iframe.
	useEffect(() => {
		if (!appPath) return;
		const unListen = addListenerAndCallImmediatelyWithChildrenActivity(
			(_, payload) => {
				if (!templateIFrame) return;

				const msg = {
					type: 'EDITOR_APP_DEFINITION',
					payload,
				};
				templateIFrame.contentWindow?.postMessage(msg);
			},
			pageExtractor,
			appPath,
		);

		const unlisten2 = themePath
			? addListenerAndCallImmediatelyWithChildrenActivity(
					(_, payload) => {
						if (!templateIFrame) return;

						const msg = {
							type: 'EDITOR_APP_THEME',
							payload,
						};
						templateIFrame.contentWindow?.postMessage(msg);
					},
					pageExtractor,
					themePath,
			  )
			: undefined;

		function onMessageFromSlave(e: any) {
			const {
				data: { type, payload, editorType },
			} = e;

			if (!type || !type.startsWith('SLAVE_') || !templateIFrame) return;

			if (type === 'SLAVE_STARTED') {
				templateIFrame.contentWindow?.postMessage({
					type: 'EDITOR_TYPE',
					payload: { type: 'THEME' },
				});
				const msg = {
					type: 'EDITOR_APP_DEFINITION',
					payload: getDataFromPath(appPath, locationHistory, pageExtractor),
				};
				templateIFrame.contentWindow?.postMessage(msg);

				if (themePath) {
					const msg = {
						type: 'EDITOR_APP_THEME',
						payload: getDataFromPath(themePath, locationHistory, pageExtractor),
					};
					templateIFrame.contentWindow?.postMessage(msg);
				}
			}
		}

		if (templateIFrame) {
			window.addEventListener('message', onMessageFromSlave);
		}

		return () => {
			unListen();
			unlisten2?.();
			window.removeEventListener('message', onMessageFromSlave);
		};
	}, [appPath, themePath, templateIFrame]);

	// On changing the selection, this effect sends to the iframe/slave.
	useEffect(() => {
		if (!defPath) return;

		const msg = { type: 'EDITOR_SELECTION', payload: selectedComponentsList };
		desktopRef.current?.contentWindow?.postMessage(msg);
		tabletRef.current?.contentWindow?.postMessage(msg);
		mobileRef.current?.contentWindow?.postMessage(msg);
	}, [selectedComponentsList, desktopRef.current, tabletRef.current, mobileRef.current]);

	// On changing the sub selection, this effect sends to the iframe/slave.
	useEffect(() => {
		if (!defPath) return;

		const msg = { type: 'EDITOR_SUB_SELECTION', payload: selectedSubComponent };
		desktopRef.current?.contentWindow?.postMessage(msg);
		tabletRef.current?.contentWindow?.postMessage(msg);
		mobileRef.current?.contentWindow?.postMessage(msg);
	}, [selectedSubComponent, desktopRef.current, tabletRef.current, mobileRef.current]);

	// The type of the editor should be sent to iframe/slave.
	useEffect(() => {
		desktopRef.current?.contentWindow?.postMessage({
			type: 'EDITOR_TYPE',
			payload: { type: 'PAGE', screenType: 'desktop' },
		});
	}, [desktopRef.current]);

	useEffect(() => {
		tabletRef.current?.contentWindow?.postMessage({
			type: 'EDITOR_TYPE',
			payload: { type: 'PAGE', screenType: 'tablet' },
		});
	}, [tabletRef.current]);

	useEffect(() => {
		mobileRef.current?.contentWindow?.postMessage({
			type: 'EDITOR_TYPE',
			payload: { type: 'PAGE', screenType: 'mobile' },
		});
	}, [mobileRef.current]);

	// This will be used to store slave store.
	const [slaveStore, setSlaveStore] = useState<any>(undefined);

	// Effect to listen to all the messages from the iframe/slave of the page iframes.
	useEffect(() => {
		function onMessageFromSlave(e: any) {
			const {
				data: { type, payload, editorType, screenType },
			} = e;

			if (!type || !type.startsWith('SLAVE_')) return;
			if (!MASTER_FUNCTIONS.has(type)) throw Error('Unknown message from Slave : ' + type);

			if (editorType && editorType !== 'PAGE') return;

			MASTER_FUNCTIONS.get(type)?.(
				{
					screenType,
					desktopIframe: desktopRef.current,
					tabletIframe: tabletRef.current,
					mobileIframe: mobileRef.current,
					editPageDefinition,
					defPath,
					personalization,
					personalizationPath,
					selectedComponent,
					styleSelectorPref,
					setStyleSelectorPref: setStyleSelectorPref,
					onSelectedComponentChange: (key, multi) =>
						multi ? setSelectedComponentList(key) : setSelectedComponent(key),
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
		desktopRef.current,
		tabletRef.current,
		mobileRef.current,
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

	// Use effect to see if editor is closed abruptly.
	useEffect(() => {
		if (!defPath) return;
		const removeListener = addListenerAndCallImmediately(
			(_, v) => {
				if (!v || !v.id) return;

				removeListener();

				let i = 0,
					key = null;
				while ((key = window.localStorage.key(i++))) {
					if (key.indexOf(v.id) === -1) continue;
					break;
				}

				if (!key) return;

				const storagePage = JSON.parse(window.localStorage.getItem(key)!);
				if (deepEqual(v, storagePage)) return;

				setIssue({
					message: 'Editor was closed abruptly. Do you want to recover the page?',
					options: ['Yes', 'No'],
					defaultOption: 'Yes',
					callbackOnOption: {
						Yes: () => {
							setData(defPath, storagePage, pageExtractor.getPageName());
							window.localStorage.removeItem(key!);
						},
					},
				});
			},
			pageExtractor,
			defPath,
		);

		return removeListener;
	}, [defPath, setIssue]);

	// If the personalization is not loaded, we don't load the view.
	if (personalizationPath && !personalization) return <></>;

	return (
		<>
			<div className={`comp compPageEditor ${localTheme}`} style={resolvedStyles.comp ?? {}}>
				<HelperComponent
					context={props.context}
					key={`${key}_hlp`}
					definition={definition}
				/>
				<DnDEditor
					personalizationPath={personalizationPath}
					defPath={defPath}
					url={url}
					pageName={context.pageName}
					pageExtractor={pageExtractor}
					onSave={saveFunction}
					onPublish={onPublish ? publishFunction : undefined}
					onChangePersonalization={savePersonalization}
					desktopIframe={desktopRef}
					tabletIframe={tabletRef}
					mobileIframe={mobileRef}
					templateIframeRef={(element: HTMLIFrameElement | undefined) =>
						setTemplateIFrame(element)
					}
					locationHistory={locationHistory}
					selectedComponent={selectedComponent}
					selectedComponentsList={selectedComponentsList}
					onSelectedComponentChanged={(key: string) => setSelectedComponent(key)}
					onSelectedComponentListChanged={(key: string) => setSelectedComponentList(key)}
					pageOperations={operations}
					onPageReload={() => {
						desktopRef?.current?.contentWindow?.location.reload();
						tabletRef?.current?.contentWindow?.location.reload();
						mobileRef?.current?.contentWindow?.location.reload();
						setSelectedComponent('');
						setSelectedSubComponent('');
					}}
					onPageBack={() => {
						desktopRef?.current?.contentWindow?.history.back();
						tabletRef?.current?.contentWindow?.history.back();
						mobileRef?.current?.contentWindow?.history.back();
					}}
					onPageForward={() => {
						desktopRef?.current?.contentWindow?.history.forward();
						tabletRef?.current?.contentWindow?.history.forward();
						mobileRef?.current?.contentWindow?.history.forward();
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
					appPath={appPath}
					onVersions={onVersions ? versionsFunction : undefined}
					pagesData={pagesData}
					currentPageId={currentPageId}
					settingsPageName={settingsPageName}
					dashboardPageName={dashboardPageName}
					addnewPageName={addnewPageName}
					editorType={editorType}
					sectionsListConnectionName={sectionsListConnectionName}
					sectionsCategoryList={sectionsCategoryList}
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
				{generateFormOnComponentKey && (
					<FormEditor
						formStorageUrl={formStorageUrl}
						defPath={defPath}
						pageExtractor={pageExtractor}
						locationHistory={locationHistory}
						clickedComponent={generateFormOnComponentKey}
						setClickedComponent={setGenerateFormOnComponentKey}
					/>
				)}
				{showSchemaFormEditor && (
					<SchemaFormEditor
						setShowSchemaFormEditor={setShowSchemaFormEditor}
						clickedComponent={showSchemaFormEditor}
						defPath={defPath}
						locationHistory={locationHistory}
						pageExtractor={pageExtractor}
						context={context}
						intermediateState={getIntermediateState()}
						hasIntermediateState={!!getIntermediateState()}
					/>
				)}
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
				onCloseContextmenu={() => {
					setContextMenu(undefined);
				}}
				pageOperations={operations}
				formStorageUrl={formStorageUrl}
				setClickedComponent={setGenerateFormOnComponentKey}
				setShowSchemaFormEditor={setShowSchemaFormEditor}
			/>
		</>
	);
}

const component: Component = {
	name: 'PageEditor',
	displayName: 'Page Editor',
	description: 'Page Editor component',
	component: PageEditor,
	isHidden: false,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	styleComponent: GridStyle,
	styleDefaults: styleDefaults,
	bindingPaths: {
		bindingPath: { name: 'Definition' },
		bindingPath2: { name: 'Personalization' },
		bindingPath3: { name: 'Application Definition' },
		bindingPath4: { name: 'Theme Definition' },
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<path
						d="M12.4836 5.4706V1H3.5493C2.69501 1 2 1.69501 2 2.5493V21.4507C2 22.305 2.69501 23 3.5493 23H17.4706C18.3249 23 19.0199 22.305 19.0199 21.4507V7.53632H14.5493C13.4103 7.53632 12.4836 6.60964 12.4836 5.4706Z"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<path
						d="M13.5176 5.47056C13.5176 6.04008 13.9809 6.50342 14.5504 6.50342H18.2553L13.5176 1.78809V5.47056Z"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<path
						d="M14.5542 15.025L19.0139 10.5653C19.7675 9.81158 20.6015 9.81158 21.3552 10.5653C22.1089 11.3189 22.1089 12.1529 21.3552 12.9066L16.8955 17.3663L14.5542 15.025ZM16.2967 17.7041L14.3677 17.9184C14.1568 17.9418 13.9786 17.7636 14.0021 17.5527L14.2164 15.6237L16.2967 17.7041Z"
						fill="currentColor"
					/>
				</IconHelper>
			),
		},
	],
};

export default component;
