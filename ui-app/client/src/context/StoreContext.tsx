import { useStore, setStoreData } from '@fincity/path-reactive-state-management';
import { LOCAL_STORE_PREFIX, STORE_PREFIX, PAGE_STORE_PREFIX } from '../constants';
import { isNullValue, TokenValueExtractor } from '@fincity/kirun-js';
import { ComponentProperty, DataLocation, LocationHistory, RenderContext } from '../types/common';

class LocalStoreExtractor extends TokenValueExtractor {
	private store: any;
	private prefix: string;
	constructor(store: any, prefix: string) {
		super();
		this.store = store;
		this.prefix = prefix;
	}
	protected getValueInternal(token: string) {
		const parts: string[] = token.split(TokenValueExtractor.REGEX_DOT);
		// Add isSlave_ as prefix for preview mode
		let localStorageValue = this.store.getItem(parts[1]);
		if (!localStorageValue) return localStorageValue;
		try {
			localStorageValue = JSON.parse(localStorageValue);
			return this.retrieveElementFrom(token, parts, 2, localStorageValue);
		} catch (error) {
			return localStorageValue;
		}
	}
	getPrefix(): string {
		return this.prefix;
	}
}
export class StoreExtractor extends TokenValueExtractor {
	private store: any;
	private prefix: string;
	constructor(store: any, prefix: string) {
		super();
		this.store = store;
		this.prefix = prefix;
	}
	protected getValueInternal(token: string) {
		const parts: string[] = token.split(TokenValueExtractor.REGEX_DOT);
		return this.retrieveElementFrom(token, parts, 1, this.store);
	}
	getPrefix(): string {
		return this.prefix;
	}
}
let localStore: any = {};
if (typeof window !== 'undefined') {
	localStore = window.localStorage;
}
export const localStoreExtractor = new LocalStoreExtractor(localStore, `${LOCAL_STORE_PREFIX}.`);
const {
	getData: _getData,
	setData: _setData,
	addListener: _addListener,
	store: _store,
	addListenerAndCallImmediately: _addListenerAndCallImmediately,
} = useStore({}, STORE_PREFIX, localStoreExtractor);

export const storeExtractor = new StoreExtractor(_store, `${STORE_PREFIX}.`);

export const dotPathBuilder = (path: string, locationHistory: Array<LocationHistory>) => {
	if (!path.startsWith('.')) return path;

	let dotsLength = 0;
	for (let i = 0; i < path.length && path[i] === '.'; i++) {
		dotsLength++;
	}
	const pickedlocationHistory = locationHistory[locationHistory.length - dotsLength].location;

	if (!pickedlocationHistory) return path;
	let finalPath = '';
	if (typeof pickedlocationHistory === 'string')
		finalPath = `${pickedlocationHistory}.${path.substring(dotsLength)}`;
	else {
		if (pickedlocationHistory?.type === 'VALUE') {
			finalPath = `${pickedlocationHistory.value}.${path.substring(dotsLength)}`;
		}
		if (pickedlocationHistory?.type === 'EXPRESSION') {
			finalPath = `${pickedlocationHistory.expression}.${path.substring(dotsLength)}`;
		}
	}
	return finalPath;
};

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
	if (loc?.type === 'VALUE' && loc.value) {
		return _getData(dotPathBuilder(loc.value, locationHistory) || '', ...tve);
	} else if (loc?.type === 'EXPRESSION' && loc.expression) {
		return _getData(dotPathBuilder(loc?.expression!, locationHistory) || '', ...tve);
	}
}

export function getPathFromLocation(
	loc: DataLocation,
	locationHistory: Array<LocationHistory>,
	...tve: Array<TokenValueExtractor>
): string {
	if (loc?.type === 'VALUE' && loc.value) {
		return dotPathBuilder(loc.value, locationHistory) || '';
	} else if (loc?.type === 'EXPRESSION' && loc.expression) {
		return (
			dotPathBuilder(getDataFromLocation(loc, locationHistory, ...tve), locationHistory) || ''
		);
	}
	return '';
}

export function getDataFromPath(path: string | undefined, locationHistory: Array<LocationHistory>) {
	if (!path) return undefined;
	return _getData(dotPathBuilder(path, locationHistory));
}

export function setData(path: string, value: any, context?: string, deleteKey?: boolean) {
	if (path.startsWith(LOCAL_STORE_PREFIX)) {
		if (!value) return;
		let parts = path.split(TokenValueExtractor.REGEX_DOT);
		// Add isSlave_ as prefix for preview mode
		const key = parts[1];
		parts = parts.slice(2);
		let store;
		store = localStore.getItem(key);

		if (!store && !parts.length) {
			localStore.setItem(key, value);
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
				localStore.setItem(key, JSON.stringify(store));
			} catch (error) {
				localStore.setItem(key, value);
			}
		}
	} else if (path.startsWith(PAGE_STORE_PREFIX) && context) {
		_setData(
			`Store.pageData.${context}.${path.substring(PAGE_STORE_PREFIX.length + 1)}`,
			value,
			deleteKey,
		);
	} else _setData(path, value, deleteKey);

	console.log(path, value, JSON.parse(JSON.stringify(_store)));
}

export class PageStoreExtractor extends TokenValueExtractor {
	private pageName: string;

	static readonly extractorMap: Map<string, PageStoreExtractor> = new Map();

	constructor(pageName: string) {
		super();
		this.pageName = pageName;
	}

	protected getValueInternal(token: string) {
		const parts: string[] = token.split(TokenValueExtractor.REGEX_DOT);
		return this.retrieveElementFrom(
			token,
			['pageData', this.pageName, ...parts.slice(1)],
			0,
			_store,
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

	public getPageName(): string {
		return this.pageName;
	}
}

export const addListener = (
	callback: (path: string, value: any) => void,
	pageExtractor?: PageStoreExtractor,
	...path: Array<string>
): (() => void) => {
	if (!pageExtractor) return _addListener(callback, ...path);
	const nPaths = path.map(e => {
		if (!e.startsWith(pageExtractor.getPrefix())) return e;
		return 'Store.pageData.' + pageExtractor.getPageName() + e.substring(4);
	});

	return _addListener(callback, ...nPaths);
};

export const addListenerAndCallImmediately = (
	callback: (path: string, value: any) => void,
	pageExtractor?: PageStoreExtractor,
	...path: Array<string>
): (() => void) => {
	if (!pageExtractor) return _addListenerAndCallImmediately(true, callback, ...path);
	const nPaths = path.map(e => {
		if (!e.startsWith(pageExtractor.getPrefix())) return e;
		return 'Store.pageData.' + pageExtractor.getPageName() + e.substring(4);
	});

	return _addListenerAndCallImmediately(true, callback, ...nPaths);
};

export const store = _store;
