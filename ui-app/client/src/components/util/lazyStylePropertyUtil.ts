import axios from 'axios';
import { StylePropertyDefinition } from '../../types/common';

export function lazyStylePropertyLoadFunction(
	name: string,
	setStyleProperties: (styleProperties: Array<StylePropertyDefinition>) => void,
	styleDefaults: Map<string, string>,
) {
	return () =>
		axios
			.get(
				`${window.cdnPrefix ? 'https://' + window.cdnPrefix + '/js/dist' : ''}/styleProperties/${name}.json`,
			)
			.then((res: any) => {
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
}
