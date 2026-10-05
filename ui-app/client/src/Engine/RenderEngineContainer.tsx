import { isNullValue, TokenValueExtractor } from '@fincity/kirun-js';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getPathsFrom } from '../components/util/getPaths';
import { runEvent } from '../components/util/runEvent';
import { GLOBAL_CONTEXT_NAME, STORE_PREFIX } from '../constants';
import PageComponentDefinition from '../components/Page/Page';
import {
	addListener,
	addListenerAndCallImmediately,
	getData,
	getDataFromPath,
	localStoreExtractor,
	PageStoreExtractor,
	setData,
	storeExtractor,
	UrlDetailsExtractor,
} from '../context/StoreContext';
import { ComponentProperty, PageDefinition } from '../types/common';
import { ROOT_LOCATION_HISTORY } from '../components/Children';
import { processLocation } from '../util/locationProcessor';
import { processClassesForPageDefinition } from '../util/styleProcessor';
import getPageDefinition from './pageDefinition';
import { applyPageTheme, pageThemePending } from '../util/selectTheme';
import { resolvePageForLocation } from './pageRoute';
import { isLeavingForBeacon } from '../sso/ssoModule';

const POSITIONS: { [key: string]: boolean } = {
	center: true,
	end: true,
	nearest: true,
	start: true,
};

/**
 * Page SEO keys whose tag name is not simply the key.
 *
 * Open Graph and the `article` set are addressed by `property`; twitter's are
 * `name` like any other meta. Keys absent from here are emitted as
 * `name="<key>"`, which is what every plain meta wants.
 *
 * This has to agree with the SSR renderer's own mapping, or hydration writes a
 * second tag beside the server's instead of finding it.
 */
const SEO_TAG_NAMES: Record<string, string> = {
	applicationName: 'application-name',

	ogTitle: 'og:title',
	ogDescription: 'og:description',
	ogImage: 'og:image',
	ogImageAlt: 'og:image:alt',
	ogImageWidth: 'og:image:width',
	ogImageHeight: 'og:image:height',
	ogImageType: 'og:image:type',
	ogType: 'og:type',
	ogUrl: 'og:url',
	ogLocale: 'og:locale',
	ogDeterminer: 'og:determiner',
	ogSiteName: 'og:site_name',

	twitterCard: 'twitter:card',
	twitterSite: 'twitter:site',
	twitterCreator: 'twitter:creator',

	articlePublishedTime: 'article:published_time',
	articleModifiedTime: 'article:modified_time',
	articleAuthor: 'article:author',
	articleSection: 'article:section',
	articleTag: 'article:tag',
};

/** Which attribute a page SEO key is addressed by, and the value it carries. */
function seoTagFor(key: string): { attribute: 'name' | 'property'; tagName: string } {
	const tagName = SEO_TAG_NAMES[key] ?? key;
	const attribute = tagName.startsWith('og:') || tagName.startsWith('article:') ? 'property' : 'name';
	return { attribute, tagName };
}

