import { ExpressionEvaluator, TokenValueExtractor } from '@fincity/kirun-js';
import { getData, getDataFromLocation } from '../../context/StoreContext';
import { DataLocation } from '../../types/common';

export class ObjectExtractor extends TokenValueExtractor {
	private store: any;
	private prefix: string;
	constructor(store: any, prefix: string) {
		super();
		this.store = store;
		this.prefix = prefix;
	}
	protected getValueInternal(token: string) {
		let parts: string[] = token.split(TokenValueExtractor.REGEX_DOT);
		return this.retrieveElementFrom(token, parts, 1, this.store);
	}
	getPrefix(): string {
		return this.prefix;
	}
}

const getExtractionMap = (data: any) =>
	new Map<string, TokenValueExtractor>([[`Data.`, new ObjectExtractor(data, `Data.`)]]);

const getSelection = (
	selectionType: 'KEY' | 'INDEX' | 'OBJECT' | undefined,
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
};

export const getRenderData = (
	dataLocation: DataLocation,
	dataType:
		| 'LIST_OF_STRINGS'
		| 'LIST_OF_OBJECTS'
		| 'LIST_OF_LISTS'
		| 'OBJECT_OF_PRIMITIVES'
		| 'OBJECT_OF_OBJECTS'
		| 'OBJECT_OF_LISTS',
	locationHistory: Array<DataLocation | string>,
	pageExtractor: TokenValueExtractor,
	uniqueKeyType: 'KEY' | 'INDEX' | 'OBJECT',
	uniqueKey: string,
	selectionType: 'KEY' | 'INDEX' | 'OBJECT',
	selectionKey?: string,
	labelKeyType?: 'KEY' | 'INDEX' | 'OBJECT',
	labelKey?: string,
) => {
	const data = getDataFromLocation(dataLocation, locationHistory, pageExtractor) || [];
	let ev: ExpressionEvaluator = new ExpressionEvaluator(`Data.${selectionKey}`);
	if (dataType === 'LIST_OF_STRINGS') {
		const res = data.map((e: any, index: number) => {
			if (typeof e === 'string') {
				return {
					label: e,
					value: selectionType === 'INDEX' ? index : e,
					key: uniqueKeyType === 'INDEX' ? index : e,
				};
			}
		});
		return res;
	}

	if (dataType === 'LIST_OF_OBJECTS') {
		const res = data.map((e: any, index: number) => {
			if (typeof e === 'object') {
				return {
					label: getSelection('KEY', labelKey, e, 0),
					value: getSelection(selectionType, selectionKey, e, index),
					key: getSelection(uniqueKeyType, uniqueKey, e, index),
				};
			}
		});
		return res;
	}

	if (dataType === 'LIST_OF_LISTS') {
		const res = data.map((e: any, index: number) => {
			if (Array.isArray(e)) {
				return {
					label: getSelection('KEY', labelKey, e, 0),
					value: getSelection(selectionType, selectionKey, e, index),
					key: getSelection(uniqueKeyType, uniqueKey, e, index),
				};
			}
		});
		return res;
	}

	if (dataType === 'OBJECT_OF_PRIMITIVES') {
		const res = Object.entries(data).map(([k, v], index: number) => {
			if (typeof v !== 'object') {
				return {
					label: getSelection(labelKeyType, '', v, index),
					value: getSelection(selectionType, '', v, index),
					key: getSelection(uniqueKeyType, '', v, index),
				};
			}
		});
		return res;
	}

	if (dataType === 'OBJECT_OF_OBJECTS') {
		const res = Object.entries(data).map(([k, v], index: number) => {
			if (typeof v === 'object') {
				return {
					label: getSelection(labelKeyType, labelKey, v, k),
					value: getSelection(selectionType, selectionKey, v, k),
					key: getSelection(uniqueKeyType, uniqueKey, v, k),
				};
			}
		});
		return res;
	}

	if (dataType === 'OBJECT_OF_LISTS') {
		const res = Object.entries(data).map(([k, v], index: number) => {
			if (Array.isArray(v)) {
				return {
					label: getSelection(labelKeyType, labelKey, v, k),
					value: getSelection(selectionType, selectionKey, v, k),
					key: getSelection(uniqueKeyType, uniqueKey, v, k),
				};
			}
		});
		return res;
	}
};
