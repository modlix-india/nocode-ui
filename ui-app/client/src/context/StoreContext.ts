import { duplicate, isNullValue, TokenValueExtractor } from '@fincity/kirun-js';
import { setStoreData, useStore } from '@fincity/path-reactive-state-management';
import {
	LOCAL_STORE_PREFIX,
	PAGE_STORE_PREFIX,
	SAMPLE_STORE_PREFIX,
	STORE_PREFIX,
} from '../constants';
import { messageToMaster } from '../slaveFunctions';
import { ComponentProperty, DataLocation, LocationHistory } from '../types/common';
import { URLDetails } from '../util/locationProcessor';
import { AuthoritiesExtractor } from './AuthoritiesExtractor';
import { FillerExtractor } from './FillerExtractor';
import { LocalStoreExtractor } from './LocalStoreExtractor';
import { ParentExtractorForRunEvent } from './ParentExtractor';
import { sample } from './sampleData';
import { SpecialTokenValueExtractor } from './SpecialTokenValueExtractor';
import { ThemeExtractor } from './ThemeExtractor';
import { normalizePath } from '../components/util/getPaths';

export class StoreExtractor extends SpecialTokenValueExtractor {
	private readonly store: any;
	private readonly prefix: string;

	constructor(store: any, prefix: string) {
		super();
		this.store = store;
		this.prefix = prefix;
	}

	protected getValueInternal(token: string) {
		const parts: string[] = TokenValueExtractor.splitPath(token);
		return this.retrieveElementFrom(token, parts, 1, this.store);
	}

	getPrefix(): string {
		return this.prefix;
	}

	public getStore(): any {
		return this.store;
	}
}

let localStore: any = {};
if (typeof window !== 'undefined') {
	localStore = window.localStorage;
}
export const localStoreExtractor = new LocalStoreExtractor(localStore, `${LOCAL_STORE_PREFIX}.`);
export const themeExtractor = new ThemeExtractor();
export const authoritiesExtractor = new AuthoritiesExtractor();
export const fillerExtractor = new FillerExtractor();

let pathName = window.location?.pathname;
let urlAppCode = undefined;
let urlClientCode = undefined;

let index = pathName?.indexOf('/page');

if (index != undefined && index != -1) {
	pathName = pathName.substring(0, index);
	const parts = pathName.split('/');
	if (parts.length > 1) {
		urlAppCode = parts[1];
	}
	if (parts.length > 2) {
		urlClientCode = parts[2];
	}
}

let storeInitialObject: any = { url: { appCode: urlAppCode, clientCode: urlClientCode } };
if (globalThis.appDefinitionResponse)
	storeInitialObject = { ...storeInitialObject, ...globalThis.appDefinitionResponse };
if (globalThis.pageDefinitionResponse)
	storeInitialObject.pageDefinition = {
		[globalThis.pageDefinitionRequestPageName]: globalThis.pageDefinitionResponse,
	};

const {
	getData: _getData,
	setData: _setData,
	store: _store,
	addListener: _addListener,
	addListenerAndCallImmediately: _addListenerAndCallImmediately,
	addListenerWithChildrenActivity: _addListenerWithChildrenActivity,
	addListenerAndCallImmediatelyWithChildrenActivity:
		_addListenerAndCallImmediatelyWithChildrenActivity,
} = useStore(
	storeInitialObject,
	STORE_PREFIX,
	localStoreExtractor,
	themeExtractor,
	authoritiesExtractor,
	fillerExtractor,
	new StoreExtractor(sample, `${SAMPLE_STORE_PREFIX}.`),
);

themeExtractor.setStore(_store);
authoritiesExtractor.setStore(_store);
fillerExtractor.setStore(_store);

globalThis.getStore = () => duplicate(_store);

export const storeExtractor = new StoreExtractor(_store, `${STORE_PREFIX}.`);

