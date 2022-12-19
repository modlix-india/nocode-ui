import {
	TokenValueExtractor,
	OutputMapTokenValueExtractor,
	ContextTokenValueExtractor,
	ContextElement,
} from '@fincity/kirun-js';
import { StoreExtractor } from '../../../src/context/StoreContext';
import { getPathsFrom } from '../../../src/components/util/getPaths';

test('Testing path extractions', () => {
	const se: StoreExtractor = new StoreExtractor({}, 'Store.');
	const ce: ContextTokenValueExtractor = new ContextTokenValueExtractor(
		new Map<string, ContextElement>([['d', new ContextElement(undefined, 'f')]]),
	);
	const ste: OutputMapTokenValueExtractor = new OutputMapTokenValueExtractor(
		new Map<string, Map<string, Map<string, any>>>([
			['loop', new Map([['iteration', new Map([['index', 3]])]])],
		]),
	);
	const ev = new Map<string, TokenValueExtractor>([
		[se.getPrefix(), se],
		[ce.getPrefix(), ce],
		[ste.getPrefix(), ste],
	]);

	let paths = getPathsFrom('Store.this ?? Store.that', ev);
	expect(paths).toStrictEqual(['Store.that', 'Store.this']);

	paths = getPathsFrom(
		'Context.a[Steps.loop.iteration.index][Steps.loop.iteration.index + 1]',
		ev,
	);
	expect(paths).toStrictEqual(['Steps.loop.iteration.index', 'Context.a[3][4]']);

	paths = getPathsFrom('Context.e = null ? Context.c.a : 3 ', ev);
	expect(paths).toStrictEqual(['Context.e', 'Context.c.a']);

	paths = getPathsFrom('Context.{{Context.d}}.a + {{Context.{{Context.d}}.c.x}}', ev);
	console.log(paths);
});
