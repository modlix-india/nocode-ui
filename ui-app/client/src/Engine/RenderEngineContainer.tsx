import React, { useEffect, useState } from 'react';
import { useLocation, Location } from 'react-router-dom';
import { GOBAL_CONTEXT_NAME, STORE_PREFIX } from '../constants';
import {
	addListener,
	addListenerAndCallImmediately,
	getData,
	getDataFromPath,
	setData,
} from '../context/StoreContext';
import * as getPageDefinition from './../definitions/getPageDefinition.json';
import { runEvent } from '../components/util/runEvent';
import Page from '../components/Page';
import { processLocation } from '../util/locationProcessor';

export const RenderEngineContainer = () => {
	const location = useLocation();
	const [currentPageName, setCurrentPageName] = useState<string | undefined>();
	const [shellPageDefinition, setShellPageDefinition] = useState<any>();
	const [pageDefinition, setPageDefinition] = useState<any>();

	useEffect(() => {
		const details = processLocation(location);
		setData(`${STORE_PREFIX}.urlDetails`, details);

		let { pageName } = details;

		if (!pageName)
			pageName = getDataFromPath(`${STORE_PREFIX}.application.properties.defaultPage`, []);
		let pDef = getDataFromPath(`${STORE_PREFIX}.pageDefinition.${pageName}`, []);
		if (!pDef) {
			(async () => {
				await runEvent(getPageDefinition, 'pageDefinition');
				pDef = getDataFromPath(`${STORE_PREFIX}.pageDefinition.${pageName}`, []);
				setPageDefinition(pDef);
				setCurrentPageName(pageName);
			})();
		} else {
			setPageDefinition(pDef);
			setCurrentPageName(pageName);
		}
	}, [location]);

	useEffect(
		() =>
			addListenerAndCallImmediately(
				(_, value) => {
					setShellPageDefinition(value);
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
			!shellPageDefinition?.properties?.onLoadFunction ||
			!shellPageDefinition?.eventFunctions?.[shellPageDefinition?.properties?.onLoadFunction]
		)
			return;

		runEvent(shellPageDefinition.eventFunctions[shellPageDefinition.properties.onLoadFunction]);
	}, [shellPageDefinition?.properties?.onLoadFunction]);

	if (currentPageName && pageDefinition) {
		const { properties: { wrapShell = true } = {} } = pageDefinition;

		if (wrapShell && shellPageDefinition)
			return (
				<Page
					locationHistory={[]}
					definition={shellPageDefinition}
					context={{ pageName: GOBAL_CONTEXT_NAME }}
				/>
			);

		return (
			<Page
				locationHistory={[]}
				definition={pageDefinition}
				context={{ pageName: currentPageName }}
			/>
		);
	} else {
		const definitions = getDataFromPath(`${STORE_PREFIX}.pageDefinition`, []) ?? {};
		const hasDefinitions = !!Object.keys(definitions).length;
		if (!hasDefinitions) return <>Loading...</>;

		return (
			<Page
				locationHistory={[]}
				definition={shellPageDefinition}
				context={{ pageName: GOBAL_CONTEXT_NAME }}
			/>
		);
	}
};