export const RenderEngineContainer = () => {
	const location = useLocation();
	const pathParams = useParams();
	const [currentPageName, setCurrentPageName] = useState<string | undefined>();
	const [shellPageDefinition, setShellPageDefinition] = useState<PageDefinition>();
	const [pageDefinition, setPageDefinition] = useState<any>();
	const [consentPageDefinition, setConsentPageDefinition] = useState<PageDefinition>();
	const [askConsent, setAskConsent] = useState(false);
	const [appTitle, setAppTitle] = useState<string>('');

	const loadDefinition = useCallback(() => {
		const details = processLocation(window.location);
		// The default page when the URL names none. Routing is keyed by the page
		// that was ASKED for, so this has to be filled before the resolver runs --
		// and the store write has to come after it, so that both names travel
		// together. See below.
		UrlDetailsExtractor.fillDefaultPage(details);

		// `urlDetails.pageName` stays as the URL reads, because that is what it is
		// named for and what expressions on the page already read. The page that
		// renders is a separate question: routing may send this URL to a different
		// definition, and everything below -- the store namespace, the definition
		// lookup, the fetch -- keys off that answer rather than off the URL.
		const pageName = resolvePageForLocation(details);

		// Writes `Store.urlDetails`, which is what `Url.` reads, carrying BOTH
		// names. The served one used to be computed here and thrown away, which is
		// how analytics came to file every view and every click on a routed page
		// under the address rather than under the page: `AnalyticsBinder` reads
		// this store, and the only name in it was the one the URL asked for.
		//
		// One write, deliberately. Two would notify every listener twice and the
		// beacon would count the arrival twice.
		UrlDetailsExtractor.addDetails(details, pageName);

		// True only when routing sent this URL somewhere else. Everything below
		// that is conditional on it leaves the ordinary path exactly as it was.
		const routed = !!details.pageName && pageName !== details.pageName;

		let pDef = getDataFromPath(`${STORE_PREFIX}.pageDefinition.${pageName}`, []);
		if (!pDef) {
			(async () => {
				let name = pageName!;
				// A rule can name a page that has since been deleted. The SSR service
				// falls back to the URL's own name rather than serving nothing, and an
				// in-app navigation must not behave worse than an arrival.
				let definition = routed
					? await getPageDefinition(name).catch(() => undefined)
					: await getPageDefinition(name);

				if (routed && !definition) {
					console.error(
						'Page routing selected a page that could not be loaded, falling back to the requested page. Selected:',
						name,
						'Requested:',
						details.pageName,
					);
					name = details.pageName!;
					definition = await getPageDefinition(name);
				}

				// Nothing to render and nothing left to try. Returning leaves the view
				// as it was, which is what a rejected fetch did before; the difference
				// is that it now says so. Falling through would store `undefined` and
				// fail the app-code check below, which reloads — and on a page that is
				// simply missing, reloads forever.
				if (!definition) return;

				setData(`Store.pageDefinition.${name}`, definition);
				pDef = getDataFromPath(`${STORE_PREFIX}.pageDefinition.${name}`, []);
				const appCode = getDataFromPath(`${STORE_PREFIX}.application.appCode`, []);
				// A beacon hop is already committed and this page is on its way out, so a
				// reload here would abort it. `UIEngine.Login` deliberately clears
				// `Store.application` on success, which leaves `appCode` undefined and makes
				// the mismatch below look real when nothing is wrong: the reload then killed
				// the seed navigation and the shared session was silently never established.
				// Observed as `Host app code: undefined Page app code: modlix` immediately
				// followed by `net::ERR_ABORTED` on the beacon request.
				if (appCode !== pDef?.appCode && !isLeavingForBeacon()) {
					console.error(
						"Trying to load a page that doesn't belong to the app. Host app code:",
						appCode,
						'Page app code:',
						pDef.appCode,
					);
					window.location.reload();
					return;
				}
				setPageDefinition(processClassesForPageDefinition(pDef));
				setCurrentPageName(name);
			})();
		} else {
			setPageDefinition(processClassesForPageDefinition(pDef));
			setCurrentPageName(pageName);
		}
	}, [location, location.pathname, location.search, location.hash]);

	useEffect(() => {
		loadDefinition();
	}, [pathParams['*'], location.search]);

	useEffect(() => {
		if (!location.hash) return;
		let handle: ReturnType<typeof setInterval> | undefined = undefined;
		handle = setInterval(() => {
			const [id, block, inline] = location.hash.replace('#', '').split(':');
			const element = document.getElementById(id);
			if (!element) return;
			let options: ScrollIntoViewOptions = { block: 'start' };
			if (block && POSITIONS[block])
				options = { ...options, block: block as ScrollLogicalPosition };
			if (inline && POSITIONS[inline])
				options = { ...options, inline: inline as ScrollLogicalPosition };
			element.scrollIntoView(options);
			setTimeout(() => {
				let position = { top: 0, left: 0 };
				if (block && !POSITIONS[block]) position = { ...position, top: parseInt(block) };
				if (inline && !POSITIONS[inline])
					position = { ...position, left: parseInt(inline) };
				let pElement: HTMLElement | null = element;
				while (
					pElement &&
					pElement.parentElement?.scrollHeight === pElement.parentElement?.clientHeight
				)
					pElement = pElement.parentElement;
				window.requestAnimationFrame(() => {
					if (position.top || position.left) pElement?.parentElement?.scrollBy(position);
				});
			}, 1000);
			clearInterval(handle);
			handle = undefined;
		}, 100);
		return () => {
			if (handle) clearInterval(handle);
		};
	}, [location?.hash]);

	useEffect(() => {
		return addListener(
			undefined,
			() => {
				setPageDefinition(undefined);
				setCurrentPageName(undefined);
				loadDefinition();
			},
			'Store.pageDefinition',
		);
	}, []);

	useEffect(
		() =>
			addListenerAndCallImmediately(
				undefined,
				async (_, value) => {
					const sd = processClassesForPageDefinition(value);
					setShellPageDefinition(sd);
					if (isNullValue(value)) return;
					const { properties: { onLoadEvent = undefined } = {}, eventFunctions } = value;
					if (isNullValue(onLoadEvent) || isNullValue(eventFunctions[onLoadEvent]))
						return;
					await runEvent(
						eventFunctions[onLoadEvent],
						'appOnLoad',
						GLOBAL_CONTEXT_NAME,
						[],
						sd,
					);
				},
				`${STORE_PREFIX}.application.properties.shellPageDefinition`,
			),
		[],
	);

	useEffect(
		() =>
			addListenerAndCallImmediately(
				undefined,
				(_, v) => setAppTitle(v),
				`${STORE_PREFIX}.application.properties.title`,
			),
		[],
	);

	// The consent page is inlined into the application document by the server
	// the same way the shell page is, so it costs no extra round trip and is
	// available on the very first paint of every page — including the marketing
	// pages that opt out of the shell with `wrapShell: false`.
	//
	// `Store.application` is re-emitted during a page's life (auth resolving is
	// the common one). Handing `Page` a fresh definition object each time
	// remounts the consent page and takes its page store with it, which blanks
	// a consent box the visitor was part way through. So a re-emit of the same
	// version is ignored rather than passed through.
	useEffect(
		() =>
			addListenerAndCallImmediately(
				undefined,
				(_, value) =>
					setConsentPageDefinition(existing => {
						if (isNullValue(value)) return undefined;
						if (
							existing &&
							existing.name === value.name &&
							existing.version === value.version
						)
							return existing;
						return processClassesForPageDefinition(value);
					}),
				`${STORE_PREFIX}.application.properties.consentPageDefinition`,
			),
		[],
	);

	useEffect(
		() =>
			addListenerAndCallImmediately(
				undefined,
				(_, state) =>
					setAskConsent(!!state?.enabled && !!state?.required && !state?.decided),
				`${STORE_PREFIX}.analyticsConsent`,
			),
		[],
	);

	// `Page` runs its own onLoad only when `Store.urlDetails.pageName` matches
	// its context, which is never true for a page rendered as an overlay. The
	// shell page has the same problem and is handled the same way: run the
	// onLoad here, in the consent page's own store scope, so `Page.showBar` and
	// the preference toggles are seeded before anything is bound to them.
	useEffect(() => {
		if (!askConsent || !consentPageDefinition) return;

		const {
			name,
			eventFunctions = {},
			properties: { onLoadEvent = undefined } = {},
		} = consentPageDefinition;
		if (isNullValue(onLoadEvent) || isNullValue(eventFunctions[onLoadEvent!])) return;

		runEvent(eventFunctions[onLoadEvent!], 'consentOnLoad', name, [], consentPageDefinition);
		// Keyed on the definition object, not its name: if it ever is replaced,
		// the page store went with it and the box has to be seeded again.
	}, [askConsent, consentPageDefinition]);

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
					pageExtractor?.getPageName() ?? undefined,
					() => {
						let title = appTitle ?? '';
						const titleValue = getData(titleProp.name, [], ...tve) ?? '';
						const appendValue = '' + (getData(titleProp.append, [], ...tve) ?? true);

						if (titleValue) {
							if (appendValue === 'true' && title) title = `${title} - ${titleValue}`;
							else if (appendValue === 'prepend' && title)
								title = `${titleValue} - ${title}`;
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
					...Array.from(paths),
				);
			}

			const titleValue = getData(titleProp.name, [], ...tve) ?? '';
			const appendValue = '' + (getData(titleProp.append, [], ...tve) ?? true);

			if (titleValue) {
				if (appendValue === 'true' && title) title = `${title} - ${titleValue}`;
				else if (appendValue === 'prepend' && title) title = `${titleValue} - ${title}`;
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

		Object.entries(seo).forEach(e => {
			const value = getData(e[1] as ComponentProperty<string>, [], ...tve);
			if (!value) return;

			const key = e[0];

			if (key === 'charset') {
				// The element is found by the attribute it carries, and a charset
				// meta has no name. Returning here matters: without it this key
				// fell through and also produced a meaningless
				// `<meta name="charset" content="utf-8">` beside the real one.
				let tag = document.head.querySelector('meta[charset]');
				if (!tag) {
					tag = document.createElement('meta');
					document.head.appendChild(tag);
				}
				tag.setAttribute('charset', value);
				return;
			}

			// Open Graph is addressed by `property`, not `name`. Emitting
			// `<meta name="ogTitle">` says nothing to any consumer, and because
			// the lookup below matches on `name` it could never find the
			// `property=`-keyed tag SSR had already written -- so every og key on
			// a page produced a second, useless tag beside the correct one.
			const { attribute, tagName } = seoTagFor(key);

			// Queried per key rather than from one snapshot taken before the
			// loop: a tag this loop creates has to be visible to later
			// iterations, or two keys mapping to one tag each append their own.
			const selector = `meta[${attribute}="${CSS.escape(tagName)}"]`;
			let tag = document.head.querySelector(selector);
			if (!tag) {
				tag = document.createElement('meta');
				tag.setAttribute(attribute, tagName);
				document.head.appendChild(tag);
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
				shellPageDefinition,
			))();
	}, [shellPageDefinition?.properties?.onLoadEvent]);

	const [, setLastChanged] = useState(Date.now());

	useEffect(
		() => window.addDesignModeChangeListener(() => setLastChanged(Date.now())),
		[setLastChanged],
	);

	useEffect(() => {
		if (
			globalThis.designMode !== 'PAGE' &&
			globalThis.designMode !== 'FILLER_VALUE_EDITOR' &&
			globalThis.designMode !== 'THEME_EDITOR'
		)
			return;

		function onMessageRecieved(e: MessageEvent) {
			const { data: { type } = { type: undefined } } = e ?? {};

			if (!type || !type.startsWith('EDITOR_')) return;
			setLastChanged(Date.now());
		}

		window.addEventListener('message', onMessageRecieved);
		return () => window.removeEventListener('message', onMessageRecieved);
	}, [globalThis.designMode, setLastChanged]);

	useEffect(() => {
		if (
			globalThis.designMode !== 'PAGE' &&
			globalThis.designMode !== 'FILLER_VALUE_EDITOR' &&
			globalThis.designMode !== 'THEME_EDITOR'
		)
			return;

		return addListenerAndCallImmediately(
			undefined,
			(_, v) => setPageDefinition(processClassesForPageDefinition(v)),
			`${STORE_PREFIX}.pageDefinition.${currentPageName}`,
		);
	}, [globalThis.designMode, currentPageName]);

	// `properties.theme`: a page may wear a theme of its own (the marketing pages of
	// an app whose product pages follow the visitor's choice). Leaving such a page
	// puts the visitor's theme back. Neither is remembered.
	const [, setPageThemeApplied] = useState(0);
	const pageTheme = pageDefinition?.properties?.theme;
	useEffect(() => {
		if (!pageDefinition || globalThis.designMode === 'THEME_EDITOR') return;
		let live = true;
		applyPageTheme(pageDefinition).then(() => live && setPageThemeApplied(n => n + 1));
		return () => {
			live = false;
		};
	}, [pageDefinition?.name, pageTheme]);

	if (isNullValue(pageDefinition)) return <></>;

	// A page that names its own theme waits for it rather than painting a frame in
	// the visitor's theme first. The theme editor is left alone: it shows the theme
	// being edited, whatever the page asks for.
	if (globalThis.designMode !== 'THEME_EDITOR' && pageThemePending(pageDefinition)) return <></>;

	const Page = PageComponentDefinition.component;

	// Rendered alongside whichever page is showing, never inside it, so the box
	// survives navigation between pages and is not affected by a page opting
	// out of the shell. It is suppressed in the editor, where it would sit on
	// top of the canvas being edited.
	const consentOverlay =
		askConsent && consentPageDefinition && !globalThis.designMode ? (
			<Page
				locationHistory={ROOT_LOCATION_HISTORY}
				pageDefinition={consentPageDefinition}
				context={{
					pageName: consentPageDefinition.name,
					shellPageName: shellPageDefinition?.name,
					level: 0,
				}}
			/>
		) : null;

	if (currentPageName && pageDefinition) {
		const { properties: { wrapShell = true } = {} } = pageDefinition;

		if (
			wrapShell &&
			shellPageDefinition &&
			(globalThis.designMode !== 'PAGE' ||
				!globalThis.pageEditor?.personalization?.slave?.noShell)
		)
			return (
				<>
					<Page
						locationHistory={ROOT_LOCATION_HISTORY}
						pageDefinition={shellPageDefinition}
						context={{
							pageName: GLOBAL_CONTEXT_NAME,
							shellPageName: shellPageDefinition?.name,
							level: 0,
						}}
					/>
					{consentOverlay}
				</>
			);

		return (
			<>
				<Page
					locationHistory={ROOT_LOCATION_HISTORY}
					pageDefinition={pageDefinition}
					context={{
						pageName: currentPageName,
						shellPageName: shellPageDefinition?.name,
						level: 0,
					}}
				/>
				{consentOverlay}
			</>
		);
	} else if (pageDefinition) {
		const definitions = getDataFromPath(`${STORE_PREFIX}.pageDefinition`, []) ?? {};
		const hasDefinitions = !!Object.keys(definitions).length;
		if (!hasDefinitions) return <></>;

		return (
			<>
				<Page
					locationHistory={ROOT_LOCATION_HISTORY}
					pageDefinition={shellPageDefinition}
					context={{
						pageName: GLOBAL_CONTEXT_NAME,
						shellPageName: shellPageDefinition?.name,
						level: 0,
					}}
				/>
				{consentOverlay}
			</>
		);
	} else {
		//TODO: Need to throw an error that there is not page definition found.
		return <></>;
	}
};
