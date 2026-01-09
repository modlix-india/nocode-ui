import { TokenValueExtractor, isNullValue } from '@fincity/kirun-js';

export abstract class SpecialTokenValueExtractor extends TokenValueExtractor {
	protected retrieveElementFrom(
		token: string,
		parts: string[],
		partNumber: number,
		jsonElement: any,
	) {
		if (isNullValue(jsonElement)) return undefined;

		if (parts.length == partNumber) return jsonElement;

		if (parts[partNumber] === '__') {
			return super.retrieveElementFrom(token, parts, partNumber + 1, jsonElement);
		}

		return super.retrieveElementFrom(token, parts, partNumber, jsonElement);
	}
}
