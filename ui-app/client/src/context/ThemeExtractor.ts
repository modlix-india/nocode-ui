import { TokenValueExtractor } from '@fincity/kirun-js';
import { StyleResolution } from '../types/common';
import { SpecialTokenValueExtractor } from './SpecialTokenValueExtractor';
import ComponentDefinitions from '../components';
import { processStyleValueWithFunction } from '../util/styleProcessor';
import { styleDefaults } from '../App/appStyleProperties';

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

const DEFAULTS = new Map<string, string>(
	Array.from(ComponentDefinitions.values())
		.map(e => e.styleDefaults)
		.concat(styleDefaults)
		.flatMap(e => Array.from(e.entries())),
);

export class ThemeExtractor extends SpecialTokenValueExtractor {
	private store: any;

	public setStore(store: any) {
		this.store = store;
	}

	protected getValueInternal(token: string) {
		const allTheme = this.store.theme?.[StyleResolution.ALL] ?? {};

		const parts: string[] = token.split(TokenValueExtractor.REGEX_DOT);
		if (parts.length != 2) return undefined;

		const devices = this.store.devices;
		if (devices) {
			for (const res of ORDER_OF_RESOLUTION) {
				if (!devices[res] || !this.store.theme?.[res] || !this.store.theme[res]?.[parts[1]])
					continue;
				return this.store.theme[res]?.[parts[1]];
			}
		}

		return allTheme[parts[1]] ?? processStyleValueWithFunction(`<${parts[1]}>`, DEFAULTS);
	}

	getPrefix(): string {
		return 'Theme.';
	}
}
