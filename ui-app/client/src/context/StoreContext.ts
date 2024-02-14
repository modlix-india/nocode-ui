import { TokenValueExtractor, duplicate, isNullValue } from '@fincity/kirun-js';
import { setStoreData, useStore } from '@fincity/path-reactive-state-management';
import {
	LOCAL_STORE_PREFIX,
	PAGE_STORE_PREFIX,
	SAMPLE_STORE_PREFIX,
	STORE_PREFIX,
} from '../constants';
import { messageToMaster } from '../slaveFunctions';
import { ComponentProperty, DataLocation, LocationHistory } from '../types/common';
import { LocalStoreExtractor } from './LocalStoreExtractor';
import { ParentExtractorForRunEvent } from './ParentExtractor';
import { SpecialTokenValueExtractor } from './SpecialTokenValueExtractor';
import { ThemeExtractor } from './ThemeExtractor';
import { sample } from './sampleData';
import { FillerExtractor } from './FillerExtractor';

export class StoreExtractor extends SpecialTokenValueExtractor {
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
export const themeExtractor = new ThemeExtractor();
export const fillerExtractor = new FillerExtractor();

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
	{},
	STORE_PREFIX,
	localStoreExtractor,
	themeExtractor,
	fillerExtractor,
	new StoreExtractor(sample, `${SAMPLE_STORE_PREFIX}.`),
);
themeExtractor.setStore(_store);
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
		path = data || '';
	}

	return pe ? pe.computeParentPath(path) : path;
}

export function getDataFromPath(
	path: string | undefined,
	locationHistory: Array<LocationHistory>,
	...tve: Array<TokenValueExtractor>
) {
	if (!path) return undefined;
	if (locationHistory?.length)
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

	if (path.startsWith('SampleDataStore.') || path.startsWith('Filler.')) {
		// Sample store is not editable so we are not changing the data
		return;
	} else if (path.startsWith(LOCAL_STORE_PREFIX)) {
		let parts = path.split(TokenValueExtractor.REGEX_DOT);

		const key = window.isDesignMode ? 'designmode_' + parts[1] : parts[1];
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
	} else if (path.startsWith(PAGE_STORE_PREFIX) && context) {
		_setData(
			`Store.pageData.${context}.${path.substring(PAGE_STORE_PREFIX.length + 1)}`,
			value,
			deleteKey,
		);
	} else if (
		window.isDesignMode &&
		window.designMode === 'PAGE' &&
		window.pageEditor?.editingPageDefinition?.name &&
		path === `${STORE_PREFIX}.pageDefinition.${window.pageEditor.editingPageDefinition.name}`
	) {
		_setData(
			path,
			window.pageEditor.editingPageDefinition.name !== value.name
				? value
				: window.pageEditor.editingPageDefinition,
		);
	} else _setData(path, value, deleteKey);

	if (window.designMode !== 'PAGE') return;

	messageToMaster({ type: 'SLAVE_STORE', payload: _store });
}

export class PageStoreExtractor extends SpecialTokenValueExtractor {
	private pageName: string;
	private myStore: any;

	static readonly extractorMap: Map<string, PageStoreExtractor> = new Map();

	constructor(pageName: string, myStore: any = _store) {
		super();
		this.pageName = pageName;
		this.myStore = myStore;
	}

	protected getValueInternal(token: string) {
		const parts: string[] = token.split(TokenValueExtractor.REGEX_DOT);
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
}

const pathTransformer = (e: string, pageExtractor?: PageStoreExtractor) => {
	if (pageExtractor && e.startsWith(pageExtractor.getPrefix()))
		return 'Store.pageData.' + pageExtractor.getPageName() + e.substring(4);
	else if (e.startsWith(fillerExtractor.getPrefix()))
		return 'Store.application.properties.fillerValues.' + e.substring(7);
	return e;
};

export const addListener = (
	callback: (path: string, value: any) => void,
	pageExtractor?: PageStoreExtractor,
	...path: Array<string>
): (() => void) => {
	return _addListener(callback, ...path.map(e => pathTransformer(e, pageExtractor)));
};

export const addListenerAndCallImmediately = (
	callback: (path: string, value: any) => void,
	pageExtractor?: PageStoreExtractor,
	...path: Array<string>
): (() => void) => {
	return _addListenerAndCallImmediately(
		true,
		callback,
		...path.map(e => pathTransformer(e, pageExtractor)),
	);
};

export const addListenerWithChildrenActivity = (
	callback: (path: string, value: any) => void,
	pageExtractor?: PageStoreExtractor,
	...path: Array<string>
): (() => void) => {
	return _addListenerWithChildrenActivity(
		callback,
		...path.map(e => pathTransformer(e, pageExtractor)),
	);
};

export const addListenerAndCallImmediatelyWithChildrenActivity = (
	callback: (path: string, value: any) => void,
	pageExtractor?: PageStoreExtractor,
	...path: Array<string>
): (() => void) => {
	return _addListenerAndCallImmediatelyWithChildrenActivity(
		true,
		callback,
		...path.map(e => pathTransformer(e, pageExtractor)),
	);
};

export const store = _store;
