import { ExpressionEvaluator, isNullValue, TokenValueExtractor } from '@fincity/kirun-js';
import {
	ComponentDefinition,
	ComponentMultiProperty,
	ComponentProperty,
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentStyle,
	DataLocation,
	LocationHistory,
	StyleResolution,
} from '../../types/common';
import { Validation } from '../../types/validation';
import { ParentExtractor, ParentExtractorForRunEvent } from '../../context/ParentExtractor';
import { getDataFromPath, PageStoreExtractor ,UrlDetailsExtractor} from '../../context/StoreContext';
import { GLOBAL_CONTEXT_NAME } from '../../constants';

export class PathExtractor extends TokenValueExtractor {
	private prefix: string;
	private paths: Set<string>;
	private orig: TokenValueExtractor;

	constructor(prefix: string, orig: TokenValueExtractor, paths: Set<string>) {
		super();
		this.prefix = prefix;
		this.orig = orig;
		this.paths = paths;
	}

	// Forward setValuesMap to the wrapped extractor so it can resolve dynamic bracket indices
	public override setValuesMap(valuesMap: Map<string, TokenValueExtractor>): void {
		super.setValuesMap(valuesMap);
		this.orig.setValuesMap(valuesMap);
	}

	protected getValueInternal(token: string) {
		// Reconstruct path with proper bracket notation and quotes
		const reconstructedPath = this.reconstructPath(token);
		this.paths.add(reconstructedPath);
		return this.orig.getValue(token);
	}

	private reconstructPath(token: string): string {
		// Split the path using the enhanced splitPath that understands bracket notation
		const parts = TokenValueExtractor.splitPath(token);

		if (parts.length === 0) return token;
		if (parts.length === 1) return parts[0];

		// Reconstruct with proper separators
		let result = parts[0];
		for (let i = 1; i < parts.length; i++) {
			const part = parts[i];

			// Check if part contains bracket notation (e.g., "obj[key]")
			const bracketIndex = part.indexOf('[');
			if (bracketIndex > 0) {
				// Part like "obj[mail.smtp.otp]" - split into property and bracket parts
				const propName = part.substring(0, bracketIndex);
				const bracketPart = part.substring(bracketIndex);

				// Add property with dot
				result += '.' + propName;

				// Process bracket part
				const key = bracketPart.substring(1, bracketPart.length - 1);
				if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
					// Has quotes - normalize to double quotes
					const unquotedKey = key.substring(1, key.length - 1);
					result += `["${unquotedKey}"]`;
				} else if (key.includes('.') || !key.match(/^\d+$/)) {
					// Key contains dots or is not a pure number, wrap in quotes
					result += `["${key}"]`;
				} else {
					result += bracketPart; // Pure number, keep as-is
				}
			} else if (part.startsWith('[')) {
				// Pure bracket notation at start
				const key = part.substring(1, part.length - 1);
				if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
					// Has quotes - normalize to double quotes
					const unquotedKey = key.substring(1, key.length - 1);
					result += `["${unquotedKey}"]`;
				} else if (key.includes('.') || !key.match(/^\d+$/)) {
					// Key contains dots or is not a pure number, wrap in quotes
					result += `["${key}"]`;
				} else {
					result += part; // Pure number, keep as-is
				}
			} else if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("'") && part.endsWith("'"))) {
				// Part has quotes, so it needs bracket notation - normalize to double quotes
				const unquotedPart = part.substring(1, part.length - 1);
				result += `["${unquotedPart}"]`;
			} else {
				// Regular property access with dot
				result += '.' + part;
			}
		}
		return result;
	}

	public getPaths() {
		return this.paths;
	}

	public getPrefix(): string {
		return this.prefix;
	}

	public getStore(): any {
		this.paths.add(this.prefix.substring(0, this.prefix.length - 1));
		return undefined;
	}
}

export class ParentPathExtractor extends TokenValueExtractor {
	private paths: Set<string>;
	private history: LocationHistory[];

	constructor(parentExtractor: TokenValueExtractor, paths: Set<string>) {
		super();
		this.paths = paths;
		const ex: ParentExtractor = parentExtractor as ParentExtractor;
		this.history = ex.getHistory();
	}

