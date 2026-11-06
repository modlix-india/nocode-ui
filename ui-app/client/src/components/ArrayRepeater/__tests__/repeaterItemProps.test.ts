import { repeaterItemProps } from '../repeaterItemProps';
import { propertiesDefinition } from '../arrayRepeaterProperties';

describe('repeaterItemProps', () => {
	it('keeps every item a Tab stop announced as a button by default', () => {
		for (const off of [undefined, false]) {
			const p = repeaterItemProps(off);
			expect(p.tabIndex).toBe(0);
			expect(p.role).toBe('button');
			expect(typeof p.onKeyDown).toBe('function');
		}
	});

	it('makes the items plain containers with plainItems', () => {
		expect(repeaterItemProps(true)).toEqual({});
	});

	it('declares plainItems off by default', () => {
		const def = propertiesDefinition.find(e => e.name === 'plainItems');
		expect(def).toBeDefined();
		expect(def?.defaultValue).toBe(false);
	});
});
