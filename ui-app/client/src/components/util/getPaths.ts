import { ExpressionEvaluator, isNullValue, TokenValueExtractor } from '@fincity/kirun-js';
import { ComponentProperty, DataLocation } from '../../types/common';
import { ComponentStyle, StyleResolution } from '../../types/common';

class PathExtractor extends TokenValueExtractor {
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

export function getPathsFromComponentDefinition(
	properties: { [key: string]: ComponentProperty<any> } | undefined,
	styleProperties: ComponentStyle | undefined,
	evaluatorMaps: Map<string, TokenValueExtractor>,
): Array<string> {
	const paths: Set<string> = new Set();

	if (properties) {
		for (const prop of Object.values(properties)) {
			const set = getPathsFrom(prop, evaluatorMaps).values();
			let path: IteratorResult<string, any>;
			while ((path = set.next()) !== undefined && !path.done) paths.add(path.value);
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
