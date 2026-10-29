import axios from 'axios';
import { ComponentPropertyDefinition, StylePropertyDefinition } from '../../types/common';

export function lazyStylePropertyLoadFunction(
	name: string,
	setStyleProperties: (
		styleProperties: Array<StylePropertyDefinition>,
		originalStyleProps?: Array<StylePropertyDefinition>,
	) => void,
	styleDefaults: Map<string, string>,
	props?: Array<ComponentPropertyDefinition>,
) {
	return () => {
		if (styleDefaults.size > 0) return;
		if (globalThis.styleProperties[name]) {
			globalThis.styleProperties[name]
				.filter((e: any) => !!e.dv)
				?.map(({ n: name, dv: defaultValue }: any) =>
					styleDefaults.set(name, defaultValue),
				);
			return;
		}
		void fetchStyleProperties(name).then(data => {
			if (!data) return;
			if (styleDefaults.size > 0) return;
			inflateAndSetStyleProps(props, data, setStyleProperties, styleDefaults);
		});
	};
}

const STYLE_PROPERTY_RETRY_DELAYS = [400, 1500, 4000];

/**
 * Fetches `/styleProperties/<name>.json`, retrying when the request fails or does not answer with
 * an array. One failed request used to leave the component without any of its theme styles until
 * a reload (browser-default buttons and inputs on a sign-in page), and the CDN answers a miss with
 * a month long max-age, so a retry asks for a URL no cache holds (`r=<attempt>`).
 */
export function fetchStyleProperties(
	name: string,
	delays: Array<number> = STYLE_PROPERTY_RETRY_DELAYS,
): Promise<Array<StylePropertyDefinition> | undefined> {
	const attempt = (n: number): Promise<Array<StylePropertyDefinition> | undefined> => {
		const base = lazyStylePropURL(name);
		const url = n === 0 ? base : `${base}${base.includes('?') ? '&' : '?'}r=${n}`;
		return axios
			.get(url)
			.then((res: any) => {
				if (Array.isArray(res?.data)) return res.data;
				throw new Error('Style properties response is not a list');
			})
			.catch((err: any) => {
				if (n >= delays.length) {
					console.error('Unable to load style properties for component : ', name, err);
					return undefined;
				}
				return new Promise<Array<StylePropertyDefinition> | undefined>(resolve =>
					setTimeout(() => resolve(attempt(n + 1)), delays[n]),
				);
			});
	};
	return attempt(0);
}

export function inflateAndSetStyleProps(
	props: ComponentPropertyDefinition[] | undefined,
	srcStyleProps: StylePropertyDefinition[],
	setStyleProperties: (
		styleProperties: Array<StylePropertyDefinition>,
		originalStyleProps?: Array<StylePropertyDefinition>,
	) => void,
	styleDefaults: Map<string, string>,
) {
	const valuesNames = props
		?.filter(e => e.enumValues)
		.map(e => ({
			propName: e.name,
			enumValues: e.enumValues!.map(x => ({
				sel: x.name,
				name: removeSpecialCharsAndMakeFirstLetterCap(x.name),
			})),
		}));

	const styleProps = inflateStyleProps(srcStyleProps, valuesNames);
	setStyleProperties(styleProps, props?.length ? srcStyleProps : undefined);

	styleProps
		?.filter((e: any) => !!e.dv)
		?.map(({ n: name, dv: defaultValue }: any) => styleDefaults.set(name, defaultValue));
}

export function lazyStylePropURL(name: string) {
	const version = globalThis.buildVersion ? `?v=${globalThis.buildVersion}` : '';
	return `${globalThis.cdnPrefix ? 'https://' + globalThis.cdnPrefix + '/js/dist' : ''}/styleProperties/${name}.json${version}`;
}

export function lazyCSSURL(name: string) {
	const version = globalThis.buildVersion ? `?v=${globalThis.buildVersion}` : '';
	return `${globalThis.cdnPrefix ? 'https://' + globalThis.cdnPrefix + '/js/dist' : ''}/css/${name}.css${version}`;
}

export function findPropertyDefinitions(
	propertiesDefinition: Array<ComponentPropertyDefinition>,
	...props: Array<string>
): { [key: string]: ComponentPropertyDefinition } {
	const defs: { [key: string]: ComponentPropertyDefinition } = {};
	const propsSet = new Set<string>(props);
	for (const def of propertiesDefinition) {
		if (propsSet.has(def.name)) {
			defs[def.name] = def;
		}
	}
	return defs;
}

