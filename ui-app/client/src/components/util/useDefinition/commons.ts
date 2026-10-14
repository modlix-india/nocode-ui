import { TokenValueExtractor } from '@fincity/kirun-js';
import { STORE_PREFIX } from '../../../constants';
import { getDataFromPath, getData, getPathFromLocation } from '../../../context/StoreContext';
import {
	ComponentDefinition,
	ComponentPropertyDefinition,
	ComponentStylePropertyDefinition,
	LocationHistory,
	ComponentDefinitionValues,
	StyleResolution,
	ComponentResoltuions,
} from '../../../types/common';
import { makePropertiesObject } from '../make';

// Every bindingPath slot a component may declare. Kept in step with
// getPaths.ts, which watches the same list.
const BINDING_PATH_KEYS = [
	'bindingPath',
	'bindingPath2',
	'bindingPath3',
	'bindingPath4',
	'bindingPath5',
	'bindingPath6',
	'bindingPath7',
	'bindingPath8',
	'bindingPath9',
	'bindingPath10',
] as const;

/** Each declared bindingPath resolved to the string the component will use. */
function resolveBindingPaths(
	definition: ComponentDefinition,
	locationHistory: Array<LocationHistory>,
	tokenExtractors: TokenValueExtractor[],
): string | undefined {
	let resolved: string | undefined;
	for (const key of BINDING_PATH_KEYS) {
		const loc = (definition as any)[key];
		if (!loc) continue;
		let path: string;
		try {
			path = getPathFromLocation(loc, locationHistory, ...tokenExtractors);
		} catch (err) {
			// A half-written expression must not take the component down. An
			// unresolvable path is recorded as such, so it still differs from the
			// path that eventually resolves and the re-render still happens.
			path = `!${String(err)}`;
		}
		resolved = (resolved ? resolved + '\u0000' : '') + key + '=' + path;
	}
	return resolved;
}

/**
 * Every field of every validation rule, resolved, as one string.
 *
 * `makePropertiesObject` hands a rule to the component as its raw definition
 * (`condition`, `message` and so on are still unevaluated properties); the
 * component's validate effect evaluates them, and reruns only when its value or
 * that `validation` array changes. So a rule gated on the store, such as
 * `condition: Page.isInvalidOtp = true` written by the page after a failed
 * verify, never showed: the store write reached the listener, the resolved state
 * was deep-equal to the last one, the bail-out skipped the render and the
 * effect never saw the new condition. Holding the resolved fields here makes
 * that write a state change, so the component renders and revalidates.
 */
function resolveValidationState(
	definition: ComponentDefinition,
	locationHistory: Array<LocationHistory>,
	tokenExtractors: TokenValueExtractor[],
): string | undefined {
	const rules = (definition.properties as any)?.validation;
	if (!rules || typeof rules !== 'object') return undefined;

	let resolved: string | undefined;
	for (const [key, rule] of Object.entries(rules)) {
		const fields = (rule as any)?.property?.value;
		if (!fields || typeof fields !== 'object') continue;
		for (const [field, prop] of Object.entries(fields)) {
			if (!prop || typeof prop !== 'object') continue;
			let text: string;
			try {
				const value = getData(prop as any, locationHistory, ...tokenExtractors);
				text = value === undefined ? 'undefined' : JSON.stringify(value);
			} catch (err) {
				text = `!${String(err)}`;
			}
			resolved = (resolved ? resolved + '\u0000' : '') + key + '.' + field + '=' + text;
		}
	}
	return resolved;
}

