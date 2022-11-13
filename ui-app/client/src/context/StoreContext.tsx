import { useStore, setStoreData } from '@fincity/path-reactive-state-management';
import { LOCAL_STORE_PREFIX, STORE_PREFIX } from '../constants';
import { isNullValue, TokenValueExtractor } from '@fincity/kirun-js';

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

export function getData(loc: any) {
	const typeOfLoc = typeof loc;

	if (typeOfLoc === 'string') return _getData(loc);

	if (typeOfLoc !== 'object') return undefined;

	let data: any = undefined;
	if (loc.location?.type === 'VALUE') data = _getData(loc.location?.value);
	if (loc.location?.type === 'EXPRESSION') {
		const v = _getData(loc.location?.expression);
		if (!isNullValue(v)) data = v;
	}
	if (!isNullValue(loc.value)) data = loc.value;

	return data;
}

export function setData(path: string, value: any) {
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
	} else _setData(path, value);

	console.log(path, store);
}
export const addListener = _addListener;

export const store = _store;