export function getData<T>(
	prop: ComponentProperty<T> | undefined,
	locationHistory: Array<LocationHistory>,
	...tve: Array<TokenValueExtractor>
): T | undefined {
	if (!prop) return undefined;
	if (globalThis.isDesignMode && !isNullValue(prop.overrideValue)) {
		return prop.overrideValue!;
	}
	let value: T | undefined;
	if (prop.location) {
		value = getDataFromLocation(prop.location, locationHistory, ...tve);
	}
	if (!isNullValue(value)) return value;
	return prop.value;
}

export function getDataFromLocation(
	loc: DataLocation,
	locationHistory: Array<LocationHistory>,
	...tve: Array<TokenValueExtractor>
): any {
	if (locationHistory?.length)
		tve = [
			...tve,
			new ParentExtractorForRunEvent(
				locationHistory,
				new Map(tve.map(e => [e.getPrefix(), e])),
			),
		];
	if (loc?.type === 'VALUE' && loc.value) {
		return _getData(loc.value || '', ...tve);
	} else if (loc?.type === 'EXPRESSION' && loc.expression) {
		return _getData(loc.expression || '', ...tve);
	}
}

export function getPathFromLocation(
	loc: DataLocation,
	locationHistory: Array<LocationHistory>,
	...tve: Array<TokenValueExtractor>
): string {
	const pe = locationHistory.length
		? new ParentExtractorForRunEvent(locationHistory, new Map(tve.map(e => [e.getPrefix(), e])))
		: undefined;

	let path = '';
	if (loc?.type === 'VALUE' && loc.value) {
		path = loc.value || '';
	} else if (loc?.type === 'EXPRESSION' && loc.expression) {
		const data = pe
			? getDataFromLocation(loc, locationHistory, ...tve, pe)
			: getDataFromLocation(loc, locationHistory, ...tve);
		path = data ?? '';
	}

	return pe ? pe.computeParentPath(path) : path;
}

export function getDataFromPath(
	path: string | undefined,
	locationHistory: Array<LocationHistory>,
	...tve: Array<TokenValueExtractor>
) {
	if (!path) return undefined;
	if (locationHistory?.length && !tve?.some(e => e.getPrefix() === 'Parent.'))
		tve = [
			...tve,
			new ParentExtractorForRunEvent(
				locationHistory,
				new Map(tve.map(e => [e.getPrefix(), e])),
			),
		];
	return _getData(path, ...tve);
}

export const innerSetData = _setData;

// The editor mirrors the running page's store to drive binding-path autocomplete.
// Previously the ENTIRE store was structured-cloned and posted to the master on every
// single setData, which flooded the editor and drove it to crash. Trailing-debounce it:
// the master only needs the latest snapshot, not one per mutation.
let slaveStoreTimer: ReturnType<typeof setTimeout> | undefined;
const SLAVE_STORE_DEBOUNCE_MS = 400;
function scheduleSlaveStoreBroadcast() {
	if (slaveStoreTimer) return;
	slaveStoreTimer = setTimeout(() => {
		slaveStoreTimer = undefined;
		messageToMaster({ type: 'SLAVE_STORE', payload: _store });
	}, SLAVE_STORE_DEBOUNCE_MS);
}

