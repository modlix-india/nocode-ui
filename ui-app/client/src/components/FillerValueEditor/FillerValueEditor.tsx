import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getDataFromPath,
	getPathFromLocation,
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
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { IconHelper } from '../util/IconHelper';
import useDefinition from '../util/useDefinition';
import GridStyle from './FillerValueEditorStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './fillerValueEditorProperties';
import { styleDefaults } from './fillerValueEditorStyleProperties';
import ValueEditor from './components/ValueEditor';
import PageViewer from './components/PageViewer';
import { runEvent } from '../util/runEvent';
import TopBar from './components/TopBar';
import { Filler, PopupType } from './components/fillerCommons';
import { duplicate, isNullValue } from '@fincity/kirun-js';
import { MASTER_FUNCTIONS } from './components/masterFunctions';
import ImagePopup from './components/ImagePoup';
import ObjectPopup from './components/ObjectPopup';

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

function FillerValueEditor(props: Readonly<ComponentProps>) {
	const { definition, pageDefinition, locationHistory, context } = props;
	const {
		definition: { bindingPath, bindingPath3, bindingPath2, bindingPath4 },
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: {
			onSave,
			onReset,
			onChangePersonalization,
			logo,
			dashboardPageName,
			settingsPageName,
		} = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	const uiDefPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	const coreDefPath = bindingPath2
		? getPathFromLocation(bindingPath2, locationHistory, pageExtractor)
		: undefined;

	// binding path for the editor's personalization.
	const personalizationPath = bindingPath3
		? getPathFromLocation(bindingPath3, locationHistory, pageExtractor)
		: undefined;

	const appDefPath = bindingPath4
		? getPathFromLocation(bindingPath4, locationHistory, pageExtractor)
		: undefined;

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

	const [uiFiller, setUIFiller] = useState<Filler>({});
	const [coreFiller, setCoreFiller] = useState<Filler>({});

	const [firstUIFiller, setFirstUIFiller] = useState<Filler | undefined>(undefined);
	const [firstCoreFiller, setFirstCoreFiller] = useState<Filler | undefined>(undefined);

	const clientCode = getDataFromPath('Store.auth.client.code', locationHistory, pageExtractor);

	useEffect(() => {
		if (!uiDefPath) return;
		return addListenerAndCallImmediately(
			(_, value) => {
				const isNull = isNullValue(value);
				setUIFiller(isNull ? {} : value);
				if (!isNull && !firstUIFiller) setFirstUIFiller(value);
			},
			pageExtractor,
			uiDefPath,
		);
	}, [firstUIFiller, setFirstUIFiller, uiDefPath]);

	useEffect(() => {
		if (!coreDefPath) return;
		return addListenerAndCallImmediately(
			(_, value) => {
				const isNull = isNullValue(value);
				setCoreFiller(isNull ? {} : value);
				if (!isNull && !firstCoreFiller) setFirstCoreFiller(value);
			},
			pageExtractor,
			coreDefPath,
		);
	}, [firstCoreFiller, setFirstCoreFiller, coreDefPath]);

	const undoStack = useRef<Array<Filler[]>>([]);
	const redoStack = useRef<Array<Filler[]>>([]);

	const [popups, setPopups] = useState<PopupType[]>([]);

	const iframeRef = useRef<HTMLIFrameElement>(null);

	useEffect(() => {
		function onMessageFromSlave(e: any) {
			const {
				data: { type, payload, editorType },
			} = e;

			if (!type || !type.startsWith('SLAVE_') || !iframeRef.current) return;

			if (!MASTER_FUNCTIONS.has(type)) throw Error('Unknown message from Slave : ' + type);

			if (editorType && editorType !== 'PAGE') return;

			MASTER_FUNCTIONS.get(type)!({ iframe: iframeRef.current }, payload);
		}

		window.addEventListener('message', onMessageFromSlave);
		return () => window.removeEventListener('message', onMessageFromSlave);
	}, [iframeRef.current]);

	const [selection, setSelection] = useState<
		{ isUIFiller: boolean; sectionKey: string; sectionNumber: number } | undefined
	>();

	useEffect(() => {
		if (!selection || !iframeRef.current) return;

		const { isUIFiller, sectionKey } = selection;

		const filler = isUIFiller ? uiFiller : coreFiller;

		if (!filler) return;

		const section = filler.definition?.[sectionKey];

		if (!section) return;

		iframeRef.current.contentWindow?.postMessage(
			{
				type: 'EDITOR_FILLER_SECTION_SELECTION',
				payload: { sectionKey, section, sectionNumber: selection.sectionNumber },
			},
			'*',
		);
	}),
		[selection, iframeRef.current];

	useEffect(() => setPopups([]), [selection?.sectionNumber]);

	let filler = uiFiller;
	if (!selection?.isUIFiller && Object.keys(coreFiller).length > 0) filler = coreFiller;

	let url = filler.appCode ? `/${filler.appCode}/${filler.clientCode}/page` : '';

	let hasGKey = false;
	if (filler.definition?.[selection?.sectionKey ?? '']) {
		url += filler.definition?.[selection?.sectionKey!].pagePath;
		let gkey = filler.definition?.[selection?.sectionKey!].gridKey ?? '';
		if (gkey) {
			const commaIndex = gkey.indexOf(',');
			if (commaIndex > 0) gkey = gkey.substring(0, commaIndex);
			gkey = gkey.trim();
			url += `#${gkey}`;
			hasGKey = true;
		}
	} else url += '/#';

	if (!hasGKey && !url.endsWith('/#')) {
		if (url.endsWith('/')) url += '#';
		else url += '/#';
	}
	if (url === '/') url = '';

	const valueChanged = (isUIFiller: boolean, filler: Filler) => {
		if (!(isUIFiller ? uiDefPath : coreDefPath)) return;
		undoStack.current.push(duplicate([uiFiller, coreFiller]));
		redoStack.current.splice(0, redoStack.current.length);

		setData(isUIFiller ? uiDefPath! : coreDefPath!, filler, context.pageName);
		if (!isUIFiller || !iframeRef.current) return;
		iframeRef.current.contentWindow?.postMessage(
			{
				type: 'EDITOR_FILLER_VALUE_CHANGE',
				payload: { values: filler.values ?? {} },
			},
			'*',
		);
	};

	let popupContorl = <></>;
	if (popups.length) {
		let popupList: ReactNode[] = [];

		for (const p of popups) {
			if (p.type === 'IMAGE') {
				popupList.push(
					<ImagePopup
						dataPath={p.path}
						isUIFiller={p.isUIFiller ?? false}
						uiFiller={uiFiller}
						coreFiller={coreFiller}
						onValueChanged={valueChanged}
						onClose={() => setPopups([])}
					/>,
				);
			} else if (p.type === 'OBJECT') {
				popupList.push(
					<ObjectPopup
						editor={p.editorDefinition}
						dataPath={p.path}
						isUIFiller={p.isUIFiller ?? false}
						uiFiller={uiFiller}
						coreFiller={coreFiller}
						onValueChanged={valueChanged}
						onClose={() => setPopups([])}
					/>,
				);
			}
		}

		if (popupList.length) popupContorl = <>{popupList}</>;
	}

	const [appDefinition, setAppDefinition] = useState<any>(undefined);

	useEffect(() => {
		if (!appDefPath) return;
		return addListenerAndCallImmediately(
			(_, value) => {
				setAppDefinition(value);
			},
			pageExtractor,
			appDefPath,
		);
	}, [appDefPath]);

	return (
		<div className={`comp compFillerValueEditor`} style={resolvedStyles.comp ?? {}}>
			<HelperComponent context={props.context} key={`${key}_hlp`} definition={definition} />
			<TopBar
				logo={logo}
				dashboardPageName={dashboardPageName}
				settingsPageName={settingsPageName}
				onSave={() => {
					if (!onSave || !pageDefinition.eventFunctions?.[onSave]) return;
					runEvent(
						pageDefinition.eventFunctions?.[onSave],
						'pageEditorSave',
						context.pageName,
						locationHistory,
						pageDefinition,
					);
				}}
				onReset={() => {
					if (!onSave || !pageDefinition.eventFunctions?.[onReset]) return;
					runEvent(
						pageDefinition.eventFunctions?.[onReset],
						'pageEditorSave',
						context.pageName,
						locationHistory,
						pageDefinition,
					);
				}}
				onUndo={() => {
					if (undoStack.current.length === 0) return;
					const [f1, f2] = duplicate(undoStack.current.pop()!);
					setData(uiDefPath!, f1, context.pageName);
					iframeRef.current?.contentWindow?.postMessage(
						{
							type: 'EDITOR_FILLER_VALUE_CHANGE',
							payload: { values: f1.values ?? {} },
						},
						'*',
					);
					if (Object.keys(f2).length > 0) setData(coreDefPath!, f2, context.pageName);
					redoStack.current.push(duplicate([uiFiller, coreFiller]));
				}}
				onRedo={() => {
					if (redoStack.current.length === 0) return;
					const [f1, f2] = duplicate(redoStack.current.pop()!);
					setData(uiDefPath!, f1, context.pageName);
					iframeRef.current?.contentWindow?.postMessage(
						{
							type: 'EDITOR_FILLER_VALUE_CHANGE',
							payload: { values: f1.values ?? {} },
						},
						'*',
					);
					if (Object.keys(f2).length > 0) setData(coreDefPath!, f2, context.pageName);
					undoStack.current.push(duplicate([uiFiller, coreFiller]));
				}}
				hasUndo={undoStack?.current?.length > 0}
				hasRedo={redoStack?.current?.length > 0}
				pageExtractor={pageExtractor}
				locationHistory={locationHistory}
				personalizationPath={personalizationPath}
				onPersonalizationChange={(k: string, v: any) => savePersonalization(k, v)}
				url={`https://live.${window.location.hostname}/${filler.appCode}/${clientCode}/page/`}
			/>
			<div className="_body">
				<ValueEditor
					uiFiller={uiFiller}
					coreFiller={coreFiller}
					pageExtractor={pageExtractor}
					personalizationPath={personalizationPath}
					onPersonalizationChange={(k: string, v: any) => savePersonalization(k, v)}
					selection={selection}
					onSectionSelection={(isUIFiller: boolean, sectionKey: string, index: number) =>
						setSelection({ isUIFiller, sectionKey, sectionNumber: index })
					}
					onValueChanged={valueChanged}
					onPopup={(newPopup: PopupType, clear: boolean) => {
						if (clear) setPopups([newPopup]);
						else setPopups([...popups, newPopup]);
					}}
					appDefinition={appDefinition}
				/>
				<PageViewer
					url={url}
					iframeRef={iframeRef}
					pageExtractor={pageExtractor}
					personalizationPath={personalizationPath}
				/>
			</div>
			{popupContorl}
		</div>
	);
}

const component: Component = {
	name: 'FillerValueEditor',
	displayName: 'Filler Value Editor',
	description: 'Filler Value Editor Component',
	component: FillerValueEditor,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: GridStyle,
	styleDefaults: styleDefaults,
	stylePseudoStates: [],
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'UI Filler' },
		bindingPath2: { name: 'Server Filler' },
		bindingPath3: { name: 'Personalization' },
		bindingPath4: { name: 'Application' },
	},
	defaultTemplate: {
		key: '',
		name: 'Fillter Value Editor',
		type: 'FillerValueEditor',
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<g id="Group_101" data-name="Group 101" transform="translate(-1205 -495.138)">
						<g id="Group_100" data-name="Group 100" transform="translate(-26 49.498)">
							<path
								id="Path_228"
								data-name="Path 228"
								d="M0,8.863a1.138,1.138,0,0,0,.969.9l8.9-.78L.237,0Z"
								transform="translate(1233.592 452.374) rotate(-43)"
								fill="currentColor"
							/>
							<path
								id="Path_233"
								data-name="Path 233"
								d="M1.407,0,8.224,7.712a1.827,1.827,0,0,0,1.035.582c.51.007.98-.582.98-.582L17.593,0A1.407,1.407,0,0,1,19,1.407V13.37a1.407,1.407,0,0,1-1.407,1.407H1.407A1.407,1.407,0,0,1,0,13.37V1.407A1.407,1.407,0,0,1,1.407,0Z"
								transform="translate(1231 452.227)"
								fill="currentColor"
								fillOpacity={0.2}
							/>
						</g>
						<path
							id="Path_229"
							data-name="Path 229"
							d="M14.554,15.025l4.46-4.46a1.5,1.5,0,0,1,2.341,0,1.5,1.5,0,0,1,0,2.341l-4.46,4.46ZM16.3,17.7l-1.929.214A.331.331,0,0,1,14,17.553l.214-1.929Z"
							transform="translate(1205.04 495.82)"
							fill="currentColor"
						/>
					</g>
				</IconHelper>
			),
		},
	],
};

export default component;
