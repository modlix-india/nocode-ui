import { deepEqual } from '@fincity/kirun-js';

export function getSelectedKeys(
	data:
		| (
				| {
						label: any;
						value: any;
						key: any;
				  }
				| undefined
		  )[]
		| undefined,
	selected: any,
	isMultiselect: boolean = false,
) {
	if (data === undefined || selected === undefined) return;
	if (isMultiselect && Array.isArray(selected)) {
		let keys: Array<any> = selected
			.map(e => {
				return data.find(each => deepEqual(e, each?.value))?.key;
			})
			.filter(e => !!e);
		return keys;
	}
	return data.find(each => deepEqual(each?.value, selected))?.key;
}
