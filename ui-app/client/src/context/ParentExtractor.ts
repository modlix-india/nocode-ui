import { isNullValue, TokenValueExtractor } from '@fincity/kirun-js';
import { GLOBAL_CONTEXT_NAME } from '../constants';
import { LocationHistory } from '../types/common';
import { SpecialTokenValueExtractor } from './SpecialTokenValueExtractor';
import { getData, getDataFromPath, PageStoreExtractor } from './StoreContext';

export class ParentExtractor extends SpecialTokenValueExtractor {
	private history: Array<LocationHistory>;

	constructor(history: Array<LocationHistory>) {
		super();
		this.history = history;
	}

	public getHistory(): Array<LocationHistory> {
		return this.history;
	}

	public getPrefix(): string {
		return 'Parent.';
	}

	protected getValueInternal(token: string) {
		const { path, lastHistory } = this.getPath(token);

		const value = getDataFromPath(
			path,
			this.history.length === 1 ? [] : this.history.slice(0, this.history.length - 1),
			PageStoreExtractor.getForContext(lastHistory.pageName ?? GLOBAL_CONTEXT_NAME),
		);

		if (isNullValue(value) && path.endsWith('.__index')) {
			return lastHistory.index;
		}

		return value;
	}

	public getPath(token: string): { path: string; lastHistory: LocationHistory } {
		let currentHistory = this.history;

		do {
			let { path, lastHistory } = this.getPathInternal(token, currentHistory);
			if (!path.startsWith('Parent.')) return { path, lastHistory };
			token = path;
			currentHistory = currentHistory.slice(0, currentHistory.length - 1);
		} while (true);
	}

	public getPathInternal(
		token: string,
		locationHistory: LocationHistory[],
	): { path: string; lastHistory: LocationHistory } {
		const parts: string[] = token.split(TokenValueExtractor.REGEX_DOT);

		let pNum: number = 0;
		while (parts[pNum] === 'Parent') pNum++;

		const lastHistory = locationHistory[locationHistory.length - pNum];
		let path = '';

		if (typeof lastHistory.location === 'string')
			path = `${lastHistory.location}.${parts.slice(pNum).join('.')}`;
		else
			path = `${
				lastHistory.location.type === 'VALUE'
					? lastHistory.location.value
					: lastHistory.location.expression
			}.${parts.slice(pNum).join('.')}`;

		return { path, lastHistory };
	}

	public getStore(): any {
		const { path, lastHistory } = this.getPath('Parent.test');

		const parentPath = path.split('.').slice(0, -1).join('.');

		return getDataFromPath(
			parentPath,
			this.history.length === 1 ? [] : this.history.slice(0, this.history.length - 1),
			PageStoreExtractor.getForContext(lastHistory.pageName ?? GLOBAL_CONTEXT_NAME),
		);
	}
}

export class ParentExtractorForRunEvent extends TokenValueExtractor {
	private history: Array<LocationHistory>;
	private valueMaps: Map<string, TokenValueExtractor>;

	constructor(history: Array<LocationHistory>, valueMaps: Map<string, TokenValueExtractor>) {
		super();
		this.history = history;
		this.valueMaps = valueMaps;
	}

	public getHistory(): Array<LocationHistory> {
		return this.history;
	}

	public getPrefix(): string {
		return 'Parent.';
	}

	protected getValueInternal(token: string) {
		const computedPath = this.computeParentPath(token);

		const value = getDataFromPath(computedPath, [], ...Array.from(this.valueMaps.values()));

		if (isNullValue(value) && computedPath.endsWith('.__index')) {
			const parentPath = computedPath.substring(0, computedPath.length - '.__index'.length);
			if (parentPath.endsWith(']'))
				return parseInt(
					parentPath.substring(parentPath.lastIndexOf('[') + 1, parentPath.length - 1),
				);
			else return parentPath.substring(parentPath.lastIndexOf('.') + 1);
		}

		return value;
	}

	public computeParentPath(token: string): string {
		let currentHistory = this.history;

		do {
			let path = this.computeParentPathInternal(token, currentHistory);
			if (!path.startsWith('Parent.')) return path;
			token = path;
			currentHistory = currentHistory.slice(0, currentHistory.length - 1);
		} while (true);
	}

	public computeParentPathInternal(token: string, history: LocationHistory[]): string {
		const parts: string[] = token.split(TokenValueExtractor.REGEX_DOT);

		let pNum: number = 0;
		while (parts[pNum] === 'Parent') pNum++;

		let path = parts.slice(pNum).join('.');

		let lastHistory;

		lastHistory = history[history.length - pNum];
		if (typeof lastHistory?.location === 'string') path = `${lastHistory.location}.${path}`;
		else if (lastHistory?.location)
			path = `${
				lastHistory.location.type === 'VALUE'
					? lastHistory.location.value
					: lastHistory.location.expression
			}.${path}`;

		return path;
	}

	public getPath(token: string): { path: string; lastHistory: LocationHistory } {
		let currentHistory = this.history;

		do {
			let { path, lastHistory } = this.getPathInternal(token, currentHistory);
			if (!path.startsWith('Parent.')) return { path, lastHistory };
			token = path;
			currentHistory = currentHistory.slice(0, currentHistory.length - 1);
		} while (true);
	}

	public getPathInternal(
		token: string,
		locationHistory: LocationHistory[],
	): { path: string; lastHistory: LocationHistory } {
		const parts: string[] = token.split(TokenValueExtractor.REGEX_DOT);

		let pNum: number = 0;
		while (parts[pNum] === 'Parent') pNum++;

		const lastHistory = locationHistory[locationHistory.length - pNum];
		let path = '';

		if (typeof lastHistory.location === 'string')
			path = `${lastHistory.location}.${parts.slice(pNum).join('.')}`;
		else
			path = `${
				lastHistory.location.type === 'VALUE'
					? lastHistory.location.value
					: lastHistory.location.expression
			}.${parts.slice(pNum).join('.')}`;

		return { path, lastHistory };
	}

	public getStore(): any {
		const { path, lastHistory } = this.getPath('Parent.test');

		const parentPath = path.split('.').slice(0, -1).join('.');

		return getDataFromPath(
			parentPath,
			this.history.length === 1 ? [] : this.history.slice(0, this.history.length - 1),
			PageStoreExtractor.getForContext(lastHistory.pageName ?? GLOBAL_CONTEXT_NAME),
		);
	}
}
