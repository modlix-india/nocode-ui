import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { GLOBAL_CONTEXT_NAME, STORE_PREFIX } from '../constants';
import {
	PageStoreExtractor,
	addListener,
	addListenerAndCallImmediately,
	getDataFromLocation,
	getDataFromPath,
	localStoreExtractor,
	setData,
	storeExtractor,
} from '../context/StoreContext';
import * as getPageDefinition from './../definitions/getPageDefinition.json';
import { runEvent } from '../components/util/runEvent';
import ComponentDefinitions from '../components';
import { processLocation } from '../util/locationProcessor';
import { TokenValueExtractor, isNullValue } from '@fincity/kirun-js';
import { ComponentProperty, PageDefinition } from '../types/common';
import { processClassesForPageDefinition } from '../util/styleProcessor';
import { getData } from '../context/StoreContext';
import { getPathsFrom } from '../components/util/getPaths';

export const RenderEngineContainer = () => {
	const location = useLocation();
	const pathParams = useParams();
	const [currentPageName, setCurrentPageName] = useState<string | undefined>();
	const [shellPageDefinition, setShellPageDefinition] = useState<PageDefinition>();
	const [pageDefinition, setPageDefinition] = useState<any>();
	const [appTitle, setAppTitle] = useState<string>('');

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
	}, [pathParams['*'], location.search]);

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

	useEffect(
		() =>
			addListenerAndCallImmediately(
				(_, v) => setAppTitle(v),
				undefined,
				`${STORE_PREFIX}.application.properties.title`,
			),
		[],
	);

	useEffect(() => {
		let title = appTitle ?? '';
		const titleProp =
			pageDefinition?.properties?.title ?? shellPageDefinition?.properties?.title;
		const pageExtractor = PageStoreExtractor.getForContextIfAvailable(pageDefinition?.name);

		const evaluatorMaps = new Map<string, TokenValueExtractor>([
			[storeExtractor.getPrefix(), storeExtractor],
			[localStoreExtractor.getPrefix(), localStoreExtractor],
		]);
		const tve: TokenValueExtractor[] = [];
		let returnFunction = undefined;
		if (pageExtractor) {
			tve.push(pageExtractor);
			evaluatorMaps.set(pageExtractor.getPrefix(), pageExtractor);
		}
		if (titleProp) {
			const paths = getPathsFrom(titleProp.name, evaluatorMaps);

			if (paths?.size) {
				returnFunction = addListener(
					() => {
						let title = appTitle ?? '';
						const titleValue = getData(titleProp.name, [], ...tve) ?? '';
						const appendValue = getData(titleProp.append, [], ...tve) ?? true;

						if (titleValue) {
							if (appendValue && title) title = `${title} - ${titleValue}`;
							else title = '' + titleValue;
						}

						if (title) {
							let tag = document.getElementsByTagName('title')?.[0];
							if (!tag) {
								tag = document.createElement('title');
								document.head.appendChild(tag);
							}

							tag.innerHTML = title;
						}
					},
					pageExtractor,
					...paths,
				);
			}

			const titleValue = getData(titleProp.name, [], ...tve) ?? '';
			const appendValue = getData(titleProp.append, [], ...tve) ?? true;

			if (titleValue) {
				if (appendValue && title) title = `${title} - ${titleValue}`;
				else title = '' + titleValue;
			}
		}

		if (title) {
			let tag = document.getElementsByTagName('title')?.[0];
			if (!tag) {
				tag = document.createElement('title');
				document.head.appendChild(tag);
			}

			tag.innerHTML = title;
		}

		const seo = pageDefinition?.properties?.seo ?? shellPageDefinition?.properties?.seo;

		if (!seo) return returnFunction;

		const metas = Array.from(document.getElementsByTagName('meta'));

		Object.entries(seo).forEach(e => {
			let value = getData(e[1] as ComponentProperty<string>, [], ...tve);
			if (!value) return;

			if (e[0] === 'charset') {
				let tag = metas.find(e => e.getAttribute('charset'));
				if (!tag) {
					tag = document.createElement('meta');
					document.head.appendChild(tag);
				}
				tag.setAttribute('charset', value);
			}

			let name = e[0];
			if (name === 'applicationName') name = 'application-name';
			let tag = metas.find(e => e.getAttribute('name') === name);
			if (!tag) {
				tag = document.createElement('meta');
				document.head.appendChild(tag);
				tag.setAttribute('name', name);
			}
			if (tag.getAttribute('content') !== value) tag.setAttribute('content', value);
		});

		return returnFunction;
	}, [
		appTitle,
		shellPageDefinition?.properties,
		pageDefinition?.properties,
		pageDefinition?.pageName,
	]);

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

	useEffect(() => {}, []);

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
