import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { HelperComponent } from '../HelperComponent';
import {
	ComponentPropertyDefinition,
	ComponentProps,
	LocationHistory,
	PageDefinition,
} from '../../types/common';
import {
	addListenerAndCallImmediately,
	addListenerAndCallImmediatelyWithChildrenActivity,
	getData,
	getDataFromPath,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { Component } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './pageEditorProperties';
import GridStyle from './PageEditorStyle';
import useDefinition from '../util/useDefinition';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import DnDEditor from './editors/DnDEditor/DnDEditor';
import TopBar from './TopBar';
import { runEvent } from '../util/runEvent';
import { MASTER_FUNCTIONS } from './masterFunctions';

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

	const defPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	const personalizationPath = bindingPath2
		? getPathFromLocation(bindingPath2, locationHistory, pageExtractor)
		: undefined;

	const resolvedStyles = processComponentStylePseudoClasses({}, stylePropertiesWithPseudoStates);

	const presonalization = personalizationPath
		? getDataFromPath(personalizationPath, locationHistory, pageExtractor) ?? {}
		: {};

	const [localTheme, setLocalTheme] = useState(presonalization.theme ?? theme);

	useEffect(() => {
		if (!personalizationPath) return;

		return addListenerAndCallImmediately(
			(_, v) => setLocalTheme(v ?? theme),
			pageExtractor,
			`${personalizationPath}.theme`,
		);
	}, [personalizationPath]);

	useEffect(() => setData('Store.pageData._global.collapseMenu', true), []);

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

	const [url, setUrl] = useState<string>('');
	const [clientCode, setClientCode] = useState<string>('');

	const editPageDefinition = !defPath
		? undefined
		: getDataFromPath(`${defPath}`, locationHistory, pageExtractor);

	useEffect(() => {
		if (!editPageDefinition || !presonalization) {
			setUrl('');
			setClientCode('');
			return;
		}

		if (presonalization?.pageLeftAt?.[editPageDefinition.name]) {
			setUrl(presonalization.pageLeftAt[editPageDefinition.name].url);
			setClientCode(presonalization.pageLeftAt[editPageDefinition.name].clientCode);
			return;
		}

		setClientCode(editPageDefinition.clientCode);
		setUrl(
			`/${editPageDefinition.appCode}/${
				clientCode === '' ? editPageDefinition.clientCode : clientCode
			}/page/${editPageDefinition.name}`,
		);
		setClientCode(editPageDefinition.clientCode);
	}, [presonalization, editPageDefinition]);

	const urlChange = useCallback(
		(v: string) => {
			setUrl(v ?? '');
			if (!personalizationPath || !editPageDefinition.name) return;
			savePersonalization(`pageLeftAt.${editPageDefinition.name}.url`, v);
			savePersonalization(
				`pageLeftAt.${editPageDefinition.name}.clientCode`,
				clientCode === '' ? editPageDefinition.clientCode : clientCode,
			);
		},
		[setUrl, savePersonalization, editPageDefinition?.name],
	);

	const ref = useRef<HTMLIFrameElement>(null);
	const [selectedComponent, setSelectedComponent] = useState<string>();

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

	useEffect(() => {
		if (!defPath) return;
		if (!ref.current) return;
		ref.current.contentWindow?.postMessage({
			type: 'EDITOR_SELECTION',
			payload: selectedComponent,
		});
	}, [selectedComponent, ref.current]);

	useEffect(() => {
		if (!ref.current) return;
		ref.current.contentWindow?.postMessage({
			type: 'EDITOR_TYPE',
			payload: 'PAGE',
		});
	}, [ref.current]);

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
					personalizationPath,
				},
				payload,
			);
		}

		window.addEventListener('message', onMessageFromSlave);
		return () => window.removeEventListener('message', onMessageFromSlave);
	}, [ref.current, editPageDefinition, defPath, personalizationPath]);

	const onPageReload = useCallback(() => {}, []);

	if (!presonalization) return <></>;

	return (
		<div className={`comp compPageEditor ${localTheme}`} style={resolvedStyles.comp ?? {}}>
			<HelperComponent key={`${key}_hlp`} definition={definition} />
			<TopBar
				url={url}
				theme={localTheme}
				personalizationPath={personalizationPath}
				logo={logo}
				pageName={context.pageName}
				onSave={saveFunction}
				onChangePersonalization={savePersonalization}
				onUrlChange={urlChange}
				onDeletePersonalization={deletePersonalization}
				pageExtractor={pageExtractor}
				onPageReload={onPageReload}
			/>
			<DnDEditor
				personalizationPath={personalizationPath}
				defPath={defPath}
				url={url}
				pageName={context.pageName}
				pageExtractor={pageExtractor}
				onSave={saveFunction}
				onChangePersonalization={savePersonalization}
				iframeRef={ref}
			/>
		</div>
	);
}

const component: Component = {
	name: 'PageEditor',
	displayName: 'Page Editor',
	description: 'Page Editor component',
	component: PageEditor,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: GridStyle,
	bindingPaths: {
		bindingPath: { name: 'Definition' },
		bindingPath2: { name: 'Personalization' },
	},
};

export default component;
