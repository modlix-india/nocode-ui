import axios from 'axios';
import { StylePropertyDefinition } from '../../types/common';

export function lazyStylePropertyLoadFunction(
	name: string,
	setStyleProperties: (styleProperties: Array<StylePropertyDefinition>) => void,
	styleDefaults: Map<string, string>,
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
			setStyleProperties(res.data);

			res.data
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
