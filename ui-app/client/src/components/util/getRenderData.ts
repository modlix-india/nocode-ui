import { getData } from '../../context/StoreContext';

const getSelection = (
	selectionType: 'KEY' | 'INDEX' | 'KEY_IN_OBJECT' | 'OBJECT',
	object: any,
	index: number,
	valueKey: string,
) => {
	if (selectionType === 'INDEX') return index;
	if (selectionType === 'OBJECT') return object;
	if (selectionType === 'KEY_IN_OBJECT') return object[valueKey];

	return valueKey;
};

export const getRenderData = (
	dataType: DataTypes,
	labelKey: string,
	valueKey: string,
	dataLocation: any,
	selectionType: 'KEY' | 'INDEX' | 'KEY_IN_OBJECT' | 'OBJECT',
) => {
	if (dataType === DataTypes.ListOfStrings) {
		const data = getData(dataLocation) || [];
		const res = data.map((e: any) => {
			if (typeof e === 'string') {
				return { label: e, value: e };
			}
		});
		return res;
	}

	if (dataType === DataTypes.ListOfObjects) {
		const data = getData(dataLocation) || [];
		const res = data.map((e: any, index: number) => {
			if (typeof e === 'object') {
				return {
					label: e[labelKey],
					value: getSelection(selectionType, e, index, valueKey),
				};
			}
		});
		return res;
	}
};