	public getValue(token: string) {
		const value = super.getValue(token);

		if (token.endsWith('.__index') && value?.endsWith?.('Parent')) {
			let count = 0;
			let index = 0;
			while ((index = value.indexOf('Parent', index)) !== -1) {
				count++;
				index++;
			}
			// During path extraction, if index is not available, return 0 as a placeholder
			// This allows the expression to be evaluated for path discovery
			return this.history[this.history.length - count]?.index ?? 0;
		}

		return value;
	}

	protected getValueInternal(token: string) {
		const { path, lastHistory } = this.getPath(token);
		this.paths.add(path);

		const value = getDataFromPath(
			path,
			this.history.length === 1 ? [] : this.history.slice(0, this.history.length - 1),
			PageStoreExtractor.getForContext(lastHistory.pageName ?? GLOBAL_CONTEXT_NAME),
		);
		
		// During path extraction, return 0 as placeholder for undefined/null values
		// This allows numeric expressions like Parent.id < 10 to evaluate without errors
		return value ?? 0;
	}

	public getPath(token: string): { path: string; lastHistory: LocationHistory } {
		let currentHistory = this.history;

		do {
			let { path, lastHistory } = this.getPathInternal(token, currentHistory);
			if (!path.startsWith('Parent.')) return { path, lastHistory };
			token = path;
			currentHistory = currentHistory.slice(0, currentHistory.length - 1);
		} while (true);
	}

	public getPathInternal(
		token: string,
		locationHistory: LocationHistory[],
	): { path: string; lastHistory: LocationHistory } {
		const parts: string[] = TokenValueExtractor.splitPath(token);

		let pNum: number = 0;
		while (parts[pNum] === 'Parent') pNum++;

		const lastHistory = locationHistory[locationHistory.length - pNum];
		let path = '';

		// Reconstruct path preserving bracket notation
		const remainingParts = parts.slice(pNum);
		let pathSuffix: string = '';
		for (let i = 0; i < remainingParts.length; i++) {
			const part = remainingParts[i];
			if (part.startsWith('[') || part.startsWith('["') || part.startsWith("['")) {
				// Already has bracket notation
				pathSuffix += part;
			} else if (i === 0) {
				// First part, no separator needed
				pathSuffix = part;
			} else {
				// Add dot separator for regular property access
				pathSuffix += '.' + part;
			}
		}

		if (typeof lastHistory.location === 'string') {
			path = pathSuffix ? `${lastHistory.location}.${pathSuffix}` : lastHistory.location;
		} else {
			const baseLocation =
				lastHistory.location.type === 'VALUE'
					? lastHistory.location.value
					: lastHistory.location.expression;
			path = pathSuffix ? `${baseLocation}.${pathSuffix}` : (baseLocation ?? '');
		}

		return { path, lastHistory };
	}

	public getPaths() {
		return this.paths;
	}

	public getPrefix(): string {
		return 'Parent.';
	}

	public getStore(): any {
		return undefined;
	}
}

// Normalize path quotes to double quotes
export function normalizePath(path: string): string {
	// Replace single-quoted bracket notation with double-quoted
	return path.replaceAll(/\['([^']+)'\]/g, '["$1"]');
}

export function getPathsFrom<T>(
	anything: string | DataLocation | ComponentProperty<T>,
	evaluatorMaps: Map<string, TokenValueExtractor>,
): Set<string> {
	if (!anything) return new Set();

	let expression: string | undefined = undefined;

	if (typeof anything === 'string') expression = anything;
	else if ('type' in anything) {
		const dl = anything as DataLocation;
		if (dl.type === 'VALUE')
			return isNullValue(dl.value) ? new Set() : new Set<string>([normalizePath(dl.value!)]);
		expression = dl.expression;
	} else {
		const cp = anything as ComponentProperty<T>;
		if (isNullValue(cp.location)) return new Set();
		const loc = cp.location!;
		if (loc.type === 'VALUE')
			return isNullValue(loc.value) ? new Set() : new Set<string>([normalizePath(loc.value!)]);
		expression = loc.expression;
	}

	if (isNullValue(expression)) return new Set();

	const ee = new ExpressionEvaluator(expression!);
	const map: Map<string, TokenValueExtractor> = new Map();

	const retSet = new Set<string>();

	evaluatorMaps.forEach(x => {
		if (x.getPrefix() === 'Parent.') {
			map.set(x.getPrefix(), new ParentPathExtractor(x, retSet));
			return;
		}
		map.set(x.getPrefix(), new PathExtractor(x.getPrefix(), x, retSet));
	});

	try {
		ee.evaluate(map);
	} catch (err) {}
	return retSet;
}

