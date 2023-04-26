import { isNullValue, TokenValueExtractor } from '@fincity/kirun-js';
import { StyleResolution } from '../types/common';

const ORDER_OF_RESOLUTION = [
	StyleResolution.MOBILE_POTRAIT_SCREEN,
	StyleResolution.MOBILE_LANDSCAPE_SCREEN,
	StyleResolution.TABLET_POTRAIT_SCREEN,
	StyleResolution.TABLET_LANDSCAPE_SCREEN,
	StyleResolution.DESKTOP_SCREEN,
	StyleResolution.WIDE_SCREEN,
	StyleResolution.DESKTOP_SCREEN_SMALL,
	StyleResolution.TABLET_LANDSCAPE_SCREEN_SMALL,
	StyleResolution.TABLET_POTRAIT_SCREEN_SMALL,
	StyleResolution.MOBILE_LANDSCAPE_SCREEN_SMALL,
	StyleResolution.DESKTOP_SCREEN_ONLY,
	StyleResolution.TABLET_LANDSCAPE_SCREEN_ONLY,
	StyleResolution.TABLET_POTRAIT_SCREEN_ONLY,
	StyleResolution.MOBILE_LANDSCAPE_SCREEN_ONLY,
	StyleResolution.MOBILE_POTRAIT_SCREEN_ONLY,
].reverse();

export class ThemeExtractor extends TokenValueExtractor {
	private store: any;

	constructor() {
		super();
	}

	public setStore(store: any) {
		this.store = store;
	}

	protected getValueInternal(token: string) {
		if (!this.store.theme) return undefined;

		const parts: string[] = token.split(TokenValueExtractor.REGEX_DOT);
		if (parts.length != 2) return undefined;

		const devices = this.store.devices;
		if (devices) {
			for (const res of ORDER_OF_RESOLUTION)
				if (devices[res] && !isNullValue(this.store.theme[res]?.[parts[1]]))
					return this.store.theme[res]?.[parts[1]];
		}

		return this.store.theme[StyleResolution.ALL]?.[parts[1]];
	}
	getPrefix(): string {
		return 'Theme.';
	}
}
