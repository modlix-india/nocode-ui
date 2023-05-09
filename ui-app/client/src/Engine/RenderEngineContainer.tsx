import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { GLOBAL_CONTEXT_NAME, STORE_PREFIX } from '../constants';
import {
	addListener,
	addListenerAndCallImmediately,
	getDataFromPath,
	setData,
} from '../context/StoreContext';
import * as getPageDefinition from './../definitions/getPageDefinition.json';
import { runEvent } from '../components/util/runEvent';
import ComponentDefinitions from '../components';
import { processLocation } from '../util/locationProcessor';
import { isNullValue } from '@fincity/kirun-js';
import { PageDefinition } from '../types/common';
import { processClassesForPageDefinition } from '../util/styleProcessor';

export const RenderEngineContainer = () => {
	const location = useLocation();
	const pathParams = useParams();
	const [currentPageName, setCurrentPageName] = useState<string | undefined>();
	const [shellPageDefinition, setShellPageDefinition] = useState<PageDefinition>();
	const [pageDefinition, setPageDefinition] = useState<any>();

	const loadDefinition = useCallback(() => {
		const details = processLocation(location);
		let { pageName } = details;
		setData(`${STORE_PREFIX}.urlDetails`, details);
		if (!pageName)
			pageName = getDataFromPath(`${STORE_PREFIX}.application.properties.defaultPage`, []);
		let pDef = getDataFromPath(`${STORE_PREFIX}.pageDefinition.${pageName}`, []);
		if (!pDef) {
			(async () => {
				await runEvent(getPageDefinition, 'pageDefinition', GLOBAL_CONTEXT_NAME, []);
				pDef = getDataFromPath(`${STORE_PREFIX}.pageDefinition.${pageName}`, []);
				setPageDefinition(processClassesForPageDefinition(pDef));
				setCurrentPageName(pageName);
			})();
		} else {
			setPageDefinition(processClassesForPageDefinition(pDef));
			setCurrentPageName(pageName);
		}
	}, [location]);

	useEffect(() => {
		loadDefinition();
	}, [pathParams['*']]);

	useEffect(() => {
		if (!location.hash) return;
		setTimeout(() => {
			const id = location.hash.replace('#', '');
			const element = document.getElementById(id);
			if (!element) return;
			element.scrollIntoView();
		}, 0);
	}, [location]);

	useEffect(() => {
		return addListener(
			() => {
				setPageDefinition(undefined);
				setCurrentPageName(undefined);
				loadDefinition();
			},
			undefined,
			'Store.pageDefinition',
		);
	}, []);

	useEffect(
		() =>
			addListenerAndCallImmediately(
				async (_, value) => {
					setShellPageDefinition(processClassesForPageDefinition(value));
					if (isNullValue(value)) return;
					const { properties: { onLoadEvent = undefined } = {}, eventFunctions } = value;
					if (isNullValue(onLoadEvent) || isNullValue(eventFunctions[onLoadEvent]))
						return;
					await runEvent(
						eventFunctions[onLoadEvent],
						'appOnLoad',
						GLOBAL_CONTEXT_NAME,
						[],
					);
				},
				undefined,
				`${STORE_PREFIX}.application.properties.shellPageDefinition`,
			),
		[],
	);

	// This is to execute the shell page on load event function so this acts as a application on load event.
	// This has to execute even the shell page is not loaded.
	useEffect(() => {
		if (
			!shellPageDefinition?.properties?.onLoadEvent ||
			!shellPageDefinition?.eventFunctions?.[shellPageDefinition?.properties?.onLoadEvent]
		)
			return;

		(async () =>
			await runEvent(
				shellPageDefinition.eventFunctions[shellPageDefinition.properties.onLoadEvent!],
				'appOnLoad',
				GLOBAL_CONTEXT_NAME,
				[],
			))();
	}, [shellPageDefinition?.properties?.onLoadEvent]);

	const [, setLastChanged] = useState(Date.now());

	useEffect(() => {
		if (window.designMode !== 'PAGE') return;

		function onMessageRecieved(e: MessageEvent) {
			const { data: { type } = {} } = e;

			if (!type || !type.startsWith('EDITOR_')) return;
			setLastChanged(Date.now());
		}
		window.addEventListener('message', onMessageRecieved);
		return () => window.removeEventListener('message', onMessageRecieved);
	}, [setLastChanged]);

	useEffect(() => {
		if (window.designMode !== 'PAGE') return;

		return addListener(
			(_, v) => setPageDefinition(processClassesForPageDefinition(v)),
			undefined,
			`${STORE_PREFIX}.pageDefinition.${currentPageName}`,
		);
	}, [currentPageName]);

	const Page = ComponentDefinitions.get('Page')!.component;

	if (isNullValue(pageDefinition)) return <>...</>;

	if (currentPageName && pageDefinition) {
		const { properties: { wrapShell = true } = {} } = pageDefinition;

		if (
			wrapShell &&
			shellPageDefinition &&
			(window.designMode !== 'PAGE' || !window.pageEditor?.personalization?.slave?.noShell)
		)
			return (
				<Page
					locationHistory={[]}
					pageDefinition={shellPageDefinition}
					context={{
						pageName: GLOBAL_CONTEXT_NAME,
						shellPageName: shellPageDefinition?.name,
						level: 0,
					}}
				/>
			);

		return (
			<Page
				locationHistory={[]}
				pageDefinition={pageDefinition}
				context={{
					pageName: currentPageName,
					shellPageName: shellPageDefinition?.name,
					level: 0,
				}}
			/>
		);
	} else if (pageDefinition) {
		const definitions = getDataFromPath(`${STORE_PREFIX}.pageDefinition`, []) ?? {};
		const hasDefinitions = !!Object.keys(definitions).length;
		if (!hasDefinitions) return <>...</>;

		return (
			<Page
				locationHistory={[]}
				pageDefinition={shellPageDefinition}
				context={{
					pageName: GLOBAL_CONTEXT_NAME,
					shellPageName: shellPageDefinition?.name,
					level: 0,
				}}
			/>
		);
	} else {
		//TODO: Need to throw an error that there is not page definition found.
		return <>...</>;
	}
};
