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
				if (!res?.data) return;
				setStyleProperties(res.data);

				res.data
					.filter((e: any) => !!e.defaultValue)
					.map(({ name, defaultValue }: any) => styleDefaults.set(name, defaultValue));
			});
}
