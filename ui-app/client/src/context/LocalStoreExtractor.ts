import { TokenValueExtractor } from '@fincity/kirun-js';
import { SpecialTokenValueExtractor } from './SpecialTokenValueExtractor';

export class LocalStoreExtractor extends SpecialTokenValueExtractor {
	private readonly store: any;
	private readonly prefix: string;

	constructor(store: any, prefix: string) {
		super();
		this.store = store;
		this.prefix = prefix;
	}

	protected getValueInternal(token: string) {
		const parts: string[] = token.split(TokenValueExtractor.REGEX_DOT);
		// Add isSlave_ as prefix for preview mode
		const key = globalThis.isDesignMode ? 'designmode_' + parts[1] : parts[1];
		let localStorageValue = this.store?.getItem(key);
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

	public getStore(): any {
		return this.store;
	}
}
