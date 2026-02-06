import { TokenValueExtractor } from '@fincity/kirun-js';
import { SpecialTokenValueExtractor } from './SpecialTokenValueExtractor';

export class FillerExtractor extends SpecialTokenValueExtractor {
	private store: any;

	public setStore(store: any) {
		this.store = store;
	}

	protected getValueInternal(token: string) {
		const newToken = `Store.application.properties.fillerValues.${token.substring(7)}`;

		return this.retrieveElementFrom(
			newToken,
			TokenValueExtractor.splitPath(newToken),
			1,
			this.store,
		);
	}

	getPrefix(): string {
		return 'Filler.';
	}

	public getStore(): any {
		return this.store;
	}
}