export function createNewState(
	definition: ComponentDefinition,
	properties: Array<ComponentPropertyDefinition>,
	stylePropertiesDefinition: ComponentStylePropertyDefinition,
	locationHistory: Array<LocationHistory>,
	tokenExtractors: TokenValueExtractor[],
) {
	const def: ComponentDefinitionValues = { key: definition.key };
	def.properties = makePropertiesObject(
		properties,
		definition.properties,
		locationHistory,
		tokenExtractors,
	);

	// Where each binding currently POINTS, not what is at the other end.
	//
	// A binding path can be an expression, and an expression can move:
	// `'...links["{{Page.favIconKey}}"].href'` addresses a different entry the
	// moment `favIconKey` is written. The component reads that path on render
	// and subscribes to it, so if it does not re-render it stays subscribed to
	// wherever the path pointed on mount - which, on the first render, is
	// usually nowhere.
	//
	// It re-renders only when this object differs from the previous one, and
	// until now the object held resolved PROPERTIES and styles. A path move
	// changes neither, so the bail-out below swallowed it. sitezump's favicon
	// field was the symptom: the value was in the store, the path was right and
	// the listener worked, and the input stayed empty because it was still
	// listening to the path from before `favIconKey` existed.
	def.bindingPaths = resolveBindingPaths(definition, locationHistory, tokenExtractors);

	// Same reason for validation rules gated on the store: see resolveValidationState.
	def.validationState = resolveValidationState(definition, locationHistory, tokenExtractors);

	if (definition.styleProperties) {
		const devices = getDataFromPath(`${STORE_PREFIX}.devices`, locationHistory);
		const pseudoStates: { [key: string]: any } = { '': { defaultOne: {}, conditioned: [] } };
		for (const ecs of Object.values(definition.styleProperties)) {
			if (ecs.condition) {
				let value = false;

				value = getData(ecs.condition, locationHistory, ...tokenExtractors) as boolean;

				if (!value) continue;
			}

			const pTargets = processTargets(
				ecs.resolutions ?? {},
				devices,
				stylePropertiesDefinition,
				locationHistory,
				tokenExtractors,
			);
			if (!pTargets) continue;

			const state = ecs.pseudoState ?? '';
			if (!pseudoStates[state]) pseudoStates[state] = { defaultOne: {}, conditioned: [] };

			if (ecs.condition) pseudoStates[state].conditioned.push(pTargets);
			else pseudoStates[state].defaultOne = pTargets;
		}

		const consolidateStates: any = {};
		for (const [state, object] of Object.entries(pseudoStates)) {
			let targetStyles = object.defaultOne;
			for (const eachConditionTargets of object.conditioned) {
				for (const [target, styleObj] of Object.entries(eachConditionTargets)) {
					if (targetStyles[target])
						targetStyles[target] = { ...targetStyles[target], ...(styleObj as any) };
					else targetStyles[target] = styleObj as any;
				}
			}
			consolidateStates[state] = targetStyles;
		}

		def.stylePropertiesWithPseudoStates = consolidateStates;
	}
	if (def.stylePropertiesWithPseudoStates?.['']) {
		const targets = Object.keys(def.stylePropertiesWithPseudoStates['']);
		for (const target of targets) {
			const targetStyles = Object.keys(def.stylePropertiesWithPseudoStates[''][target]);
			for (const style of targetStyles) {
				let index = style.indexOf(':');
				if (index === -1) continue;
				const pseudoState = style.substring(index + 1);
				if (!def.stylePropertiesWithPseudoStates[pseudoState])
					def.stylePropertiesWithPseudoStates[pseudoState] = {};
				if (!def.stylePropertiesWithPseudoStates[pseudoState][target])
					def.stylePropertiesWithPseudoStates[pseudoState][target] = {};

				def.stylePropertiesWithPseudoStates[pseudoState][target][
					style.substring(0, index)
				] = def.stylePropertiesWithPseudoStates[''][target][style];
				delete def.stylePropertiesWithPseudoStates[''][target][style];
			}
		}
	}

	return def;
}

const ORDER_OF_RESOLUTION = [
	StyleResolution.MOBILE_POTRAIT_SCREEN,
	StyleResolution.MOBILE_LANDSCAPE_SCREEN,
	StyleResolution.TABLET_POTRAIT_SCREEN,
	StyleResolution.TABLET_LANDSCAPE_SCREEN,
	StyleResolution.DESKTOP_SCREEN,
	StyleResolution.WIDE_SCREEN,
	StyleResolution.DESKTOP_SCREEN_SMALL,
	StyleResolution.TABLET_LANDSCAPE_SCREEN_SMALL,
	StyleResolution.TABLET_POTRAIT_SCREEN_SMALL,
	StyleResolution.MOBILE_LANDSCAPE_SCREEN_SMALL,
	StyleResolution.DESKTOP_SCREEN_ONLY,
	StyleResolution.TABLET_LANDSCAPE_SCREEN_ONLY,
	StyleResolution.TABLET_POTRAIT_SCREEN_ONLY,
	StyleResolution.MOBILE_LANDSCAPE_SCREEN_ONLY,
	StyleResolution.MOBILE_POTRAIT_SCREEN_ONLY,
];

export function processTargets(
	resolutions: ComponentResoltuions = {},
	devices: any,
	stylePropertiesDefinition: ComponentStylePropertyDefinition,
	locationHistory: Array<LocationHistory>,
	tokenExtractors: TokenValueExtractor[],
): any {
	let style = resolutions.ALL ? { ...resolutions.ALL } : {};

	if (devices) {
		for (const res of ORDER_OF_RESOLUTION)
			if (devices[res]) style = { ...style, ...resolutions[res] };
	}

	const finStyle: any = {};

	for (let [prop, value] of Object.entries(style)) {
		const v = getData(value, locationHistory, ...tokenExtractors);

		if (!v) continue;

		const index = prop.indexOf('-');
		let prefix = 'comp';
		if (index !== -1) {
			prefix = prop.substring(0, index);
			prop = prop.substring(index + 1);
		}

		if (!finStyle[prefix]) finStyle[prefix] = {};
		finStyle[prefix][prop] = v;
	}
	return finStyle;
}
