import {
	AbstractFunction,
	Event,
	EventResult,
	FunctionExecutionParameters,
	FunctionOutput,
	FunctionSignature,
	Schema,
} from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../constants';

const SIGNATURE = new FunctionSignature('BuildLeadAdData')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setEvents(
		new Map([
			Event.eventMapEntry(Event.OUTPUT, new Map([['adData', Schema.ofAny('adData')]])),
		]),
	)
	.setDescription(
		'Builds the adData object (gclid/wbraid/gbraid/fbc/fbp) for lead-form submissions from URL params + Meta Pixel cookies. Persists click identifiers to first-party cookies so they survive navigation between landing and form pages.',
	)
	.setDocumentation(
		'# UIEngine.BuildLeadAdData\n\nReads ad-click identifiers from `window.location` query params and browser cookies, persists newly-seen ones into first-party cookies, and emits an `adData` object suitable for sending alongside a lead-form POST to `entity-processor`. The downstream Meta CAPI / Google Conversions API dispatchers read these exact keys off the ticket.\n\n## Parameters\n\nNone.\n\n## Events\n\n- **output**: Emits the built object\n  - `adData` (Any): Object containing whichever of these keys are present: `gclid`, `wbraid`, `gbraid`, `fbc`, `fbp`. Empty object `{}` if none are detected.\n\n## Sources, in order\n\nFor each click identifier (`gclid`, `wbraid`, `gbraid`, `fbclid`):\n1. Look in the current URL query string. If found, write to a first-party cookie (`lz_<name>`, max-age 1 year) so the value survives navigation to a separate form page.\n2. Else, read from the `lz_<name>` first-party cookie.\n\nMeta cookies come straight from the browser:\n- `fbp` <- cookie `_fbp` (set by Meta Pixel on every page load).\n- `fbc` <- cookie `_fbc` (set by Meta Pixel when URL contains `fbclid`); else built from the persisted fbclid as `fb.1.<now>.<fbclid>` per Meta CAPI spec.\n\n## Use\n\nBind the output through `UIEngine.SetStore` into a `Page.adData` path, then include `Page.adData` in the lead-form POST body sent to `/api/entity/processor/entry/website`.',
	);

const COOKIE_PREFIX = 'lz_';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function readCookie(name: string): string | undefined {
	if (typeof document === 'undefined') return undefined;
	const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const match = document.cookie.match(new RegExp('(?:^|; )' + escaped + '=([^;]*)'));
	return match ? decodeURIComponent(match[1]) : undefined;
}

function writeCookie(name: string, value: string) {
	if (typeof document === 'undefined' || !value) return;
	document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${ONE_YEAR_SECONDS}; path=/; SameSite=Lax`;
}

function paramOrCookie(urlParams: URLSearchParams, name: string): string | undefined {
	const fromUrl = urlParams.get(name);
	if (fromUrl) {
		writeCookie(COOKIE_PREFIX + name, fromUrl);
		return fromUrl;
	}
	return readCookie(COOKIE_PREFIX + name);
}

export class BuildLeadAdData extends AbstractFunction {
	protected async internalExecute(
		_context: FunctionExecutionParameters,
	): Promise<FunctionOutput> {
		const adData: Record<string, string> = {};

		if (typeof window !== 'undefined') {
			const urlParams = new URLSearchParams(window.location.search);

			const gclid = paramOrCookie(urlParams, 'gclid');
			if (gclid) adData.gclid = gclid;

			const wbraid = paramOrCookie(urlParams, 'wbraid');
			if (wbraid) adData.wbraid = wbraid;

			const gbraid = paramOrCookie(urlParams, 'gbraid');
			if (gbraid) adData.gbraid = gbraid;

			const fbclid = paramOrCookie(urlParams, 'fbclid');

			const fbp = readCookie('_fbp');
			if (fbp) adData.fbp = fbp;

			const browserFbc = readCookie('_fbc');
			if (browserFbc) {
				adData.fbc = browserFbc;
			} else if (fbclid) {
				// Meta CAPI user_data.fbc format: fb.1.<timestamp>.<fbclid>
				adData.fbc = `fb.1.${Date.now()}.${fbclid}`;
			}
		}

		return new FunctionOutput([EventResult.outputOf(new Map([['adData', adData]]))]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
