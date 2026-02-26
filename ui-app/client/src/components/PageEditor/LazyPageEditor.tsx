import { deepEqual, duplicate } from '@fincity/kirun-js';
import axios from 'axios';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ComponentDefinitions from '..';
import { usedComponents } from '../../App/usedComponents';
import { LOCAL_STORE_PREFIX, PAGE_STORE_PREFIX, STORE_PREFIX } from '../../constants';
import {
	addListenerAndCallImmediately,
	addListenerAndCallImmediatelyWithChildrenActivity,
	getDataFromPath,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { ComponentProps, LocationHistory, PageDefinition } from '../../types/common';
import { allPaths } from '../../util/allPaths';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import AISpotlight from './components/AISpotlight';
import CodeEditor from './components/CodeEditor';
import { ContextMenu, ContextMenuDetails } from './components/ContextMenu';
import PageEditorDebugWindow from './components/PageEditorDebugWindow';
import IssuePopup, { Issue } from './components/IssuePopup';
import DnDEditor from './editors/DnDEditor/DnDEditor';
import { MASTER_FUNCTIONS } from './functions/masterFunctions';
import {
	PageOperations,
	removeUnreferenecedComponentDefinitions,
} from './functions/PageOperations';
import { propertiesDefinition, stylePropertiesDefinition } from './pageEditorProperties';
import { performanceMonitor } from './util/performanceMonitor';
import { updateMultipleComponentsInPageDefinition } from './util/targetedPageUpdate';
import { messageThrottler } from './util/messageThrottler';

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

export default function LazyPageEditor(props: Readonly<ComponentProps>) {
	// Performance monitoring: Start render measurement
	const renderStartTime = performanceMonitor.startRenderMeasure();

	const {
		definition,
		definition: { bindingPath, bindingPath2, bindingPath3, bindingPath4 },
		pageDefinition,
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: {
			logo,
			theme,
			onSave,
			onPublish,
			onVersions,
			onSavedVersions,
			onChangePersonalization,
			onDeletePersonalization,
			pagesData,
			currentPageId,
			dashboardPageName,
			dashboardPageMenuName,
			formStorageUrl,
			settingsPageName,
			settingsPageMenuName,
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
		urlExtractor,
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
		? (getDataFromPath(personalizationPath, locationHistory, pageExtractor) ?? {})
		: {};

	// Managing theme with local state.
	const [localTheme, setLocalTheme] = useState(personalization.theme ?? theme);

	// Checking if someone changed the theme
	useEffect(() => {
		if (!personalizationPath) return;

		return addListenerAndCallImmediately(
			pageExtractor.getPageName(),
			(_, v) => setLocalTheme(v ?? theme),
			`${personalizationPath}.theme`,
		);
	}, [personalizationPath]);

	useEffect(() => {
		setData('Store.pageData._global.collapseMenu', true);
		usedComponents.using('KIRun Editor');
	}, []);

	// Utility function to recursively extract URLs matching the pattern
	const extractAiGenUrls = useCallback((obj: any, urls: Set<string>): void => {
		if (obj === null || obj === undefined) return;

		if (typeof obj === 'string') {
			// Match pattern: /api/files/static/file/SYSTEM/aiGen/<clientCode>/<fileName>
			const pattern = /\/api\/files\/static\/file\/SYSTEM\/aiGen\/[^/]+\/[^/]+/g;
			const matches = obj.match(pattern);
			if (matches) {
				matches.forEach(url => urls.add(url));
			}
			return;
		}

		if (Array.isArray(obj)) {
			obj.forEach(item => extractAiGenUrls(item, urls));
			return;
		}

		if (typeof obj === 'object') {
			Object.values(obj).forEach(value => extractAiGenUrls(value, urls));
		}
	}, []);

	// Function to replace URLs in the page definition
	const replaceUrls = useCallback((obj: any, urlMap: Map<string, string>): any => {
		if (obj === null || obj === undefined) return obj;

		if (typeof obj === 'string') {
			if (urlMap.has(obj)) {
				return urlMap.get(obj);
			}
			// Handle URLs that might be part of a larger string
			let result = obj;
			urlMap.forEach((newUrl, oldUrl) => {
				result = result.replace(oldUrl, newUrl);
			});
			return result;
		}

		if (Array.isArray(obj)) {
			return obj.map(item => replaceUrls(item, urlMap));
		}

		if (typeof obj === 'object') {
			const result: any = {};
			Object.keys(obj).forEach(key => {
				result[key] = replaceUrls(obj[key], urlMap);
			});
			return result;
		}

		return obj;
	}, []);

	// Function to save the page
	const saveFunction = useCallback(async () => {
		if (!onSave || !pageDefinition.eventFunctions?.[onSave]) return;

		let def = getDataFromPath(defPath, locationHistory, pageExtractor) as PageDefinition;
		if (!def) return;

		def = removeUnreferenecedComponentDefinitions(def);

		// Extract AI-generated image URLs
		const aiGenUrls = new Set<string>();
		extractAiGenUrls(def, aiGenUrls);

		// If there are AI-generated images, copy them to the client's page folder
		if (aiGenUrls.size > 0) {
			try {
				const currentPageDef = !defPath
					? undefined
					: (getDataFromPath(
							`${defPath}`,
							locationHistory,
							pageExtractor,
						) as PageDefinition);
				const pageName = currentPageDef?.name || context.pageName;
				const response = await axios.post<Array<{ url: string; name: string }>>(
					'/api/files/static/copyToClientPage',
					Array.from(aiGenUrls),
					{
						params: {
							pageName: pageName,
						},
						headers: {
							'Content-Type': 'application/json',
							Authorization: getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []),
						},
					},
				);

				// Create a map of old URLs to new URLs
				const urlMap = new Map<string, string>();
				aiGenUrls.forEach(oldUrl => {
					// Extract fileName from old URL
					const fileName = oldUrl.substring(oldUrl.lastIndexOf('/') + 1);
					// Find the corresponding new file detail
					const newFile = response.data.find(f => f.name === fileName);
					if (newFile && newFile.url) {
						urlMap.set(oldUrl, newFile.url);
					}
				});

				// Replace URLs in the page definition
				if (urlMap.size > 0) {
					def = replaceUrls(def, urlMap) as PageDefinition;
				}
			} catch (error) {
				console.error('Error copying AI-generated files:', error);
				// Continue with save even if copy fails
			}
		}

		setData(defPath!, def, pageExtractor.getPageName());

		(async () =>
			await runEvent(
				pageDefinition.eventFunctions[onSave],
				'pageEditorSave',
				context.pageName,
				locationHistory,
				pageDefinition,
			))();
	}, [
		onSave,
		extractAiGenUrls,
		replaceUrls,
		context.pageName,
		defPath,
		locationHistory,
		pageExtractor,
		pageDefinition,
	]);

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

	// Function to get the versions
	const savedVersionsFunction = useCallback(() => {
		if (!onSavedVersions || !pageDefinition.eventFunctions?.[onSavedVersions]) return;

		(async () =>
			await runEvent(
				pageDefinition.eventFunctions[onSavedVersions],
				'pageEditorVersions',
				context.pageName,
				locationHistory,
				pageDefinition,
			))();
	}, [onSavedVersions]);

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
					? (appDefinition?.clientCode ?? editPageDefinition.clientCode)
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
					? (appDefinition?.clientCode ?? editPageDefinition!.clientCode)
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

	// Debug viewer state
	const [debugMessages, setDebugMessages] = useState<Map<string, any[]>>(new Map([
		['desktop', []],
		['tablet', []],
		['mobile', []]
	]));
	const [showDebugMenu, setShowDebugMenu] = useState<boolean>(false);

	// AI Spotlight state
	const [aiSpotlight, setAISpotlight] = useState<{
		componentKey: string;
		componentType?: string;
	} | null>(null);

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

			// Find components that need updates (those with showInDesign or the selected one)
			const componentsToUpdate: Array<{
				componentKey: string;
				updater: (componentDef: any) => void;
			}> = [];

			// Find all components that currently have showInDesign
			Object.values(pageDef.componentDefinition).forEach(e => {
				if (e.key === v) {
					// Add selected component to set showInDesign
					componentsToUpdate.push({
						componentKey: e.key,
						updater: componentDef => {
							if (!componentDef.properties) componentDef.properties = {};
							componentDef.properties.showInDesign = { value: true };
						},
					});
				} else if (e.properties?.showInDesign) {
					// Add components that need showInDesign removed
					componentsToUpdate.push({
						componentKey: e.key,
						updater: componentDef => {
							if (componentDef.properties?.showInDesign) {
								delete componentDef.properties.showInDesign;
							}
						},
					});
				}
			});

			// Use targeted update instead of full clone for better performance
			if (componentsToUpdate.length > 0) {
				pageDef = updateMultipleComponentsInPageDefinition(pageDef, componentsToUpdate);
				setData(defPath, pageDef, pageExtractor.getPageName());
			}
		},
		[
			setSelectedComponentOriginal,
			setSelectedSubComponentOriginal,
			defPath,
			locationHistory,
			pageExtractor,
		],
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

	// Debug viewer handlers
	// Debug viewer - simply toggle the window
	const handleDebugButtonClick = useCallback(() => {
		setShowDebugMenu(prev => !prev);
	}, []);

	const handleClearAllDebug = useCallback(() => {
		setDebugMessages(new Map([
			['desktop', []],
			['tablet', []],
			['mobile', []]
		]));
	}, []);


	const [styleSelectorPref, setStyleSelectorPref] = useState<any>({});

	// Create PageOperations once and update it via methods to avoid recreation
	const operationsRef = useRef<PageOperations | null>(null);
	const operations = useMemo(() => {
		if (!operationsRef.current) {
			operationsRef.current = new PageOperations(
				defPath,
				locationHistory,
				pageExtractor,
				setIssue,
				selectedComponent,
				selectedSubComponent,
				key => setSelectedComponent(key),
				styleSelectorPref,
				editorType,
			);
		}
		return operationsRef.current;
	}, [defPath, locationHistory, pageExtractor, setIssue, editorType]); // Only recreate if these change

	// Update PageOperations when frequently changing values change
	useEffect(() => {
		if (operationsRef.current) {
			operationsRef.current.updateSelectedComponent(selectedComponent);
		}
	}, [selectedComponent]);

	useEffect(() => {
		if (operationsRef.current) {
			operationsRef.current.updateSelectedSubComponent(selectedSubComponent);
		}
	}, [selectedSubComponent]);

	useEffect(() => {
		if (operationsRef.current) {
			operationsRef.current.updateStyleSelectorPref(styleSelectorPref);
		}
	}, [styleSelectorPref]);

	useEffect(() => {
		if (!defPath) return;
		return addListenerAndCallImmediatelyWithChildrenActivity(
			pageExtractor.getPageName(),
			(_, payload) => {
				performanceMonitor.trackStoreUpdate();
				// Measure postMessage payload size
				performanceMonitor.measurePostMessage('EDITOR_DEFINITION', payload, 'desktop');
				performanceMonitor.measurePostMessage('EDITOR_DEFINITION', payload, 'tablet');
				performanceMonitor.measurePostMessage('EDITOR_DEFINITION', payload, 'mobile');
				// Use throttled message sending instead of direct postMessage
				messageThrottler.scheduleMessage(
					'EDITOR_DEFINITION',
					'EDITOR_DEFINITION',
					payload,
					['desktop', 'tablet', 'mobile'],
					() => ({
						desktop: desktopRef.current,
						tablet: tabletRef.current,
						mobile: mobileRef.current,
					}),
				);
			},
			defPath,
		);
	}, [defPath]);

	// On changing the personalization, this effect sends to the iframe/slave.
	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediatelyWithChildrenActivity(
			pageExtractor.getPageName(),
			(_, payload) => {
				performanceMonitor.trackStoreUpdate();
				// Measure postMessage payload size
				performanceMonitor.measurePostMessage('EDITOR_PERSONALIZATION', payload, 'desktop');
				performanceMonitor.measurePostMessage('EDITOR_PERSONALIZATION', payload, 'tablet');
				performanceMonitor.measurePostMessage('EDITOR_PERSONALIZATION', payload, 'mobile');
				// Use throttled message sending instead of direct postMessage
				messageThrottler.scheduleMessage(
					'EDITOR_PERSONALIZATION',
					'EDITOR_PERSONALIZATION',
					payload,
					['desktop', 'tablet', 'mobile'],
					() => ({
						desktop: desktopRef.current,
						tablet: tabletRef.current,
						mobile: mobileRef.current,
					}),
				);
			},
			personalizationPath,
		);
	}, [personalizationPath]);

	// On app def change message to component template iframe.
	useEffect(() => {
		if (!appPath) return;
		const unListen = addListenerAndCallImmediatelyWithChildrenActivity(
			pageExtractor.getPageName(),
			(_, payload) => {
				if (!templateIFrame) return;

				// Use throttled message sending for template iframe
				messageThrottler.scheduleMessage(
					'EDITOR_APP_DEFINITION',
					'EDITOR_APP_DEFINITION',
					payload,
					['template'],
					() => ({
						template: templateIFrame,
					}),
				);
			},
			appPath,
		);

		const unlisten2 = themePath
			? addListenerAndCallImmediatelyWithChildrenActivity(
					pageExtractor.getPageName(),
					(_, payload) => {
						if (!templateIFrame) return;

						// Use throttled message sending for template iframe
						messageThrottler.scheduleMessage(
							'EDITOR_APP_THEME',
							'EDITOR_APP_THEME',
							payload,
							['template'],
							() => ({
								template: templateIFrame,
							}),
						);
					},
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
					payload: { type: 'THEME_EDITOR' },
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

		// Selection changes are small payloads, but still throttle for rapid updates
		messageThrottler.scheduleMessage(
			'EDITOR_SELECTION',
			'EDITOR_SELECTION',
			selectedComponentsList,
			['desktop', 'tablet', 'mobile'],
			() => ({
				desktop: desktopRef.current,
				tablet: tabletRef.current,
				mobile: mobileRef.current,
			}),
		);
	}, [selectedComponentsList]);

	// On changing the sub selection, this effect sends to the iframe/slave.
	useEffect(() => {
		if (!defPath) return;

		// Sub-selection changes are small payloads, but still throttle for rapid updates
		messageThrottler.scheduleMessage(
			'EDITOR_SUB_SELECTION',
			'EDITOR_SUB_SELECTION',
			selectedSubComponent,
			['desktop', 'tablet', 'mobile'],
			() => ({
				desktop: desktopRef.current,
				tablet: tabletRef.current,
				mobile: mobileRef.current,
			}),
		);
	}, [selectedSubComponent]);

	// The type of the editor should be sent to iframe/slave.
	// Use a single effect that runs when iframes are ready (refs don't need to be dependencies)
	useEffect(() => {
		// Small delay to ensure iframes are loaded
		const timer = setTimeout(() => {
			desktopRef.current?.contentWindow?.postMessage({
				type: 'EDITOR_TYPE',
				payload: { type: 'PAGE', screenType: 'desktop' },
			});
			tabletRef.current?.contentWindow?.postMessage({
				type: 'EDITOR_TYPE',
				payload: { type: 'PAGE', screenType: 'tablet' },
			});
			mobileRef.current?.contentWindow?.postMessage({
				type: 'EDITOR_TYPE',
				payload: { type: 'PAGE', screenType: 'mobile' },
			});
		}, 100);

		return () => clearTimeout(timer);
	}, []); // Empty deps - only run once on mount

	// This will be used to store slave store.
	const [slaveStore, setSlaveStore] = useState<{desktop: any, tablet: any, mobile: any}>({desktop: {}, tablet: {}, mobile: {}});

	// Effect to listen to all the messages from the iframe/slave of the page iframes.
	// Use refs to avoid recreating listener on every render
	const editPageDefinitionRef = useRef(editPageDefinition);
	const defPathRef = useRef(defPath);
	const personalizationRef = useRef(personalization);
	const personalizationPathRef = useRef(personalizationPath);
	const selectedComponentRef = useRef(selectedComponent);
	const styleSelectorPrefRef = useRef(styleSelectorPref);

	// Update refs when values change
	useEffect(() => {
		editPageDefinitionRef.current = editPageDefinition;
		defPathRef.current = defPath;
		personalizationRef.current = personalization;
		personalizationPathRef.current = personalizationPath;
		selectedComponentRef.current = selectedComponent;
		styleSelectorPrefRef.current = styleSelectorPref;
	}, [
		editPageDefinition,
		defPath,
		personalization,
		personalizationPath,
		selectedComponent,
		styleSelectorPref,
	]);

	useEffect(() => {
		function onMessageFromSlave(e: any) {
			const {
				data: { type, payload, editorType, screenType },
			} = e;

			if (!type?.startsWith('SLAVE_')) return;
			if (!MASTER_FUNCTIONS.has(type)) throw Error('Unknown message from Slave : ' + type);

			if (editorType && editorType !== 'PAGE') return;

			// Use refs to get current values without recreating listener
			MASTER_FUNCTIONS.get(type)?.(
				{
					screenType,
					desktopIframe: desktopRef.current,
					tabletIframe: tabletRef.current,
					mobileIframe: mobileRef.current,
					editPageDefinition: editPageDefinitionRef.current,
					defPath: defPathRef.current,
					personalization: personalizationRef.current,
					personalizationPath: personalizationPathRef.current,
					selectedComponent: selectedComponentRef.current,
					styleSelectorPref: styleSelectorPrefRef.current,
					setStyleSelectorPref: setStyleSelectorPref,
					onSelectedComponentChange: (key, multi) =>
						multi ? setSelectedComponentList(key) : setSelectedComponent(key),
					onSelectedSubComponentChange: key => setSelectedSubComponent(key),
					operations: operationsRef.current!,
					onContextMenu: (m: ContextMenuDetails) => setContextMenu(m),
					onSlaveStore: (screenType: string, store: any) => {
						setSlaveStore((obj) => ({...obj, [screenType]: {
							store,
							localStore: Object.entries(window.localStorage)
								.filter((e: [string, string]) => e[0].startsWith('designMode_'))
								.reduce((a, c: [string, string]) => {
									let key = c[0].substring('designMode_'.length);
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
						}}));
					},
					onDebugExecution: (msg: any) => {
						// Flatten executionLog to top level for easier access
						const flattenedMsg = {
							...msg.executionLog,
							executionLog: msg.executionLog, // Keep nested for DebugExecutionModal
							executionId: msg.executionId,
							screenType: msg.screenType,
					pageDefinition: msg.pageDefinition,
					locationHistory: msg.locationHistory || [],
				};

						console.log('[DEBUG] LazyPageEditor received message:', {
							screenType: flattenedMsg.screenType,
							executionId: flattenedMsg.executionId,
							logs: flattenedMsg.logs,
							logsLength: flattenedMsg.logs?.length,
							firstLog: flattenedMsg.logs?.[0],
							firstLogFunctionName: flattenedMsg.logs?.[0]?.functionName,
							startTime: flattenedMsg.startTime,
							endTime: flattenedMsg.endTime,
							errored: flattenedMsg.errored,
							allKeys: Object.keys(flattenedMsg),
						});
						setDebugMessages(prev => {
							const updated = new Map(prev);
							const deviceMessages = updated.get(flattenedMsg.screenType) || [];

							// Check if execution with same ID already exists
							const existingIndex = deviceMessages.findIndex(m => m.executionId === flattenedMsg.executionId);

							let newMessages;
							if (existingIndex !== -1) {
								// Update existing execution (replace with latest data which should have more complete logs)
								newMessages = [...deviceMessages];
								newMessages[existingIndex] = flattenedMsg;
								console.log('[DEBUG] Updated existing execution:', {
									executionId: flattenedMsg.executionId,
									oldLogsLength: deviceMessages[existingIndex].logs?.length,
									newLogsLength: flattenedMsg.logs?.length,
								});
							} else {
								// Add new execution at the beginning
								newMessages = [flattenedMsg, ...deviceMessages].slice(0, 50); // Keep max 50
								console.log('[DEBUG] Added new execution:', {
									executionId: flattenedMsg.executionId,
									logsLength: flattenedMsg.logs?.length,
								});
							}

							updated.set(flattenedMsg.screenType, newMessages);
							console.log('[DEBUG] Updated debug messages:', {
								device: flattenedMsg.screenType,
								newMessagesCount: newMessages.length,
								totalDevicesWithMessages: Array.from(updated.entries())
									.filter(([_, msgs]) => msgs.length > 0)
									.map(([device, msgs]) => `${device}:${msgs.length}`),
							});
							return updated;
						});
					},
				},
				payload,
			);
		}

		window.addEventListener('message', onMessageFromSlave);
		return () => window.removeEventListener('message', onMessageFromSlave);
	}, []); // Empty deps - listener uses refs for current values

	const undoStackRef = useRef<Array<PageDefinition>>([]);
	const redoStackRef = useRef<Array<PageDefinition>>([]);
	const firstTimeRef = useRef<Array<PageDefinition>>([]);
	const latestVersion = useRef<number>(0);

	// Monitor undo/redo stack sizes periodically
	useEffect(() => {
		const interval = setInterval(() => {
			performanceMonitor.measureUndoStack(undoStackRef.current, 'undo');
			performanceMonitor.measureUndoStack(redoStackRef.current, 'redo');
		}, 5000); // Check every 5 seconds

		return () => clearInterval(interval);
	}, []);

	// Cleanup: Flush all pending messages on unmount
	useEffect(() => {
		return () => {
			messageThrottler.flushAll(() => ({
				desktop: desktopRef.current,
				tablet: tabletRef.current,
				mobile: mobileRef.current,
				template: templateIFrame,
			}));
		};
	}, []);

	const storePaths = useMemo<Set<string>>(
		() =>
			allPaths(
				STORE_PREFIX,
				(slaveStore?.desktop ?? slaveStore?.tablet ?? slaveStore?.mobile)?.store,
				allPaths(
					LOCAL_STORE_PREFIX,
					(slaveStore?.desktop ?? slaveStore?.tablet ?? slaveStore?.mobile)?.localStore,
					allPaths(
						PAGE_STORE_PREFIX,
						(slaveStore?.desktop ?? slaveStore?.tablet ?? slaveStore?.mobile)?.store?.pageData?.[editPageDefinition?.name ?? ''],
					),
				),
			),
		[slaveStore],
	);

	useEffect(() => {
		if (!defPath) return;
		const removeListener = addListenerAndCallImmediately(
			pageExtractor.getPageName(),
			(_, v) => {
				if (!v?.id) return;

				try {
					removeListener();
				} catch (e) {}

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
			defPath,
		);

		return removeListener;
	}, [defPath, setIssue]);

	if (personalizationPath && !personalization) {
		performanceMonitor.endRenderMeasure(renderStartTime, 'LazyPageEditor');
		return <></>;
	}

	// Performance monitoring: End render measurement
	performanceMonitor.endRenderMeasure(renderStartTime, 'LazyPageEditor');

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
				onSavedVersions={onSavedVersions ? savedVersionsFunction : undefined}
				pagesData={pagesData}
				currentPageId={currentPageId}
				settingsPageName={settingsPageName}
				settingsPageMenuName={settingsPageMenuName}
				dashboardPageName={dashboardPageName}
				dashboardPageMenuName={dashboardPageMenuName}
				addnewPageName={addnewPageName}
				editorType={editorType}
				sectionsListConnectionName={sectionsListConnectionName}
				sectionsCategoryList={sectionsCategoryList}
				helpURL={helpURL}
				onDebugButtonClick={handleDebugButtonClick}
				debugMessageCount={Math.max(debugMessages.get('desktop')?.length ?? 0,
					debugMessages.get('tablet')?.length ?? 0, debugMessages.get('mobile')?.length ?? 0)}
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
				onAIClick={(componentKey, componentType) => {
					setAISpotlight({ componentKey, componentType });
				}}
			/>
			{/* AI Spotlight Overlay */}
			{aiSpotlight && editPageDefinition && (
				<AISpotlight
					componentKey={aiSpotlight.componentKey}
					componentType={aiSpotlight.componentType}
					pageDefinition={editPageDefinition}
					appCode={editPageDefinition.appCode ?? ''}
					desktopIframe={desktopRef}
					tabletIframe={tabletRef}
					mobileIframe={mobileRef}
					appPath={appPath}
					themePath={themePath}
					pageExtractor={pageExtractor}
					locationHistory={locationHistory}
					onApply={aiResult => {
						if (defPath && aiResult) {
							// Merge AI result with existing page, preserving metadata
							const mergedPage: PageDefinition = {
								...editPageDefinition, // Keep all existing metadata (id, clientCode, version, etc.)
								...aiResult, // Apply AI modifications
								// Ensure critical fields from original are preserved
								id: editPageDefinition.id,
								clientCode: editPageDefinition.clientCode,
								appCode: editPageDefinition.appCode,
								version: editPageDefinition.version,
							};
							setData(defPath, mergedPage, pageExtractor.getPageName());
						}
						setAISpotlight(null);
					}}
					onClose={() => setAISpotlight(null)}
				/>
			)}
			{/* Debug Window */}
			{showDebugMenu && (
				<PageEditorDebugWindow
					executions={Array.from(debugMessages.values()).flat()}
					onClose={() => setShowDebugMenu(false)}
					onClearAll={handleClearAllDebug}
					slaveStore={slaveStore}
					savePersonalization={() => savePersonalization('test', 'test')}
					personalizationPath={personalizationPath}
				/>
			)}
		</div>
	);
}
