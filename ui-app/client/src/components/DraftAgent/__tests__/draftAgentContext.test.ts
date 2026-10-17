import { describeActiveObject, pickableComponents } from '../draftAgentContext';

const page = { name: 'deals', id: '66a1' };
const shell = { name: 'shell', id: '77b2' };

describe('describeActiveObject', () => {
	it('names the page and its id, as the page editor sidekick does', () => {
		expect(describeActiveObject(page, undefined, [])).toBe("page 'deals' (id 66a1)");
	});

	it('says which shell wraps it', () => {
		expect(describeActiveObject(page, shell, [])).toBe(
			"page 'deals' (id 66a1) inside the shell page 'shell' (id 77b2)",
		);
	});

	it('names a picked component by type, name and key', () => {
		expect(
			describeActiveObject(page, undefined, [
				{ key: 'k1', type: 'Table', name: 'dealsTable', page: 'deals' },
			]),
		).toBe("page 'deals' (id 66a1), with Table 'dealsTable' (key k1) selected");
	});

	it('says when a picked component lives on the shell', () => {
		expect(
			describeActiveObject(page, shell, [
				{ key: 'k1', type: 'Table', name: 'dealsTable', page: 'deals' },
				{ key: 'h1', type: 'Grid', name: '', page: 'shell' },
			]),
		).toBe(
			"page 'deals' (id 66a1) inside the shell page 'shell' (id 77b2), with Table 'dealsTable' (key k1) and Grid 'h1' (key h1) on the shell page selected",
		);
	});

	it('is empty with nothing on screen', () => {
		expect(describeActiveObject(undefined, undefined, [])).toBe('');
	});
});

describe('pickableComponents', () => {
	it('offers the page and the shell, never the shell page slot', () => {
		const comps = pickableComponents({
			urlPage: 'deals',
			page: {
				name: 'deals',
				componentDefinition: { t: { key: 't', type: 'Table', name: 'tbl' } },
			} as any,
			shell: {
				name: 'shell',
				componentDefinition: {
					h: { key: 'h', type: 'Grid', name: 'header' },
					slot: { key: 'slot', type: 'Page', name: 'page' },
				},
			} as any,
		});
		expect(Object.keys(comps).sort()).toEqual(['h', 't']);
		expect(comps.t.page).toBe('deals');
		expect(comps.h.page).toBe('shell');
	});
});
