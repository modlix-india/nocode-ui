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
		axios.get(lazyStylePropURL(name)).then((res: any) => {
			if (!Array.isArray(res.data)) {
				console.error('Unable to load style properties for component : ', name);
				console.error('Response : ', res);
				return;
			}

			inflateAndSetStyleProps(props, res.data, setStyleProperties, styleDefaults);
		});
	};
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
		| Array<{ propName: string; enumValues: Array<{ sel: string; name: string }> }>
		| undefined,
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
