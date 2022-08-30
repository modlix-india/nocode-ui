import { createContext, useContext, useMemo, useState } from 'react';
import { useStore } from '@fincity/path-reactive-state-management';
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
		let parts: string[] = token.split(TokenValueExtractor.REGEX_DOT);
		let localStorageValue = this.store.getItem(parts[1]);
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
let localStore: any = {};
if (typeof window !== 'undefined') {
	localStore = window.localStorage;
}

const localStoreExtractor = new LocalStoreExtractor(
	localStore,
	LOCAL_STORE_PREFIX,
);

const {
	getData: _getData,
	setData: _setData,
	addListener: _addListener,
} = useStore({}, STORE_PREFIX, localStoreExtractor);

export function getData(loc: any) {
	const typeOfLoc = typeof loc;

	if (typeOfLoc === 'string') return _getData(loc);

	if (typeOfLoc !== 'object') return undefined;

	if (!loc.location) return loc.value;

	for (const eachLocation of loc.location) {
		if (eachLocation.startsWith(LOCAL_STORE_PREFIX)) {
		}
		const v = _getData(eachLocation);
		if (!isNullValue(v)) return v;
	}

	return undefined;
}

export const setData = _setData;
export const addListener = _addListener;
