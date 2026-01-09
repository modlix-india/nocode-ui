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

	protected getValueInternal(token: string) {
		this.paths.add(token);
		return this.orig.getValue(token);
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
			return this.history[this.history.length - count]?.index ?? value;
		}

		return value;
	}

	protected getValueInternal(token: string) {
		const { path, lastHistory } = this.getPath(token);
		this.paths.add(path);

		return getDataFromPath(
			path,
			this.history.length === 1 ? [] : this.history.slice(0, this.history.length - 1),
			PageStoreExtractor.getForContext(lastHistory.pageName ?? GLOBAL_CONTEXT_NAME),
		);
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
		const parts: string[] = token.split(TokenValueExtractor.REGEX_DOT);

		let pNum: number = 0;
		while (parts[pNum] === 'Parent') pNum++;

		const lastHistory = locationHistory[locationHistory.length - pNum];
		let path = '';

		if (typeof lastHistory.location === 'string')
			path = `${lastHistory.location}.${parts.slice(pNum).join('.')}`;
		else
			path = `${
				lastHistory.location.type === 'VALUE'
					? lastHistory.location.value
					: lastHistory.location.expression
			}.${parts.slice(pNum).join('.')}`;

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
			return isNullValue(dl.value) ? new Set() : new Set<string>([dl.value!]);
		expression = dl.expression;
	} else {
		const cp = anything as ComponentProperty<T>;
		if (isNullValue(cp.location)) return new Set();
		const loc = cp.location!;
		if (loc.type === 'VALUE')
			return isNullValue(loc.value) ? new Set() : new Set<string>([loc.value!]);
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
