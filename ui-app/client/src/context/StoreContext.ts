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
import { FillerExtractor } from './FillerExtractor';
import { LocalStoreExtractor } from './LocalStoreExtractor';
import { ParentExtractorForRunEvent } from './ParentExtractor';
import { SpecialTokenValueExtractor } from './SpecialTokenValueExtractor';
import { ThemeExtractor } from './ThemeExtractor';
import { AuthoritiesExtractor } from './AuthoritiesExtractor';
import { sample } from './sampleData';

export class StoreExtractor extends SpecialTokenValueExtractor {
	private readonly store: any;
	private readonly prefix: string;

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

	public getStore(): any {
		return this.store;
	}
}

type LocalStore = {
	getItem: (key: string) => string | null;
	setItem: (key: string, value: string) => void;
	removeItem: (key: string) => void;
};

const noopStore: LocalStore = {
	getItem: () => null,
	setItem: () => {},
	removeItem: () => {},
};

let localStore: LocalStore = noopStore;
if (typeof window !== 'undefined') {
	localStore = window.localStorage;
}
export const localStoreExtractor = new LocalStoreExtractor(localStore, `${LOCAL_STORE_PREFIX}.`);
export const themeExtractor = new ThemeExtractor();
export const authoritiesExtractor = new AuthoritiesExtractor();
export const fillerExtractor = new FillerExtractor();

let pathName: string | undefined =
	typeof window !== 'undefined' ? window.location?.pathname ?? undefined : undefined;
let urlAppCode: string | undefined = undefined;
let urlClientCode: string | undefined = undefined;

const pageIndex = pathName?.indexOf('/page') ?? -1;

if (pathName && pageIndex !== -1) {
	const basePath = pathName.substring(0, pageIndex);
	const parts = basePath.split('/');
	if (parts.length > 1) {
		urlAppCode = parts[1];
	}
	if (parts.length > 2) {
		urlClientCode = parts[2];
	}
}

type StoreAPI = ReturnType<typeof useStore>;

let storeApi: StoreAPI;
export let store: any;
export let storeExtractor: StoreExtractor;

function buildInitialStoreObject(initialOverride?: any) {
	if (initialOverride) return duplicate(initialOverride);
	if (globalThis.__APP_BOOTSTRAP__?.store) return duplicate(globalThis.__APP_BOOTSTRAP__?.store);

	let initial: any = { url: { appCode: urlAppCode, clientCode: urlClientCode } };
	if (globalThis.appDefinitionResponse)
		initial = { ...initial, ...globalThis.appDefinitionResponse };
	if (globalThis.pageDefinitionResponse)
		initial.pageDefinition = {
			[globalThis.pageDefinitionRequestPageName]: globalThis.pageDefinitionResponse,
		};
	if (globalThis.__APP_BOOTSTRAP__?.urlDetails)
		initial.url = { ...initial.url, ...globalThis.__APP_BOOTSTRAP__?.urlDetails };
	return initial;
}

function attachStoreReferences(api: StoreAPI) {
	store = api.store;
	themeExtractor.setStore(store);
	authoritiesExtractor.setStore(store);
	fillerExtractor.setStore(store);
	globalThis.getStore = () => duplicate(store);
	storeExtractor = new StoreExtractor(store, `${STORE_PREFIX}.`);
	PageStoreExtractor.extractorMap.clear();
}

function initializeStore(initialOverride?: any): StoreAPI {
	const initialObject = buildInitialStoreObject(initialOverride);
	const api = useStore(
		initialObject,
		STORE_PREFIX,
		localStoreExtractor,
		themeExtractor,
		authoritiesExtractor,
		fillerExtractor,
		new StoreExtractor(sample, `${SAMPLE_STORE_PREFIX}.`),
	);
	attachStoreReferences(api);
	return api;
}

function ensureStore(initialOverride?: any): StoreAPI {
	if (!storeApi) {
		storeApi = initializeStore(initialOverride);
	}
	return storeApi;
}

storeApi = initializeStore();

export function resetStore(initialOverride?: any) {
	storeApi = initializeStore(initialOverride);
}

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
	const api = ensureStore();
	if (locationHistory?.length)
		tve = [
			...tve,
			new ParentExtractorForRunEvent(
				locationHistory,
				new Map(tve.map(e => [e.getPrefix(), e])),
			),
		];
	if (loc?.type === 'VALUE' && loc.value) {
		return api.getData(loc.value || '', ...tve);
	} else if (loc?.type === 'EXPRESSION' && loc.expression) {
		return api.getData(loc.expression || '', ...tve);
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
	const api = ensureStore();
	if (locationHistory?.length && !tve?.some(e => e.getPrefix() === 'Parent.'))
		tve = [
			...tve,
			new ParentExtractorForRunEvent(
				locationHistory,
				new Map(tve.map(e => [e.getPrefix(), e])),
			),
		];
	return api.getData(path, ...tve);
}

export const innerSetData = (path: string, value: any, deleteKey?: boolean) =>
	ensureStore().setData(path, value, deleteKey);

export function setData(path: string, value: any, context?: string, deleteKey?: boolean) {
	// console.error('Data set : ', path, value);
	if (path.endsWith('.')) path = path.substring(0, path.length - 1);

	if (path.startsWith('SampleDataStore.') || path.startsWith('Filler.')) {
		// Sample store is not editable so we are not changing the data
		return;
	}

	const storeAPI = ensureStore();

	if (path.startsWith(PAGE_STORE_PREFIX) && context) {
		storeAPI.setData(
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
			storeAPI.setData(
				path,
				globalThis.pageEditor.editingPageDefinition.name !== value.name
					? value
					: globalThis.pageEditor.editingPageDefinition,
			);
		} else storeAPI.setData(path, value, deleteKey);
	} else if (path.startsWith(LOCAL_STORE_PREFIX)) {
		let parts = path.split(TokenValueExtractor.REGEX_DOT);

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

	messageToMaster({ type: 'SLAVE_STORE', payload: store });
}

export class PageStoreExtractor extends SpecialTokenValueExtractor {
	private readonly pageName: string;
	private readonly myStore: any;

	static readonly extractorMap: Map<string, PageStoreExtractor> = new Map();

	constructor(pageName: string, myStore: any = store) {
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

	public getStore(): any {
		return this.retrieveElementFrom(
			`Store.pageData.${this.pageName}`,
			['pageData', this.pageName],
			0,
			store,
		);
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
	const api = ensureStore();
	return api.addListener(callback, ...path.map(e => pathTransformer(e, pageExtractor)));
};

export const addListenerAndCallImmediately = (
	callback: (path: string, value: any) => void,
	pageExtractor?: PageStoreExtractor,
	...path: Array<string>
): (() => void) => {
	const api = ensureStore();
	return api.addListenerAndCallImmediately(
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
	const api = ensureStore();
	return api.addListenerWithChildrenActivity(
		callback,
		...path.map(e => pathTransformer(e, pageExtractor)),
	);
};

export const addListenerAndCallImmediatelyWithChildrenActivity = (
	callback: (path: string, value: any) => void,
	pageExtractor?: PageStoreExtractor,
	...path: Array<string>
): (() => void) => {
	const api = ensureStore();
	return api.addListenerAndCallImmediatelyWithChildrenActivity(
		true,
		callback,
		...path.map(e => pathTransformer(e, pageExtractor)),
	);
};