export function setData(path: string, value: any, context?: string, deleteKey?: boolean) {

	if (path.endsWith('.')) path = path.substring(0, path.length - 1);

	path = normalizePath(path);

	if (path.startsWith('SampleDataStore.') || path.startsWith('Filler.')) {
		// Sample store is not editable so we are not changing the data
		return;
	}

	if (path.startsWith(PAGE_STORE_PREFIX) && context) {
		_setData(
			`Store.pageData.${context}.${path.substring(PAGE_STORE_PREFIX.length + 1)}`,
			value,
			deleteKey,
		);
	} else if (path.startsWith(STORE_PREFIX)) {
		if (
			globalThis.isDesignMode &&
			globalThis.designMode === 'PAGE' &&
			globalThis.pageEditor?.editingPageDefinition?.name &&
			path ===
				`${STORE_PREFIX}.pageDefinition.${globalThis.pageEditor.editingPageDefinition.name}`
		) {
			_setData(
				path,
				globalThis.pageEditor.editingPageDefinition.name !== value.name
					? value
					: globalThis.pageEditor.editingPageDefinition,
			);
		} else _setData(path, value, deleteKey);
	} else if (path.startsWith(LOCAL_STORE_PREFIX)) {
		let parts = TokenValueExtractor.splitPath(path);

		const key = globalThis.isDesignMode ? 'designMode_' + parts[1] : parts[1];
		parts = parts.slice(2);
		let store;
		store = localStore.getItem(key);

		if (!parts.length) {
			if (isNullValue(value)) localStore.removeItem(key);
			else localStore.setItem(key, JSON.stringify(value));
			return;
		}
		if (!store && parts.length) {
			store = {};
		}
		if (store && parts.length) {
			try {
				if (typeof store === 'string') store = JSON.parse(store);
				setStoreData(
					`${LOCAL_STORE_PREFIX}.${parts.join('.')}`,
					store,
					value,
					LOCAL_STORE_PREFIX,
					new Map([[LOCAL_STORE_PREFIX, localStoreExtractor]]),
					deleteKey,
				);
				if (isNullValue(store)) localStore.removeItem(key);
				else localStore.setItem(key, JSON.stringify(store));
			} catch (error) {
				localStore.setItem(key, value);
			}
		}
	} else {
		console.error('Invalid path to store data : ', path);
	}

	if (globalThis.designMode !== 'PAGE') return;

	scheduleSlaveStoreBroadcast();
}

export class PageStoreExtractor extends SpecialTokenValueExtractor {
	private readonly pageName: string;
	private readonly myStore: any;

	static readonly extractorMap: Map<string, PageStoreExtractor> = new Map();

	constructor(pageName: string, myStore: any = _store) {
		super();
		this.pageName = pageName;
		this.myStore = myStore;
	}

	protected getValueInternal(token: string) {
		const parts: string[] = TokenValueExtractor.splitPath(token);
		return this.retrieveElementFrom(
			token,
			['pageData', this.pageName, ...parts.slice(1)],
			0,
			this.myStore,
		);
	}

	getPrefix(): string {
		return 'Page.';
	}

	public static getForContext(pageName: string): PageStoreExtractor {
		if (this.extractorMap.has(pageName)) return this.extractorMap.get(pageName)!;

		this.extractorMap.set(pageName, new PageStoreExtractor(pageName));

		return this.extractorMap.get(pageName)!;
	}

	public static getForContextIfAvailable(
		pageName: string | undefined,
	): PageStoreExtractor | undefined {
		if (isNullValue(pageName)) return undefined;

		return PageStoreExtractor.getForContext(pageName!);
	}

	public getPageName(): string {
		return this.pageName;
	}

	public getStore(): any {
		return this.retrieveElementFrom(
			`Store.pageData.${this.pageName}`,
			['pageData', this.pageName],
			0,
			_store,
		);
	}
}

/**
 * `Url.` -- what the browser's address bar says, readable from anywhere on the
 * page.
 *
 * There is one URL, so there is one copy of it, `Store.urlDetails`, and every
 * context reads that. `Url.` used to resolve per context, into
 * `Store.urlData.<context>`, which cannot work: the context is the page being
 * rendered, and that is not the page the URL names whenever the URL names none
 * (the default page), whenever routing resolves a URL to a different page, and
 * for every shell (`_global`) and subpage. Those contexts read an empty object.
 *
 * `Store.urlData.<page>` is still written, because pages bind to it by absolute
 * path -- and to another page's entry at that, which is how a dashboard hands a
 * filter to the list it drills into. So it keeps what it always kept: one entry
 * per page the URL has named, each left alone until that page is the URL again.
 */
export class UrlDetailsExtractor extends SpecialTokenValueExtractor {

	private readonly myStore: any;

	constructor(myStore: any = _store) {
		super();
		this.myStore = myStore;
	}

	protected getValueInternal(token: string) {
		const parts: string[] = TokenValueExtractor.splitPath(token);
		return this.retrieveElementFrom(token, ['urlDetails', ...parts.slice(1)], 0, this.myStore);
	}

