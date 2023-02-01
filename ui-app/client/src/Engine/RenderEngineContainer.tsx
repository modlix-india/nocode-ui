import React, { useEffect, useState } from 'react';
import { useLocation, Location } from 'react-router-dom';
import { GLOBAL_CONTEXT_NAME, STORE_PREFIX } from '../constants';
import {
	addListener,
	addListenerAndCallImmediately,
	getData,
	getDataFromPath,
	setData,
} from '../context/StoreContext';
import * as getPageDefinition from './../definitions/getPageDefinition.json';
import { runEvent } from '../components/util/runEvent';
import { Components } from '../components';
import { processLocation } from '../util/locationProcessor';
import { isNullValue } from '@fincity/kirun-js';

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
				await runEvent(getPageDefinition, 'pageDefinition', GLOBAL_CONTEXT_NAME, []);
				pDef = getDataFromPath(`${STORE_PREFIX}.pageDefinition.${pageName}`, []);
				setPageDefinition(pDef);
				setCurrentPageName(pageName);
			})();
		} else {
			setPageDefinition(pDef);
			setCurrentPageName(pageName);
		}
	}, [pageDefinition, location]);

	useEffect(() => {
		const { pageName } = processLocation(location);

		return addListener(
			(_, v) => setPageDefinition(v),
			undefined,
			`${STORE_PREFIX}.pageDefinition.${pageName}`,
		);
	}, []);

	useEffect(
		() =>
			addListenerAndCallImmediately(
				async (_, value) => {
					setShellPageDefinition(value);
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
			!shellPageDefinition?.properties?.onLoadFunction ||
			!shellPageDefinition?.eventFunctions?.[shellPageDefinition?.properties?.onLoadFunction]
		)
			return;

		(async () =>
			await runEvent(
				shellPageDefinition.eventFunctions[shellPageDefinition.properties.onLoadFunction],
				'appOnLoad',
				GLOBAL_CONTEXT_NAME,
				[],
			))();
	}, [shellPageDefinition?.properties?.onLoadFunction]);

	const Page = Components.get('Page')!;

	if (currentPageName && pageDefinition) {
		const { properties: { wrapShell = true } = {} } = pageDefinition;

		if (wrapShell && shellPageDefinition)
			return (
				<Page
					locationHistory={[]}
					definition={shellPageDefinition}
					context={{ pageName: GLOBAL_CONTEXT_NAME }}
				/>
			);

		return (
			<Page
				locationHistory={[]}
				definition={pageDefinition}
				context={{ pageName: currentPageName }}
			/>
		);
	} else if (pageDefinition) {
		const definitions = getDataFromPath(`${STORE_PREFIX}.pageDefinition`, []) ?? {};
		const hasDefinitions = !!Object.keys(definitions).length;
		if (!hasDefinitions) return <>...</>;

		return (
			<Page
				locationHistory={[]}
				definition={shellPageDefinition}
				context={{ pageName: GLOBAL_CONTEXT_NAME }}
			/>
		);
	} else {
		//TODO: Need to throw an error that there is not page definition found.
		return <>...</>;
	}
};
