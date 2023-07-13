import { ExpressionEvaluator, isNullValue, TokenValueExtractor } from '@fincity/kirun-js';
import { SCHEMA_VALIDATION } from '../../constants';
import {
	ComponentDefinition,
	ComponentProperty,
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	DataLocation,
} from '../../types/common';
import { ComponentStyle, StyleResolution } from '../../types/common';
import { Validation } from '../../types/validation';

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

	getPrefix(): string {
		return this.prefix;
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
						const set = getPathsFrom(iprop, evaluatorMaps).values();
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
	]) {
		let x = bp as
			| 'bindingPath'
			| 'bindingPath2'
			| 'bindingPath3'
			| 'bindingPath4'
			| 'bindingPath5'
			| 'bindingPath6';
		if (definition[x]) {
			const p = getPathsFrom(definition[x]!, evaluatorMaps);
			if (p) p.forEach(e => paths.push(e));
		}
	}
	return paths;
}
