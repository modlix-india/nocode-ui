import { TokenValueExtractor } from '@fincity/kirun-js';

export class LocalStoreExtractor extends TokenValueExtractor {
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
		const key = window.isDesignMode ? 'designmode_' + parts[1] : parts[1];
		let localStorageValue = this.store.getItem(key);
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
