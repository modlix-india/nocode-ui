import {
	ExpressionEvaluator,
	ObjectValueSetterExtractor,
	TokenValueExtractor,
} from '@fincity/kirun-js';
import UUID from './uuid';

export const getExtractionMap = (data: any) =>
	new Map<string, TokenValueExtractor>([
		[`Data.`, new ObjectValueSetterExtractor(data ?? {}, `Data.`)],
	]);

const getSelection = (
	selectionType: 'KEY' | 'INDEX' | 'OBJECT' | 'RANDOM' | undefined,
	selectionKey: string | undefined,
	object: any,
	index: number | string,
) => {
	if (selectionType === 'KEY') {
		let ev: ExpressionEvaluator = new ExpressionEvaluator(`Data.${selectionKey}`);
		return ev.evaluate(getExtractionMap(object));
	}
	if (selectionType === 'INDEX') {
		return index;
	}
	if (selectionType === 'OBJECT') {
		return object;
	}

	if (selectionType === 'RANDOM') {
		return UUID();
	}
};

export function getRenderData<T>(
	data: any,
	dataType:
		| 'LIST_OF_STRINGS'
		| 'LIST_OF_OBJECTS'
		| 'LIST_OF_LISTS'
		| 'OBJECT_OF_PRIMITIVES'
		| 'OBJECT_OF_OBJECTS'
		| 'OBJECT_OF_LISTS',
	uniqueKeyType: 'KEY' | 'INDEX' | 'OBJECT' | 'RANDOM',
	uniqueKey: string,
	selectionType: 'KEY' | 'INDEX' | 'OBJECT',
	selectionKey?: string,
	labelKeyType?: 'KEY' | 'INDEX' | 'OBJECT',
	labelKey?: string,
): Array<{ label: any; value: any; key: any; originalObjectKey: any } | undefined> {
	if (dataType === 'LIST_OF_STRINGS') {
		if (Array.isArray(data)) {
			const res = data.map((e: any, index: number) => {
				if (typeof e === 'string') {
					return {
						label: e,
						value: selectionType === 'INDEX' ? index : e,
						key:
							uniqueKeyType === 'INDEX'
								? index
								: uniqueKeyType === 'RANDOM'
								? UUID()
								: e,
						originalObjectKey: index,
					};
				}
			});
			return res;
		}
		return [];
	}

	if (dataType === 'LIST_OF_OBJECTS') {
		if (Array.isArray(data)) {
			const res = data.map((e: any, index: number) => {
				if (typeof e === 'object') {
					return {
						label: getSelection('KEY', labelKey, e, 0),
						value: getSelection(selectionType, selectionKey, e, index),
						key: getSelection(uniqueKeyType, uniqueKey, e, index),
						originalObjectKey: index,
					};
				}
			});
			return res;
		}
		return [];
	}

	if (dataType === 'LIST_OF_LISTS') {
		if (Array.isArray(data)) {
			const res = data.map((e: any, index: number) => {
				if (Array.isArray(e)) {
					return {
						label: getSelection('KEY', labelKey, e, 0),
						value: getSelection(selectionType, selectionKey, e, index),
						key: getSelection(uniqueKeyType, uniqueKey, e, index),
						originalObjectKey: index,
					};
				}
			});
			return res;
		}
		return [];
	}

	if (dataType === 'OBJECT_OF_PRIMITIVES') {
		const res = Object.entries(data).map(([k, v], index: number) => {
			if (typeof v !== 'object') {
				return {
					label: getSelection(labelKeyType, '', v, k),
					value: getSelection(selectionType, '', v, k),
					key: getSelection(uniqueKeyType, '', v, k),
					originalObjectKey: k,
				};
			}
		});
		return res;
	}

	if (dataType === 'OBJECT_OF_OBJECTS') {
		const res = Object.entries(data).map(([k, v]) => {
			if (typeof v === 'object') {
				return {
					label: getSelection(labelKeyType, labelKey, v, k),
					value: getSelection(selectionType, selectionKey, v, k),
					key: getSelection(uniqueKeyType, uniqueKey, v, k),
					originalObjectKey: k,
				};
			}
		});
		return res;
	}

	if (dataType === 'OBJECT_OF_LISTS') {
		const res = Object.entries(data).map(([k, v]) => {
			if (Array.isArray(v)) {
				return {
					label: getSelection(labelKeyType, labelKey, v, k),
					value: getSelection(selectionType, selectionKey, v, k),
					key: getSelection(uniqueKeyType, uniqueKey, v, k),
					originalObjectKey: k,
				};
			}
		});
		return res;
	}

	return [];
}