	getPrefix(): string {
		return 'Url.';
	}

	public getStore(): any {
		return this.retrieveElementFrom(`${STORE_PREFIX}.urlDetails`, ['urlDetails'], 0, _store);
	}

	/**
	 * A URL that names no page means the app's default page.
	 *
	 * Split out of `addDetails` because page ROUTING has to run against a filled-in
	 * name — its rules are keyed by the page that was asked for — and its answer
	 * has to reach the same store write. Filling this afterwards is what once
	 * stored the default page's details under `undefined`.
	 */
	public static fillDefaultPage(details: URLDetails) {
		if (!details.pageName)
			details.pageName = getDataFromPath(
				`${STORE_PREFIX}.application.properties.defaultPage`,
				[],
			);
	}

	/**
	 * The URL showing now, which replaces the one before it.
	 *
	 * `servedPageName` is the page routing actually chose, which is NOT
	 * `pageName`: `pageName` is what the URL asked for, every expression on every
	 * page reads it, and it must keep meaning that. They differ exactly when a
	 * routing rule fired, and telling them apart is the difference between
	 * analytics filing a view under the address and filing it under the page.
	 *
	 * Both land in ONE write. Two writes would notify every `Store.urlDetails`
	 * listener twice, and one of those listeners reports page views.
	 */
	public static addDetails(details: URLDetails, servedPageName?: string) {
		UrlDetailsExtractor.fillDefaultPage(details);
		if (servedPageName) details.servedPageName = servedPageName;

		setData(`${STORE_PREFIX}.urlDetails`, details, undefined, true);

		// Only this page's entry. Writing the others would put the URL showing now
		// under the name of a page that is not showing, and the pages that read
		// across entries are reading for a page they have navigated away from.
		if (details.pageName)
			setData(`${STORE_PREFIX}.urlData.${details.pageName}`, { ...details }, undefined, true);
	}

	/**
	 * The context is accepted and ignored: it decides which page store `Page.`
	 * reads, and the URL is not per page. Kept so that callers can go on pairing
	 * this with `PageStoreExtractor.getForContext`.
	 */
	public static getForContext(_pageName?: string): UrlDetailsExtractor {
		return urlDetailsExtractor;
	}

	public getPageName(): string {
		return getDataFromPath(`${STORE_PREFIX}.urlDetails.pageName`, []);
	}
}

export const urlDetailsExtractor = new UrlDetailsExtractor();

const pathTransformer = (e: string, pageName: string | undefined) => {
	if (pageName && e.startsWith('Page.'))
		return 'Store.pageData.' + pageName + e.substring(4);
	else if (e.startsWith('Url.')) return 'Store.urlDetails' + e.substring(3);
	if (e.startsWith(fillerExtractor.getPrefix()))
		return 'Store.application.properties.fillerValues.' + e.substring(7);
	return e;
};

export const addListener = (
	pageName: string | undefined,
	callback: (path: string, value: any) => void,
	...path: Array<string>
): (() => void) => {
	return _addListener(callback, ...path.map(e => pathTransformer(e, pageName)));
};

export const addListenerAndCallImmediately = (
	pageName: string | undefined,
	callback: (path: string, value: any) => void,
	...path: Array<string>
): (() => void) => {
	return _addListenerAndCallImmediately(
		true,
		callback,
		...path.map(e => pathTransformer(e, pageName)),
	);
};

export const addListenerWithChildrenActivity = (
	pageName: string | undefined,
	callback: (path: string, value: any) => void,
	...path: Array<string>
): (() => void) => {
	return _addListenerWithChildrenActivity(
		callback,
		...path.map(e => pathTransformer(e, pageName)),
	);
};

export const addListenerAndCallImmediatelyWithChildrenActivity = (
	pageName: string | undefined,
	callback: (path: string, value: any) => void,
	...path: Array<string>
): (() => void) => {
	return _addListenerAndCallImmediatelyWithChildrenActivity(
		true,
		callback,
		...path.map(e => pathTransformer(e, pageName)),
	);
};

export const store = _store;
