import { GLOBAL_CONTEXT_NAME } from '../constants';
import { TokenValueExtractor } from '@fincity/kirun-js';
import { LocationHistory } from '../types/common';
import { getDataFromPath, PageStoreExtractor } from './StoreContext';

export class ParentExtractor extends TokenValueExtractor {
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
		const parts: string[] = token.split(TokenValueExtractor.REGEX_DOT);

		let pNum: number = 0;
		while (parts[pNum] === 'Parent') pNum++;

		const lastHistory = this.history[this.history.length - pNum];
		let path = '';

		if (typeof lastHistory.location === 'string')
			path = `${lastHistory.location}[${lastHistory.index}].${parts.slice(pNum).join('.')}`;
		else
			path = `${
				lastHistory.location.type === 'VALUE'
					? lastHistory.location.value
					: lastHistory.location.expression
			}[${lastHistory.index}].${parts.slice(pNum).join('.')}`;

		return getDataFromPath(
			path,
			this.history.length === 1 ? [] : this.history.slice(0, this.history.length - 1),
			PageStoreExtractor.getForContext(lastHistory.pageName ?? GLOBAL_CONTEXT_NAME),
		);
	}
}
