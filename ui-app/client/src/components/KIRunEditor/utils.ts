import { setData } from '../../context/StoreContext';
import { LocationHistory, PageDefinition } from '../../types/common';
import { runEvent } from '../util/runEvent';

/**
 * A ParameterReference's `type` is a string in the KIRun schema (enums EXPRESSION
 * | VALUE), but plenty of stored functions carry it as a single-element array,
 * `["EXPRESSION"]` — that is what modlix-mcp and the appbuilder generator tools
 * have been writing. The runtime does not care: KIRuntime compares with `==`, and
 * `['EXPRESSION'] == 'EXPRESSION'` is true in JS.
 *
 * The editor in @fincity/kirun-ui compares with `===`. An array-typed reference
 * therefore renders as an empty VALUE box and, on the next save of that function,
 * is written back as `{type: 'VALUE', value: null}` — the expression is gone, with
 * no warning, and the save re-keys every reference so a version diff shows the
 * loss as unrelated churn. It cost the appbuilder workspace page its entire
 * onLoad on 2026-09-02.
 *
 * So unwrap on the way in. Only objects shaped like a ParameterReference (`key`
 * plus `order`) are touched; `schema.type` arrays are a different thing and are
 * correct as arrays.
 */
export function normalizeParameterTypes<T>(def: T): T {
	if (!def || typeof def !== 'object') return def;

	let changed = false;

	const walk = (node: any): any => {
		if (Array.isArray(node)) return node.map(walk);
		if (!node || typeof node !== 'object') return node;

		const out: any = {};
		for (const [key, value] of Object.entries(node)) {
			if (
				key === 'type' &&
				Array.isArray(value) &&
				value.length === 1 &&
				(value[0] === 'EXPRESSION' || value[0] === 'VALUE') &&
				'key' in node &&
				'order' in node
			) {
				out[key] = value[0];
				changed = true;
				continue;
			}
			out[key] = walk(value);
		}
		return out;
	};

	const result = walk(def);
	return changed ? result : def;
}

export function savePersonalizationCurry(
	personalizationPath: string,
	pageName: string,
	onChangePersonalization: any,
	locationHistory: Array<LocationHistory>,
	pageDefinition: PageDefinition,
) {
	if (!onChangePersonalization) return (key: string, value: any) => {};
	let handle: any = -1;

	return (key: string, value: any) => {
		if (handle !== -1) clearTimeout(handle);

		setData(`${personalizationPath}.${key}`, value, pageName);
		handle = setTimeout(() => {
			if (typeof onChangePersonalization == 'function') {
				onChangePersonalization();
				return;
			}

			(async () =>
				await runEvent(
					onChangePersonalization,
					'pageEditorSave',
					pageName,
					locationHistory,
					pageDefinition,
				))();
		}, 2000);
	};
}
