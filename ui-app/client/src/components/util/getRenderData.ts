import {
	ExpressionEvaluator,
	isNullValue,
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

const isPlainObject = (v: any) => typeof v === 'object' && v !== null && !Array.isArray(v);

// The test getRenderData applies to each entry of an OBJECT_OF_* source.
const OBJECT_ENTRY_TESTS: Record<string, (v: any) => boolean> = {
	OBJECT_OF_PRIMITIVES: v => typeof v !== 'object',
	OBJECT_OF_OBJECTS: isPlainObject,
	OBJECT_OF_LISTS: Array.isArray,
};

/**
 * Brings data that may hold only SOME items -- the selected one(s) of a dropdown, say --
 * into the full shape `dataType` describes, so getRenderData reads it as it reads `data`.
 * Accepted, for every data type: the full shape itself, one item of it, or an array of
 * single items (or of partial shapes, for the OBJECT_OF_* types, which are merged).
 *
 * An item given on its own in an OBJECT_OF_* type has no map key, so it is keyed by its
 * position. That is harmless when selection is by KEY or OBJECT, but an INDEX selection IS
 * the map key, so a lone item cannot match one; pass `{ key: item }` instead. An object
 * whose every value is itself an entry (a row with only object fields, in
 * OBJECT_OF_OBJECTS) reads as the map, not as one row.
 */
export function toDataTypeShape(
	source: any,
	dataType:
		| 'LIST_OF_STRINGS'
		| 'LIST_OF_OBJECTS'
		| 'LIST_OF_LISTS'
		| 'OBJECT_OF_PRIMITIVES'
		| 'OBJECT_OF_OBJECTS'
		| 'OBJECT_OF_LISTS',
): any {
	if (isNullValue(source)) return undefined;

	if (dataType === 'LIST_OF_STRINGS' || dataType === 'LIST_OF_OBJECTS')
		return Array.isArray(source) ? source : [source];

	// A list is one item here, so only an array made entirely of lists is the full shape.
	if (dataType === 'LIST_OF_LISTS')
		return Array.isArray(source) && source.every(Array.isArray) ? source : [source];

	const isEntry = OBJECT_ENTRY_TESTS[dataType];
	if (!isEntry) return source;

	const isMap = (v: any) => {
		if (!isPlainObject(v)) return false;
		const values = Object.values(v);
		return values.length > 0 && values.every(isEntry);
	};

	if (isMap(source)) return source;

	// An array is a list of items, except in OBJECT_OF_LISTS, where an array is itself an
	// item unless every element of it is a list or a partial map.
	const isListOfItems =
		Array.isArray(source) &&
		(!isEntry(source) ||
			(source.length > 0 && source.every(e => Array.isArray(e) || isMap(e))));

	return (isListOfItems ? source : [source]).reduce(
		(acc: Record<string, any>, item: any, index: number) => {
			if (isMap(item)) Object.assign(acc, item);
			else if (isEntry(item)) acc[`${index}`] = item;
			return acc;
		},
		{},
	);
}
