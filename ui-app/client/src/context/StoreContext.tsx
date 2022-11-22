import { useStore, setStoreData } from '@fincity/path-reactive-state-management';
import { LOCAL_STORE_PREFIX, STORE_PREFIX, PAGE_STORE_PREFIX } from '../constants';
import { isNullValue, TokenValueExtractor } from '@fincity/kirun-js';
import { DataLocation } from '../components/types';

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
} = useStore({}, STORE_PREFIX, localStoreExtractor);

export const storeExtractor = new StoreExtractor(_store, `${STORE_PREFIX}.`);

export const dotPathBuilder = (path: string, locationHistory: Array<DataLocation | string>) => {
	if (!path.startsWith('.')) return path;

	let dotsLength = 0;
	for (let i = 0; i < path.length && path[i] === '.'; i++) {
		dotsLength++;
	}
	const pickedlocationHistory = locationHistory[locationHistory.length - dotsLength];

	if (!pickedlocationHistory) return path;
	let finalPath = '';
	if (typeof pickedlocationHistory === 'string')
		finalPath = `${pickedlocationHistory}.${path.substring(dotsLength)}`;
	if (pickedlocationHistory?.type === 'VALUE') {
		finalPath = `${pickedlocationHistory.value}.${path.substring(dotsLength)}`;
	}
	if (pickedlocationHistory?.type === 'EXPRESSION') {
		finalPath = `${pickedlocationHistory.expression}.${path.substring(dotsLength)}`;
	}
	return finalPath;
};

export function getData(
	loc: any,
	locationHistory: Array<DataLocation | string>,
	...tve: Array<TokenValueExtractor>
) {
	const typeOfLoc = typeof loc;

	if (typeOfLoc === 'string') return _getData(loc as string, tve!);

	if (typeOfLoc !== 'object') return undefined;

	let data: any = undefined;
	if (loc.location?.type === 'VALUE') {
		data = _getData(dotPathBuilder(loc.location?.value, locationHistory) || '', tve!);
	}
	if (loc.location?.type === 'EXPRESSION') {
		const v = _getData(dotPathBuilder(loc.location?.expression!, locationHistory) || '', tve!);
		if (!isNullValue(v)) data = v;
	}
	if (!isNullValue(loc.value)) data = loc.value;

	return data;
}

export function setData(path: string, value: any, context?: string) {
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
				);
				localStore.setItem(key, JSON.stringify(store));
			} catch (error) {
				localStore.setItem(key, value);
			}
		}
	} else if (path.startsWith(PAGE_STORE_PREFIX)) {
		_setData(
			`Store.pageData.${context}.${path.substring(PAGE_STORE_PREFIX.length + 1)}`,
			value,
		);
	} else _setData(path, value);

	console.log(path, store);
}

export class PageStoreExtractor extends TokenValueExtractor {
	private context: string;

	static readonly extractorMap: Map<string, PageStoreExtractor> = new Map();

	constructor(context: string) {
		super();
		this.context = context;
	}

	protected getValueInternal(token: string) {
		const parts: string[] = token.split(TokenValueExtractor.REGEX_DOT);
		return this.retrieveElementFrom(
			token,
			['pageData', this.context, ...parts.slice(1)],
			0,
			_store,
		);
	}

	getPrefix(): string {
		return 'Page.';
	}

	public static getForContext(context: string): PageStoreExtractor {
		if (this.extractorMap.has(context)) return this.extractorMap.get(context)!;

		this.extractorMap.set(context, new PageStoreExtractor(context));

		return this.extractorMap.get(context)!;
	}
}

export const addListener = _addListener;

export const store = _store;
