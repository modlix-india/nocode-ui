import { deepEqual, duplicate } from '@fincity/kirun-js';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ComponentDefinitions from '../';
import { LOCAL_STORE_PREFIX, PAGE_STORE_PREFIX, STORE_PREFIX } from '../../constants';
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
import { allPaths } from '../../util/allPaths';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { IconHelper } from '../util/IconHelper';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import CodeEditor from './components/CodeEditor';
import { ContextMenu, ContextMenuDetails } from './components/ContextMenu';
import FormEditor from './components/FormEditor';
import IssuePopup, { Issue } from './components/IssuePopup';
import DnDEditor from './editors/DnDEditor/DnDEditor';
import { MASTER_FUNCTIONS } from './functions/masterFunctions';
import {
	PageOperations,
	removeUnreferenecedComponentDefinitions,
} from './functions/PageOperations';
import { propertiesDefinition, stylePropertiesDefinition } from './pageEditorProperties';
import GridStyle from './PageEditorStyle';
import { styleDefaults } from './pageEditorStyleProperties';

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

function PageEditor(props: Readonly<ComponentProps>) {
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
			helpURL,
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

		let def = getDataFromPath(defPath, locationHistory, pageExtractor) as PageDefinition;
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

	const appDefinition = getDataFromPath(appPath, locationHistory, pageExtractor);

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
	const [selectedComponentsList, setSelectedComponentsListOriginal] = useState<string[]>([]);

	const setSelectedComponent = useCallback(
		(v: string) => {
			setSelectedComponentsListOriginal([v]);
			setSelectedComponentOriginal(v ?? '');
			setSelectedSubComponentOriginal('');
			if (!defPath) return;

			let pageDef = getDataFromPath(
				defPath,
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

			const [componentKey] = key.split(':');

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
				data: { type },
			} = e;

			if (!type?.startsWith('SLAVE_') || !templateIFrame) return;

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

			if (!type?.startsWith('SLAVE_')) return;
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
				if (!v?.id) return;

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
							window.localStorage.removeItem(key);
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
		<div className={`comp compPageEditor ${localTheme}`} style={resolvedStyles.comp ?? {}}>
			<HelperComponent context={props.context} key={`${key}_hlp`} definition={definition} />
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
				helpURL={helpURL}
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
			/>
		</div>
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
				<IconHelper viewBox="0 0 30 34">
					{/* <path
						d="M15.7879 6.73258V0H2.33319C1.04667 0 0 1.04667 0 2.33319V30.7982C0 32.0847 1.04667 33.1313 2.33319 33.1313H23.2983C24.5848 33.1313 25.6315 32.0847 25.6315 30.7982V9.84351H18.8989C17.1835 9.84351 15.7879 8.44795 15.7879 6.73258Z"
						fill="#EDEAEA"
					/>
					<path
						d="M17.3452 6.73417C17.3452 7.59185 18.043 8.28963 18.9007 8.28963H24.48L17.3452 1.18848V6.73417Z"
						fill="#EDEAEA"
					/>
					<path
						className="_PageEditorPen"
						d="M18.9063 21.1187L25.6225 14.4025C26.7575 13.2675 28.0135 13.2675 29.1485 14.4025C30.2835 15.5375 30.2835 16.7935 29.1485 17.9285L22.4323 24.6447L18.9063 21.1187ZM21.5306 25.1533L18.6256 25.4761C18.308 25.5114 18.0396 25.2431 18.0749 24.9255L18.3977 22.0204L21.5306 25.1533Z"
						fill="#006769"
					/> */}
					<rect
						x="0.75"
						y="2.8125"
						width="23.4375"
						height="27.1875"
						rx="2"
						fill="#F2599B"
						fill-opacity="0.1"
					/>
					<path
						d="M13.6033 6.56857C13.6033 7.20566 14.1956 7.72397 14.9237 7.72397H19.66L13.6033 2.44922V6.56857Z"
						fill="#00ADB7"
					/>
					<rect x="3.5625" width="23.4375" height="27.1875" rx="2" fill="#F2599B" />
					<ellipse cx="7.12526" cy="2.62526" rx="0.750265" ry="0.750265" fill="white" />
					<ellipse cx="10.125" cy="2.62526" rx="0.750265" ry="0.750265" fill="white" />
					<rect
						x="6.375"
						y="5.625"
						width="16.875"
						height="1.40625"
						rx="0.703125"
						fill="white"
					/>
					<rect
						x="6.375"
						y="21.6875"
						width="16.875"
						height="1.40625"
						rx="0.703125"
						fill="white"
					/>
					<path
						className="_PageEditorPen"
						d="M7.77165 17.4134L11.4667 13.7183C12.0912 13.0939 12.7822 13.0939 13.4067 13.7183C14.0311 14.3428 14.0311 15.0338 13.4067 15.6583L9.71158 19.3533L7.77165 17.4134ZM9.21546 19.6332L7.61719 19.8108C7.44245 19.8302 7.29481 19.6825 7.31422 19.5078L7.49181 17.9095L9.21546 19.6332Z"
						fill="white"
					/>
				</IconHelper>
			),
		},
	],
};

export default component;
