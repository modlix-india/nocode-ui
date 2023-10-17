import { TokenValueExtractor } from '@fincity/kirun-js';
import { GLOBAL_CONTEXT_NAME } from '../constants';
import { LocationHistory } from '../types/common';
import { SpecialTokenValueExtractor } from './SpecialTokenValueExtractor';
import { getDataFromPath, PageStoreExtractor } from './StoreContext';

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

		return getDataFromPath(
			path,
			this.history.length === 1 ? [] : this.history.slice(0, this.history.length - 1),
			PageStoreExtractor.getForContext(lastHistory.pageName ?? GLOBAL_CONTEXT_NAME),
		);
	}

	public getPath(token: string): { path: string; lastHistory: LocationHistory } {
		const parts: string[] = token.split(TokenValueExtractor.REGEX_DOT);

		let pNum: number = 0;
		while (parts[pNum] === 'Parent') pNum++;

		const lastHistory = this.history[this.history.length - pNum];
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
		return getDataFromPath(
			this.computeParentPath(token),
			[],
			...Array.from(this.valueMaps.values()),
		);
	}

	public computeParentPath(token: string): string {
		const parts: string[] = token.split(TokenValueExtractor.REGEX_DOT);

		let pNum: number = 0;
		while (parts[pNum] === 'Parent') pNum++;

		let path = parts.slice(pNum).join('.');

		let lastHistory;

		lastHistory = this.history[this.history.length - pNum];
		if (typeof lastHistory?.location === 'string') path = `${lastHistory.location}.${path}`;
		else if (lastHistory?.location)
			path = `${
				lastHistory.location.type === 'VALUE'
					? lastHistory.location.value
					: lastHistory.location.expression
			}.${path}`;

		return path;
	}
}
