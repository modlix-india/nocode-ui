import { TokenValueExtractor } from '@fincity/kirun-js';
import { StyleResolution } from '../types/common';
import { SpecialTokenValueExtractor } from './SpecialTokenValueExtractor';
import ComponentDefinitions from '../components';
import { processStyleValueWithFunction } from '../util/styleProcessor';
import { styleProperties, styleDefaults } from '../App/appStyleProperties';
import { usedComponents } from '../App/usedComponents';

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

export class ThemeExtractor extends SpecialTokenValueExtractor {
	private store: any;
	private defaults: Map<string, string> | undefined = undefined;
	private currentTime: number = Date.now();

	public setStore(store: any) {
		this.store = store;
	}

	private refreshDefaults(): Map<string, string> {
		if (!this.defaults || this.currentTime != usedComponents.lastAdded()) {
			this.currentTime = usedComponents.lastAdded();
			this.defaults = new Map<string, string>(
				Array.from(ComponentDefinitions.values())
					.map(e => e.styleDefaults)
					.concat(styleDefaults)
					.flatMap(e => Array.from(e.entries())),
			);
		}
		return this.defaults;
	}

	/**
	 * Fully resolve a value that may contain `<variable>` references, against
	 * the live theme first and the component and app defaults behind it.
	 *
	 * This exists because `Theme.x` alone is not enough for a consumer that
	 * needs a real value rather than a CSS string. getValueInternal returns the
	 * live theme's entry VERBATIM, so a variable whose value is itself
	 * `<anotherVar>` comes back unresolved: fine when it is about to be written
	 * into a stylesheet, useless for anything that has to parse it, such as a
	 * WebGL colour. Resolving against defaults only happens on the fallback
	 * path, which is the asymmetry this method removes.
	 *
	 * Returns the input unchanged when there is nothing to resolve, and leaves
	 * a genuinely unknown variable as the empty string that
	 * processStyleValueWithFunction produces, so the caller can spot it.
	 */
	public resolveValue(value: string | undefined): string {
		if (!value) return '';
		if (!value.includes('<')) return value;
		const merged = new Map(this.refreshDefaults());
		const allTheme = this.store?.theme?.[StyleResolution.ALL] ?? {};
		for (const [k, v] of Object.entries(allTheme)) merged.set(k, String(v));
		return processStyleValueWithFunction(value, merged);
	}

	protected getValueInternal(token: string) {
		this.refreshDefaults();

		const allTheme = this.store.theme?.[StyleResolution.ALL] ?? {};

		const parts: string[] = TokenValueExtractor.splitPath(token);
		if (parts.length != 2) return undefined;

		const devices = this.store.devices;
		if (devices) {
			for (const res of ORDER_OF_RESOLUTION) {
				if (!devices[res] || !this.store.theme?.[res] || !this.store.theme[res]?.[parts[1]])
					continue;
				return this.store.theme[res]?.[parts[1]];
			}
		}

		return allTheme[parts[1]] ?? processStyleValueWithFunction(`<${parts[1]}>`, this.defaults!);
	}

	getPrefix(): string {
		return 'Theme.';
	}

	public getStore(): any {
		return this.store;
	}
}
