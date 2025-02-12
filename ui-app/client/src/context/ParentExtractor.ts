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
			while ((index = value.indexOf('Parent', index)) !== -1) {
				count++;
				index++;
			}
			return this.history[this.history.length - count]?.index ?? value;
		}

		return value;
	}

	protected getValueInternal(token: string) {
		const { path, lastHistory } = this.getPath(token);

		return getDataFromPath(
			path,
			this.history.length === 1 ? [] : this.history.slice(0, this.history.length - 1),
			PageStoreExtractor.getForContext(lastHistory.pageName ?? GLOBAL_CONTEXT_NAME),
		);
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
		const parts: string[] = token.split(TokenValueExtractor.REGEX_DOT);

		let pNum: number = 0;
		while (parts[pNum] === 'Parent') pNum++;

		const lastHistory = locationHistory[locationHistory.length - pNum];
		let path;

		if (typeof lastHistory.location === 'string')
			path = `${lastHistory.location}.${parts.slice(pNum).join('.')}`;
		else
			path = `${
				lastHistory.location.type === 'VALUE'
					? lastHistory.location.value
					: lastHistory.location.expression
			}.${parts.slice(pNum).join('.')}`;

		return { path, lastHistory, removeHistory: pNum };
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
			while ((index = value.indexOf('Parent', index)) !== -1) {
				count++;
				index++;
			}
			return this.history[this.history.length - count]?.index ?? value;
		}
		return value;
	}

	protected getValueInternal(token: string) {
		return getDataFromPath(
			this.computeParentPath(token),
			[],
			...Array.from(this.valueMaps.values()),
		);
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
		const parts: string[] = token.split(TokenValueExtractor.REGEX_DOT);

		let pNum: number = 0;
		while (parts[pNum] === 'Parent') pNum++;

		const lastHistory = locationHistory[locationHistory.length - pNum];
		let path;

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
