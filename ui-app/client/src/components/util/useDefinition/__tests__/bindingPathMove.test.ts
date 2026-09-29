import { deepEqual } from '@fincity/kirun-js';
import { createNewState } from '../commons';
import { PageStoreExtractor, setData } from '../../../../context/StoreContext';

const PAGE = 'siteSettings';
const KEY = '6dbd5bf5-c0e7-4bb5-a563-16c3ae46cd81';

/** The favicon field: its binding names the entry through another store value. */
const definition: any = {
	key: 'favIcon',
	type: 'FileSelector',
	properties: { label: { value: 'Favicon' } },
	bindingPath: {
		type: 'EXPRESSION',
		expression: `'Page.app.properties.links["{{Page.favIconKey}}"].href'`,
	},
};

const propertyDefs: any = [{ name: 'label', schema: { name: 'label' } }];

function state() {
	const pe = PageStoreExtractor.getForContext(PAGE);
	return createNewState(definition, propertyDefs, {} as any, [], [pe as any]);
}

beforeEach(() => {
	setData(`Store.pageData.${PAGE}.app.properties.links`, {
		[KEY]: { href: 'blck+1.svg' },
		other: { href: 'other.svg' },
	});
	setData(`Store.pageData.${PAGE}.favIconKey`, undefined, undefined, true);
});

describe('a binding path that moves', () => {
	// The bug: useDefinition re-renders only when this object changes, and it
	// used to hold resolved PROPERTIES and styles alone. A binding that now
	// points at a different entry changes neither, so the component stayed
	// subscribed to wherever its path pointed on mount - which, before the key
	// it depends on has been written, is nowhere. sitezump's favicon field was
	// the symptom: right value, right path, empty input.
	it('produces a different state once the key it depends on is written', () => {
		const before = state();
		setData(`Store.pageData.${PAGE}.favIconKey`, KEY);
		const after = state();

		expect(deepEqual(before, after)).toBe(false);
		expect(after.bindingPaths).toContain(KEY);
	});

	it('produces a different state when the key changes to another entry', () => {
		setData(`Store.pageData.${PAGE}.favIconKey`, KEY);
		const first = state();
		setData(`Store.pageData.${PAGE}.favIconKey`, 'other');
		const second = state();

		expect(deepEqual(first, second)).toBe(false);
		expect(second.bindingPaths).toContain('other');
	});

	it('stays equal when nothing it depends on moved', () => {
		setData(`Store.pageData.${PAGE}.favIconKey`, KEY);
		expect(deepEqual(state(), state())).toBe(true);
	});

	// The value at the far end is somebody else's business: the component
	// subscribes to the path and hears about that itself. Re-rendering on it
	// here would undo the bail-out that stops every store write re-rendering
	// every component.
	it('stays equal when only the VALUE under the path changes', () => {
		setData(`Store.pageData.${PAGE}.favIconKey`, KEY);
		const before = state();
		setData(`Store.pageData.${PAGE}.app.properties.links["${KEY}"].href`, 'changed.svg');
		expect(deepEqual(before, state())).toBe(true);
	});
});

describe('components without an expression binding', () => {
	it('is unaffected by a plain VALUE binding', () => {
		const plain: any = { ...definition, bindingPath: { type: 'VALUE', value: 'Page.title' } };
		const pe = PageStoreExtractor.getForContext(PAGE);
		const one = createNewState(plain, propertyDefs, {} as any, [], [pe as any]);
		setData(`Store.pageData.${PAGE}.favIconKey`, KEY);
		const two = createNewState(plain, propertyDefs, {} as any, [], [pe as any]);
		expect(deepEqual(one, two)).toBe(true);
	});

	it('records nothing when there is no binding at all', () => {
		const none: any = { key: 'x', type: 'Text', properties: {} };
		const pe = PageStoreExtractor.getForContext(PAGE);
		expect(
			createNewState(none, propertyDefs, {} as any, [], [pe as any]).bindingPaths,
		).toBeUndefined();
	});
});
