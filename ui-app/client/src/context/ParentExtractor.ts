import { TokenValueExtractor } from '@fincity/kirun-js';
import { GLOBAL_CONTEXT_NAME } from '../constants';
import { LocationHistory } from '../types/common';
import { SpecialTokenValueExtractor } from './SpecialTokenValueExtractor';
import { getDataFromPath, PageStoreExtractor } from './StoreContext';

export class ParentExtractor extends SpecialTokenValueExtractor {
	private readonly history: Array<LocationHistory>;

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

	public getValue(token: string) {
		const value = super.getValue(token);

		if (token.endsWith('.__index') && value?.endsWith?.('Parent')) {
			let count = 0;
			let index = 0;
			while ((index = token.indexOf('Parent', index)) !== -1) {
				count++;
				index++;
			}
			return this.history[this.history.length - count]?.index ?? value;
		}

		return value;
	}

	protected getValueInternal(token: string) {
		const { path, lastHistory } = this.getPath(token);

		const value = getDataFromPath(
			path,
			this.history.length === 1 ? [] : this.history.slice(0, this.history.length - 1),
			PageStoreExtractor.getForContext(lastHistory.pageName ?? GLOBAL_CONTEXT_NAME),
		);

		return value;
	}

	public getPath(token: string): { path: string; lastHistory: LocationHistory } {
		let currentHistory = this.history;

		do {
			let { path, lastHistory, removeHistory } = this.getPathInternal(token, currentHistory);
			if (!path.startsWith('Parent.')) return { path, lastHistory };
			token = path;
			currentHistory = currentHistory.slice(0, currentHistory.length - removeHistory);
		} while (true);
	}

	public getPathInternal(
		token: string,
		locationHistory: LocationHistory[],
	): { path: string; lastHistory: LocationHistory; removeHistory: number } {
		const parts: string[] = TokenValueExtractor.splitPath(token);

		let pNum: number = 0;
		while (parts[pNum] === 'Parent') pNum++;

		const lastHistory = locationHistory[locationHistory.length - pNum];
		let path;

		const remainingSuffix = this.reconstructPath(parts.slice(pNum));

		if (typeof lastHistory.location === 'string')
			path = `${lastHistory.location}.${remainingSuffix}`;
		else
			path = `${
				lastHistory.location.type === 'VALUE'
					? lastHistory.location.value
					: lastHistory.location.expression
			}.${remainingSuffix}`;

		return { path, lastHistory, removeHistory: pNum };
	}

	private reconstructPath(parts: string[]): string {
		if (parts.length === 0) return '';
		if (parts.length === 1) return parts[0];

		let result = parts[0];
		for (let i = 1; i < parts.length; i++) {
			const part = parts[i];
			if (part.startsWith('[')) {
				result += part;
			} else {
				result += '.' + part;
			}
		}
		return result;
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
	private readonly history: Array<LocationHistory>;
	private valueMaps: Map<string, TokenValueExtractor>;

	constructor(history: Array<LocationHistory>, valueMaps: Map<string, TokenValueExtractor>) {
		super();
		this.history = history;
		this.valueMaps = valueMaps;
	}

	public getPrefix(): string {
		return 'Parent.';
	}

	public getValue(token: string) {
		const value = super.getValue(token);

		if (token.endsWith('.__index') && value?.endsWith?.('Parent')) {
			let count = 0;
			let index = 0;

			while ((index = token.indexOf('Parent', index)) !== -1) {
				count++;
				index++;
			}
			return this.history[this.history.length - count]?.index ?? value;
		}
		return value;
	}

	protected getValueInternal(token: string) {
		const path = this.computeParentPath(token);
		const value = getDataFromPath(
			path,
			[],
			...Array.from(this.valueMaps.values()),
		);

		if (value === undefined || value === null) {
			// console.warn('[ParentExtractorForRunEvent] undefined/null for token:', token, '=> path:', path, this.valueMaps.get('Page.')?.getStore()?.dealData?.content);
		}

		return value;
	}

	public computeParentPath(token: string): string {
		let currentHistory = this.history;

		do {
			let { path, removeHistory } = this.computeParentPathInternal(token, currentHistory);
			if (!path.startsWith('Parent.')) return path;
			token = path;
			currentHistory = currentHistory.slice(0, currentHistory.length - removeHistory);
		} while (true);
	}

	public computeParentPathInternal(
		token: string,
		history: LocationHistory[],
	): { path: string; removeHistory: number } {
		const parts: string[] = TokenValueExtractor.splitPath(token);

		let pNum: number = 0;
		while (parts[pNum] === 'Parent') pNum++;

		const remainingSuffix = this.reconstructPath(parts.slice(pNum));

		let lastHistory;

		lastHistory = history[history.length - pNum];

		let path = remainingSuffix;
		if (typeof lastHistory?.location === 'string') path = `${lastHistory.location}.${remainingSuffix}`;
		else if (lastHistory?.location)
			path = `${
				lastHistory.location.type === 'VALUE'
					? lastHistory.location.value
					: lastHistory.location.expression
			}.${remainingSuffix}`;

		return { path, removeHistory: pNum };
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
		const parts: string[] = TokenValueExtractor.splitPath(token);

		let pNum: number = 0;
		while (parts[pNum] === 'Parent') pNum++;

		const lastHistory = locationHistory[locationHistory.length - pNum];
		let path;

		const remainingSuffix = this.reconstructPath(parts.slice(pNum));

		if (typeof lastHistory.location === 'string')
			path = `${lastHistory.location}.${remainingSuffix}`;
		else
			path = `${
				lastHistory.location.type === 'VALUE'
					? lastHistory.location.value
					: lastHistory.location.expression
			}.${remainingSuffix}`;

		return { path, lastHistory };
	}

	private reconstructPath(parts: string[]): string {
		if (parts.length === 0) return '';
		if (parts.length === 1) return parts[0];

		let result = parts[0];
		for (let i = 1; i < parts.length; i++) {
			const part = parts[i];
			if (part.startsWith('[')) {
				result += part;
			} else {
				result += '.' + part;
			}
		}
		return result;
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
