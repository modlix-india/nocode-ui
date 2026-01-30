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

	messageToMaster({ type: 'SLAVE_STORE', payload: _store });
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

export class UrlDetailsExtractor extends SpecialTokenValueExtractor {

	public static readonly extractorMap: Map<string, UrlDetailsExtractor> = new Map();
	private details: URLDetails;
	private readonly myStore: any;

	constructor(details: URLDetails, myStore: any = _store) {
		super();
		this.details = details;
		this.myStore = myStore;
		this.setDetails(details);
	}

	public setDetails(details: URLDetails) {
		this.details = details;
		if (!details.pageName) {
			details.pageName = getDataFromPath(`${STORE_PREFIX}.application.properties.defaultPage`, []);
		}
		setData(`Store.urlData.${details.pageName!}`, details, undefined, true);
	}

	protected getValueInternal(token: string) {
		const parts: string[] = TokenValueExtractor.splitPath(token);
		return this.retrieveElementFrom(
			token,
			['urlData', this.details.pageName!, ...parts.slice(1)],
			0,
			this.myStore,
		);
	}

	getPrefix(): string {
		return 'Url.';
	}
	
	public getStore(): any {
		return this.retrieveElementFrom(
			`Store.urlData.${this.details.pageName!}`,
			['urlData', this.details.pageName!],
			0,
			_store,
		);
	}

	public static addDetails(details: URLDetails) {
		if (UrlDetailsExtractor.extractorMap.has(details.pageName!)) {
			UrlDetailsExtractor.extractorMap.get(details.pageName!)!.setDetails(details);
			return;
		}
		UrlDetailsExtractor.extractorMap.set(details.pageName!, new UrlDetailsExtractor(details));
	}

	public static getForContext(pageName: string): UrlDetailsExtractor {
		if (UrlDetailsExtractor.extractorMap.has(pageName)) return UrlDetailsExtractor.extractorMap.get(pageName)!;
		UrlDetailsExtractor.extractorMap.set(pageName, new UrlDetailsExtractor({ pageName, queryParameters: {}}));
		return UrlDetailsExtractor.extractorMap.get(pageName)!;
	}

	public getPageName(): string {
		return this.details.pageName!;
	}
}

const pathTransformer = (e: string, pageName: string | undefined) => {
	if (pageName && e.startsWith('Page.'))
		return 'Store.pageData.' + pageName + e.substring(4);
	else if (pageName && e.startsWith('Url.'))
		return 'Store.urlData.' + pageName + e.substring(3);
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