export function getPathsFromComponentProperties(
	properties:
		| {
				[key: string]:
					| ComponentProperty<any>
					| ComponentMultiProperty<any>
					| { [key: string]: ComponentProperty<any> }
					| { [key: string]: Validation };
		  }
		| undefined,
	styleProperties: ComponentStyle | undefined,
	evaluatorMaps: Map<string, TokenValueExtractor>,
	propDefMap: { [key: string]: ComponentPropertyDefinition },
): Array<string> {
	const paths: Set<string> = new Set();

	if (properties) {
		for (const [key, prop] of Object.entries(properties)) {
			if (propDefMap[key]?.multiValued) {
				for (const iprop of Object.values(prop)) {
					if (
						propDefMap[key].editor === ComponentPropertyEditor.VALIDATION ||
						propDefMap[key].editor === ComponentPropertyEditor.ANIMATION ||
						propDefMap[key].editor === ComponentPropertyEditor.ANIMATIONOBSERVER
					) {
						for (const vprop of Object.values(iprop?.property?.value ?? {})) {
							if (typeof vprop !== 'object') continue;
							const set = getPathsFrom(
								vprop as ComponentProperty<any>,
								evaluatorMaps,
							).values();
							let path: IteratorResult<string, any>;
							while ((path = set.next()) !== undefined && !path.done)
								paths.add(path.value);
						}
					} else {
						const set = getPathsFrom(iprop.property, evaluatorMaps).values();
						let path: IteratorResult<string, any>;
						while ((path = set.next()) !== undefined && !path.done)
							paths.add(path.value);
					}
				}
			} else {
				const set = getPathsFrom(prop, evaluatorMaps).values();
				let path: IteratorResult<string, any>;
				while ((path = set.next()) !== undefined && !path.done) paths.add(path.value);
			}
		}
	}

	let hasOtherResolutions = false;
	if (styleProperties) {
		for (const condStyle of Object.values(styleProperties)) {
			if (condStyle.condition) {
				const set = getPathsFrom(condStyle.condition, evaluatorMaps).values();
				let path: IteratorResult<string, any>;
				while ((path = set.next()) !== undefined && !path.done) paths.add(path.value);
			}
			if (condStyle.resolutions) {
				for (const resEntry of Object.entries(condStyle.resolutions)) {
					hasOtherResolutions =
						hasOtherResolutions || resEntry[0] !== StyleResolution.ALL;
					for (const prop of Object.values(resEntry[1])) {
						const set = getPathsFrom(
							prop as ComponentProperty<any>,
							evaluatorMaps,
						).values();
						let path: IteratorResult<string, any>;
						while ((path = set.next()) !== undefined && !path.done)
							paths.add(path.value);
					}
				}
			}
		}
	}

	if (hasOtherResolutions) paths.add('Store.devices');

	return Array.from(paths);
}

export function getPathsFromComponentDefinition(
	definition: ComponentDefinition,
	evaluatorMaps: Map<string, TokenValueExtractor>,
	propDefMap: any,
) {
	const paths = getPathsFromComponentProperties(
		definition.properties,
		definition.styleProperties,
		evaluatorMaps,
		propDefMap,
	);

	for (let bp of [
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
	]) {
		let x = bp as
			| 'bindingPath'
			| 'bindingPath2'
			| 'bindingPath3'
			| 'bindingPath4'
			| 'bindingPath5'
			| 'bindingPath6'
			| 'bindingPath7'
			| 'bindingPath8'
			| 'bindingPath9'
			| 'bindingPath10';
		if (definition[x]) {
			const p = getPathsFrom(definition[x]!, evaluatorMaps);
			if (p) p.forEach(e => paths.push(e));
		}
	}
	return paths;
}
