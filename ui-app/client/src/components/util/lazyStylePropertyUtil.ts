import axios from 'axios';
import { ComponentPropertyDefinition, StylePropertyDefinition } from '../../types/common';

export function lazyStylePropertyLoadFunction(
	name: string,
	setStyleProperties: (styleProperties: Array<StylePropertyDefinition>) => void,
	styleDefaults: Map<string, string>,
	props: Array<ComponentPropertyDefinition>,
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

			const valuesNames = props?.filter(e => e.enumValues).map(e => ({
				propName: e.name, enumValues: e.enumValues!.map(x => ({
					sel: x.name,
					name: removeSpecialCharsAndMakeFirstLetterCap(x.name)
				}))
			}));

			const styleProps = inflateStyleProps(res.data, valuesNames);
			setStyleProperties(styleProps);

			styleProps
				?.filter((e: any) => !!e.dv)
				?.map(({ n: name, dv: defaultValue }: any) =>
					styleDefaults.set(name, defaultValue),
				);
		});
	};
}

export function lazyStylePropURL(name: string) {
	return `${globalThis.cdnPrefix ? 'https://' + globalThis.cdnPrefix + '/js/dist' : ''}/styleProperties/${name}.json`;
}

export function lazyCSSURL(name: string) {
	return `${globalThis.cdnPrefix ? 'https://' + globalThis.cdnPrefix + '/js/dist' : ''}/css/${name}.css`;
}

export function findPropertyDefinitions(propertiesDefinition: Array<ComponentPropertyDefinition>, ...props: Array<string>): { [key: string]: ComponentPropertyDefinition } {

	const defs: { [key: string]: ComponentPropertyDefinition } = {};
	const propsSet = new Set<string>(props);
	for (const def of propertiesDefinition) {
		if (propsSet.has(def.name)) {
			defs[def.name] = def;
		}
	}
	return defs;
}

export function inflateStyleProps(props: Array<StylePropertyDefinition>, valuesNames: Array<{ propName: string, enumValues: Array<{ sel: string, name: string }> }>): Array<StylePropertyDefinition> {

	if (!valuesNames?.length) return props;

	return props.flatMap(prop => {

		const origProp = { ...prop };
		const spv = origProp.spv;
		delete origProp.spv;

		const usedEnumNames = valuesNames.filter(({ propName }) => origProp.n.indexOf(`<${propName}>`) !== -1);

		let result: Array<StylePropertyDefinition> = [origProp];

		if (!usedEnumNames.length) return result;

		for (let i = 0; i < usedEnumNames.length; i++) {

			const sprayArray: Array<StylePropertyDefinition> = [];
			for (let j = 0; j < usedEnumNames[i].enumValues.length; j++) {

				for (let k = 0; k < result.length; k++) {
					const current = { ...result[k] };
					current.n = current.n.replace(`<${usedEnumNames[i].propName}>`, usedEnumNames[i].enumValues[j].name);
					current.sel = current.sel?.replace(`<${usedEnumNames[i].propName}>`, `.${usedEnumNames[i].enumValues[j].sel}`);
					current.evu = current.evu ? [...current.evu, usedEnumNames[i].enumValues[j].sel] : [usedEnumNames[i].enumValues[j].sel];

					current.dv = spv?.[current.evu.join('-')] ?? (result[k].evu ? spv?.[result[k].evu!.join('-')] : undefined) ?? result[k].dv;

					sprayArray.push(current);
				}
			}
			result = sprayArray;
		}

		return result;
	});
}

function removeSpecialCharsAndMakeFirstLetterCap(name: string) {
	const x = name.replace(/[^a-zA-Z0-9]/g, '');
	return x[0].toUpperCase() + x.slice(1);
}
