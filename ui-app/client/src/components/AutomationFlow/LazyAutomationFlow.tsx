import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
	addListenerAndCallImmediatelyWithChildrenActivity,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { getTranslations } from '../util/getTranslations';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './automationFlowProperties';
import { checkAutomation, loadCatalog } from './automationApi';
import { AutomationDoc, AutomationRun, Catalog, CheckReport } from './automationTypes';
import { FlowEditorPanel } from './FlowEditorPanel';
import { FlowMode, FlowView } from './FlowView';

/**
 * The page component: reads the document, catalog, run, check report and
 * selection from their binding paths, draws them with FlowView, and in edit
 * mode writes the edited document (and the selection) back before running
 * the page's On Change / On Card Click events.
 */
/** How long the side panel waits after the last edit before running On Change. */
const PANEL_SETTLE_MS = 700;

export default function LazyAutomationFlow(props: Readonly<ComponentProps>) {
	const {
		definition,
		definition: { bindingPath, bindingPath2, bindingPath3, bindingPath4, bindingPath5 },
		locationHistory = [],
		context,
		pageDefinition,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const {
		properties: {
			mode = 'view',
			showEditor = true,
			compact = false,
			appCode = '',
			emptyMessage,
			onCardClick,
			onChange,
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

	const pathOf = (loc: any) =>
		loc ? getPathFromLocation(loc, locationHistory, pageExtractor) : undefined;
	const docPath = pathOf(bindingPath);
	const catalogPath = pathOf(bindingPath2);
	const runPath = pathOf(bindingPath3);
	const checkPath = pathOf(bindingPath4);
	const selectedPath = pathOf(bindingPath5);

	const [doc, setDoc] = useState<AutomationDoc | undefined>();
	const [catalog, setCatalog] = useState<Catalog | undefined>();
	const [run, setRun] = useState<AutomationRun | undefined>();
	const [check, setCheck] = useState<CheckReport | undefined>();
	const [selected, setSelected] = useState<string | undefined>();

	const listen = (path: string | undefined, set: (v: any) => void) => {
		if (!path) return;
		return addListenerAndCallImmediatelyWithChildrenActivity(
			pageExtractor.getPageName(),
			(_, v) => set(v ?? undefined),
			path,
		);
	};
	useEffect(() => listen(docPath, setDoc), [docPath]);
	useEffect(() => listen(catalogPath, setCatalog), [catalogPath]);
	useEffect(() => listen(runPath, setRun), [runPath]);
	useEffect(() => listen(checkPath, setCheck), [checkPath]);
	useEffect(() => listen(selectedPath, setSelected), [selectedPath]);

	const fire = useCallback(
		async (eventName: string | undefined) => {
			const fn = eventName ? pageDefinition.eventFunctions?.[eventName] : undefined;
			if (!fn) return;
			await runEvent(fn, eventName, context.pageName, locationHistory, pageDefinition);
		},
		[pageDefinition, context.pageName, locationHistory],
	);

	const select = useCallback(
		(key: string | undefined) => {
			if (selectedPath) setData(selectedPath, key, context.pageName);
			else setSelected(key);
		},
		[selectedPath, context.pageName],
	);

	const flowMode: FlowMode = mode === 'edit' || mode === 'run' ? mode : 'view';
	const editing = flowMode === 'edit';

	// A page that binds no catalog (the AppBuilder workspace) gets the app's own,
	// fetched here from the document's app and client.
	const [ownCatalog, setOwnCatalog] = useState<Catalog | undefined>();
	const catalogApp = appCode || doc?.appCode;
	useEffect(() => {
		if (catalogPath || !catalogApp) return;
		let live = true;
		loadCatalog(catalogApp, doc?.clientCode).then(c => live && setOwnCatalog(c));
		return () => {
			live = false;
		};
	}, [catalogPath, catalogApp, doc?.clientCode]);

	// Likewise the check: with no report bound, an edited flow is checked by the
	// server a moment after the last change, and its cards are badged.
	const [ownCheck, setOwnCheck] = useState<CheckReport | undefined>();
	useEffect(() => {
		if (checkPath || !editing || !doc) return;
		let live = true;
		const t = setTimeout(
			() => checkAutomation(doc).then(r => live && setOwnCheck(r)),
			PANEL_SETTLE_MS,
		);
		return () => {
			live = false;
			clearTimeout(t);
		};
	}, [checkPath, editing, doc]);
	const shownCatalog = catalogPath ? catalog : ownCatalog;
	const shownCheck = checkPath ? check : ownCheck;

	// Typing in the side panel changes the document on every key. The store is
	// written at once (the cards follow the typing), but On Change, which
	// usually saves, waits for a pause instead of running per keystroke.
	const changeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	useEffect(() => () => clearTimeout(changeTimer.current), []);

	const handleDocChange = useCallback(
		(next: AutomationDoc, newKey?: string, settle?: boolean) => {
			if (docPath) setData(docPath, next, context.pageName);
			else setDoc(next);
			if (newKey) select(newKey);
			clearTimeout(changeTimer.current);
			if (settle) changeTimer.current = setTimeout(() => fire(onChange), PANEL_SETTLE_MS);
			else fire(onChange);
		},
		[docPath, context.pageName, select, fire, onChange],
	);

	const handleCardClick = useCallback(
		(key: string) => {
			select(editing && selected === key ? undefined : key);
			fire(onCardClick);
		},
		[select, fire, onCardClick, editing, selected],
	);

	const resolvedStyles = processComponentStylePseudoClasses(
		pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	const panel =
		editing && showEditor && selected ? (
			<FlowEditorPanel
				doc={doc ?? {}}
				catalog={shownCatalog}
				nodeKey={selected}
				appCode={appCode || doc?.appCode}
				onChange={d => handleDocChange(d, undefined, true)}
				onClose={() => select(undefined)}
				style={resolvedStyles.panel}
				slot={<SubHelperComponent definition={definition} subComponentName="panel" />}
			/>
		) : undefined;

	return (
		<div className="comp compAutomationFlow" style={resolvedStyles.comp ?? {}}>
			<HelperComponent context={context} definition={definition} />
			<FlowView
				doc={doc}
				catalog={shownCatalog}
				run={flowMode === 'run' ? run : undefined}
				check={shownCheck}
				mode={flowMode}
				compact={!!compact}
				selectedKey={selected}
				appCode={appCode || undefined}
				onCardClick={editing || onCardClick ? handleCardClick : undefined}
				onDocChange={editing ? handleDocChange : undefined}
				styles={resolvedStyles}
				slot={name => (
					<SubHelperComponent definition={definition} subComponentName={name} />
				)}
				aside={panel}
				emptyMessage={
					emptyMessage
						? getTranslations(emptyMessage, pageDefinition.translations)
						: undefined
				}
			/>
		</div>
	);
}
