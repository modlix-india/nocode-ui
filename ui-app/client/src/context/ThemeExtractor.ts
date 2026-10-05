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

const NO_THEME = {};

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
	 * `Theme.x` expressions go through this too (see getValueInternal), so a
	 * variable whose value is itself `<anotherVar>` resolves the same way for a
	 * style leaf as for a consumer that has to parse it, such as a WebGL colour.
	 *
	 * Returns the input unchanged when there is nothing to resolve, and leaves
	 * a genuinely unknown variable as the empty string that
	 * processStyleValueWithFunction produces, so the caller can spot it.
	 */
	public resolveValue(value: string | undefined): string {
		if (!value) return '';
		if (!value.includes('<')) return value;
		return processStyleValueWithFunction(value, this.mergedTheme());
	}

	private merged: { theme: any; time: number; map: Map<string, string> } | undefined;

	// Defaults overlaid with the live theme's ALL entries, rebuilt only when the
	// theme object or the set of used components changes: Theme.x is evaluated
	// for every style leaf that names one, so this must not be built per call.
	private mergedTheme(): Map<string, string> {
		const defaults = this.refreshDefaults();
		const allTheme = this.store?.theme?.[StyleResolution.ALL] ?? NO_THEME;
		const cached = this.merged;
		if (cached && cached.theme === allTheme && cached.time === this.currentTime)
			return cached.map;
		const map = new Map(defaults);
		for (const [k, v] of Object.entries(allTheme)) map.set(k, String(v));
		this.merged = { theme: allTheme, time: this.currentTime, map };
		return map;
	}

	// A theme entry can itself be a reference (Classic stores backgroundColorThree
	// as `<colorThree>`). Returned verbatim, that reaches a style leaf as invalid
	// CSS and the browser drops it without a word, so resolve it here.
	protected getValueInternal(token: string) {
		const value = this.getRawValue(token);
		return typeof value === 'string' && value.includes('<') ? this.resolveValue(value) : value;
	}

	private getRawValue(token: string) {
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
