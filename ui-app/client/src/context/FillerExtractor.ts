import { TokenValueExtractor } from '@fincity/kirun-js';
import { SpecialTokenValueExtractor } from './SpecialTokenValueExtractor';

export class FillerExtractor extends SpecialTokenValueExtractor {
	private store: any;

	public setStore(store: any) {
		this.store = store;
	}

	protected getValueInternal(token: string) {
		const newToken = `Store.application.properties.fillerValues.${token.replace(
			'Filler.',
			'',
		)}`;

		return this.retrieveElementFrom(
			newToken,
			newToken.split(TokenValueExtractor.REGEX_DOT),
			1,
			this.store,
		);
	}

	getPrefix(): string {
		return 'Filler.';
	}
}
