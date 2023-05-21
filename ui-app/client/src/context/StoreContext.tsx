import { useStore, setStoreData } from '@fincity/path-reactive-state-management';
import {
	LOCAL_STORE_PREFIX,
	STORE_PREFIX,
	PAGE_STORE_PREFIX,
	SAMPLE_STORE_PREFIX,
} from '../constants';
import {
	Expression,
	ExpressionEvaluator,
	isNullValue,
	LinkedList,
	TokenValueExtractor,
} from '@fincity/kirun-js';
import { ComponentProperty, DataLocation, LocationHistory, RenderContext } from '../types/common';
import { PathExtractor } from '../components/util/getPaths';
import { LocalStoreExtractor } from './LocalStoreExtractor';
import { ParentExtractor } from './ParentExtractor';
import { ThemeExtractor } from './ThemeExtractor';
import { duplicate } from '@fincity/kirun-js';
import { messageToMaster } from '../slaveFunctions';
import { sample } from './sampleData';

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
export const themeExtractor = new ThemeExtractor();

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
	new StoreExtractor(sample, `${SAMPLE_STORE_PREFIX}.`),
);
themeExtractor.setStore(_store);

globalThis.getStore = () => duplicate(_store);

export const storeExtractor = new StoreExtractor(_store, `${STORE_PREFIX}.`);

export const dotPathBuilder = (
	origPath: string,
	locationHistory: Array<LocationHistory>,
	...tve: TokenValueExtractor[]
) => {
	if (origPath.indexOf('Parent.') === -1 || !locationHistory.length) return origPath;

	const retSet: Set<string> = new Set();
	let ex = new ExpressionEvaluator(origPath);
	try {
		ex.evaluate(
			new Map(
				[
					storeExtractor,
					localStoreExtractor,
					new ParentExtractor(locationHistory),
					...tve,
				].map(x => [x.getPrefix(), new PathExtractor(x.getPrefix(), x, retSet)]),
			),
		);
	} catch (err) {}

	for (const path of retSet) {
		const parts: string[] = path.split(TokenValueExtractor.REGEX_DOT);

		let pNum: number = 0;
		while (parts[pNum] === 'Parent') pNum++;

		const lastHistory = locationHistory[locationHistory.length - pNum];
		let fpath = '';

		if (typeof lastHistory.location === 'string')
			fpath = `${lastHistory.location}.${parts.slice(pNum).join('.')}`;
		else
			fpath = `${
				lastHistory.location.type === 'VALUE'
					? lastHistory.location.value
					: lastHistory.location.expression
			}.${parts.slice(pNum).join('.')}`;

		origPath = origPath.replace(new RegExp(path.replace(/\./g, '\\.'), 'g'), fpath);
	}

	return origPath;
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
		return _getData(dotPathBuilder(loc.value, locationHistory, ...tve) || '', ...tve);
	} else if (loc?.type === 'EXPRESSION' && loc.expression) {
		return _getData(dotPathBuilder(loc.expression, locationHistory, ...tve) || '', ...tve);
	}
}

export function getPathFromLocation(
	loc: DataLocation,
	locationHistory: Array<LocationHistory>,
	...tve: Array<TokenValueExtractor>
): string {
	if (loc?.type === 'VALUE' && loc.value) {
		return dotPathBuilder(loc.value, locationHistory, ...tve) || '';
	} else if (loc?.type === 'EXPRESSION' && loc.expression) {
		return (
			dotPathBuilder(
				getDataFromLocation(loc, locationHistory, ...tve),
				locationHistory,
				...tve,
			) || ''
		);
	}
	return '';
}

export function getDataFromPath(
	path: string | undefined,
	locationHistory: Array<LocationHistory>,
	...tve: Array<TokenValueExtractor>
) {
	if (!path) return undefined;
	return _getData(dotPathBuilder(path, locationHistory), ...tve);
}

export const innerSetData = _setData;

export function setData(path: string, value: any, context?: string, deleteKey?: boolean) {
	// console.log(path, value);
	if (path.startsWith(LOCAL_STORE_PREFIX)) {
		let parts = path.split(TokenValueExtractor.REGEX_DOT);

		const key = window.isDesignMode ? 'designmode_' + parts[1] : parts[1];
		parts = parts.slice(2);
		let store;
		store = localStore.getItem(key);

		if (!parts.length) {
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

	// console.log(duplicate(_store));
}

export class PageStoreExtractor extends TokenValueExtractor {
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

export const addListenerWithChildrenActivity = (
	callback: (path: string, value: any) => void,
	pageExtractor?: PageStoreExtractor,
	...path: Array<string>
): (() => void) => {
	if (!pageExtractor) return _addListenerWithChildrenActivity(callback, ...path);
	const nPaths = path.map(e => {
		if (!e.startsWith(pageExtractor.getPrefix())) return e;
		return 'Store.pageData.' + pageExtractor.getPageName() + e.substring(4);
	});

	return _addListenerWithChildrenActivity(callback, ...nPaths);
};

export const addListenerAndCallImmediatelyWithChildrenActivity = (
	callback: (path: string, value: any) => void,
	pageExtractor?: PageStoreExtractor,
	...path: Array<string>
): (() => void) => {
	if (!pageExtractor)
		return _addListenerAndCallImmediatelyWithChildrenActivity(true, callback, ...path);
	const nPaths = path.map(e => {
		if (!e.startsWith(pageExtractor.getPrefix())) return e;
		return 'Store.pageData.' + pageExtractor.getPageName() + e.substring(4);
	});

	return _addListenerAndCallImmediatelyWithChildrenActivity(true, callback, ...nPaths);
};

export const store = _store;
