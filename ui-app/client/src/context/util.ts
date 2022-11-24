import { ExpressionEvaluator, isNullValue, TokenValueExtractor } from '@fincity/kirun-js';
import { ComponentProperty, DataLocation } from '../components/types';

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
): Array<string> {
	let expression: string | undefined = undefined;

	if (typeof anything === 'string') expression = anything;
	else if ('type' in anything) {
		const dl = anything as DataLocation;
		if (dl.type === 'VALUE') return isNullValue(dl.value) ? [] : [dl.value!];
		expression = dl.expression;
	} else {
		const cp = anything as ComponentProperty<T>;
		if (isNullValue(cp.location)) return [];
		const loc = cp.location!;
		if (loc.type === 'VALUE') return isNullValue(loc.value) ? [] : [loc.value!];
		expression = loc.expression;
	}

	if (isNullValue(expression)) return [];

	const ee = new ExpressionEvaluator(expression!);
	const map: Map<string, TokenValueExtractor> = new Map();

	const retSet = new Set<string>();

	evaluatorMaps.forEach(x => {
		map.set(x.getPrefix(), new PathExtractor(x.getPrefix(), x, retSet));
	});

	try {
		ee.evaluate(map);
	} catch (err) {}
	return Array.from(retSet);
}