export function inflateStyleProps(
	props: Array<StylePropertyDefinition>,
	valuesNames:
		Array<{ propName: string; enumValues: Array<{ sel: string; name: string }> }> | undefined,
): Array<StylePropertyDefinition> {
	if (!valuesNames?.length) return props;

	return props.flatMap(prop => {
		const origProp = { ...prop };
		const spv = origProp.spv;
		delete origProp.spv;

		const usedEnumNames = valuesNames.filter(
			({ propName }) => origProp.n.indexOf(`<${propName}>`) !== -1,
		);

		let result: Array<StylePropertyDefinition> = [origProp];

		if (!usedEnumNames.length) return result;

		for (let i = 0; i < usedEnumNames.length; i++) {
			const sprayArray: Array<StylePropertyDefinition> = [];
			for (let j = 0; j < usedEnumNames[i].enumValues.length; j++) {
				for (let k = 0; k < result.length; k++) {
					const current = { ...result[k] };
					current.n = current.n.replaceAll(
						`<${usedEnumNames[i].propName}>`,
						usedEnumNames[i].enumValues[j].name,
					);
					current.sel = current.sel?.replaceAll(
						`<${usedEnumNames[i].propName}>`,
						`.${usedEnumNames[i].enumValues[j].sel}`,
					);
					current.evu = current.evu
						? [...current.evu, usedEnumNames[i].enumValues[j].sel]
						: [usedEnumNames[i].enumValues[j].sel];

					current.dv = result[k].dv;

					sprayArray.push(current);
				}
			}
			result = sprayArray;
		}

		if (spv) {
			const spvValueMap = new Map<string, string>(Object.entries(spv));
			if (spvValueMap.size) {
				result.forEach(e => (e.dv = makeDefaultValue(e, spvValueMap)));
			}
		}
		return result;
	});
}

export function removeSpecialCharsAndMakeFirstLetterCap(name: string) {
	const x = name.replace(/[^a-zA-Z0-9]/g, '');
	return x[0].toUpperCase() + x.slice(1);
}

function makeDefaultValue(
	prop: StylePropertyDefinition,
	spv: Map<string, string>,
): string | undefined {
	if (!prop.evu?.length) return prop.dv;

	let arr = [...prop.evu];
	let key = arr.join('-');
	if (spv.has(key)) return spv.get(key);

	for (let i = 1; i < prop.evu.length; i++) {
		const combinations = generateReversedCombinations(i, prop.evu.length);
		for (const combination of combinations) {
			arr = [...prop.evu];
			combination.forEach(ind => (arr[ind] = ''));
			key = arr.join('-');
			if (spv.has(key)) return spv.get(key);
		}
	}

	arr = [...prop.evu];
	arr.fill('');
	return spv.get(arr.join('-')) ?? prop.dv;
}

const remember: Map<string, number[][]> = new Map();
function generateReversedCombinations(n: number, l: number): number[][] {
	const keyToRemember = `${n}-${l}`;
	if (remember.has(keyToRemember)) return remember.get(keyToRemember)!;

	const result: number[][] = [];

	function backtrack(start: number, combo: number[]) {
		if (combo.length === n) {
			result.push([...combo]);
			return;
		}

		for (let i = start; i < l; i++) {
			combo.push(i);
			backtrack(i + 1, combo);
			combo.pop();
		}
	}

	backtrack(0, []);
	result.reverse();

	remember.set(keyToRemember, result);
	return result;
}

/**
 * Style properties handed in before the first render (`globalThis.styleProperties`: preloaded for a
 * server-rendered page, and given to the server render), applied synchronously exactly as the fetch
 * path applies them: expanded for the component's design and colour properties, the expanded list
 * into `styleProperties`, the source into `stylePropertiesForTheme`. The branch this replaces copied
 * the RAW JSON in, which left `<designType><colorScheme>` placeholders in every selector and, by
 * filling the defaults, stopped the fetch path from ever expanding them: the component's design
 * styles never applied (unstyled buttons and inputs on a server-rendered page).
 */
export function applyPreloadedStyleProperties(
	name: string,
	propertiesDefinition: Array<ComponentPropertyDefinition>,
	styleProperties: Array<StylePropertyDefinition>,
	stylePropertiesForTheme: Array<StylePropertyDefinition>,
	styleDefaults: Map<string, string>,
) {
	const designProps = propertiesDefinition.filter(
		p => p.enumValues?.length && /design|colorScheme/i.test(p.name),
	);
	inflateAndSetStyleProps(
		designProps.length ? designProps : undefined,
		globalThis.styleProperties[name],
		(props, originalStyleProps) => {
			styleProperties.splice(0, 0, ...props);
			if (originalStyleProps) stylePropertiesForTheme.splice(0, 0, ...originalStyleProps);
		},
		styleDefaults,
	);
}
