import {
	addTreeNode,
	adjustPathAfterRemoval,
	computeDefaultExpanded,
	deleteTreeNode,
	findTreeNodeByPath,
	flattenVisibleTree,
	getChildrenKeyAtDepth,
	getHasChildrenPropertyAtDepth,
	isSelfOrDescendantPath,
	makeNodeKey,
	moveTreeNode,
	normalizeTreeData,
	parseDataPath,
	seg,
	TreeNodeModel,
	TreeShapeOptions,
	treeStructureSignature,
} from '../treeData';

const nested: TreeShapeOptions = { dataShape: 'NESTED' };
const objectMap: TreeShapeOptions = { dataShape: 'OBJECT_MAP' };
const rawJson: TreeShapeOptions = { dataShape: 'RAW_JSON' };
const flat: TreeShapeOptions = { dataShape: 'FLAT', idKey: 'id', parentKey: 'parentId' };

const paths = (nodes: TreeNodeModel[]): string[] => {
	const out: string[] = [];
	const walk = (ns: TreeNodeModel[]) => {
		for (const n of ns) {
			out.push(n.dataPath);
			walk(n.children);
		}
	};
	walk(nodes);
	return out;
};

const labels = (nodes: TreeNodeModel[], key = 'label'): any[] => {
	const out: any[] = [];
	const walk = (ns: TreeNodeModel[]) => {
		for (const n of ns) {
			out.push(n.data?.[key] ?? n.label);
			walk(n.children);
		}
	};
	walk(nodes);
	return out;
};

/**
 * For an already-flattened list. `flattenVisibleTree` returns a flat array whose nodes still
 * carry their `children`, so the recursive `labels` helper would count them twice.
 */
const flatLabels = (nodes: TreeNodeModel[], key = 'label'): any[] =>
	nodes.map(n => n.data?.[key] ?? n.label);

// ---------------------------------------------------------------------------
// path building — the piece everything else depends on
// ---------------------------------------------------------------------------

describe('seg / parseDataPath', () => {
	it('uses dot notation for plain identifiers and brackets for indices', () => {
		expect(seg('children')).toBe('.children');
		expect(seg(3)).toBe('[3]');
		expect(seg('_private$1')).toBe('._private$1');
	});

	it('bracket-quotes keys that are not plain identifiers', () => {
		// A bare `.my key` / `.my.key` would be mis-split by the store path resolver.
		expect(seg('my key')).toBe('["my key"]');
		expect(seg('my.key')).toBe('["my.key"]');
		expect(seg('1stPlace')).toBe('["1stPlace"]');
		expect(seg('kebab-case')).toBe('["kebab-case"]');
	});

	it('escapes quotes and backslashes inside a quoted key', () => {
		expect(seg('say "hi"')).toBe('["say \\"hi\\""]');
		expect(seg('back\\slash')).toBe('["back\\\\slash"]');
	});

	it('round-trips through parseDataPath', () => {
		expect(parseDataPath('[0].children[2]')).toEqual([0, 'children', 2]);
		expect(parseDataPath('.a.children.b')).toEqual(['a', 'children', 'b']);
		expect(parseDataPath('["my.key"].children[1]')).toEqual(['my.key', 'children', 1]);
		expect(parseDataPath('["say \\"hi\\""]')).toEqual(['say "hi"']);
	});

	it('parses a quoted key containing dots as one segment, not several', () => {
		expect(parseDataPath('["a.b.c"]')).toHaveLength(1);
	});
});

describe('makeNodeKey', () => {
	it('produces a store-safe key with no brackets or dots', () => {
		const key = makeNodeKey('[0].children[2]');
		expect(key).toBe('n_0_children_2');
		expect(key).not.toMatch(/[.[\]]/);
	});

	it('always starts with a non-digit so it is never read as an array index', () => {
		expect(makeNodeKey('[0]')).toBe('n_0');
		expect(makeNodeKey('[0]').charAt(0)).not.toMatch(/\d/);
	});

	it('distinguishes nodes that share a user id but sit at different paths', () => {
		expect(makeNodeKey('[0].children[0]')).not.toBe(makeNodeKey('[1].children[0]'));
	});
});

describe('isSelfOrDescendantPath', () => {
	it('matches the node itself and its descendants', () => {
		expect(isSelfOrDescendantPath('[0]', '[0]')).toBe(true);
		expect(isSelfOrDescendantPath('[0].children[1]', '[0]')).toBe(true);
		expect(isSelfOrDescendantPath('[0].children[1].children[0]', '[0]')).toBe(true);
	});

	it('does not treat a sibling with a shared prefix as a descendant', () => {
		// The bug a naive startsWith would have: [10] starts with [1].
		expect(isSelfOrDescendantPath('[10]', '[1]')).toBe(false);
		expect(isSelfOrDescendantPath('[1]', '[0]')).toBe(false);
	});
});

describe('adjustPathAfterRemoval', () => {
	it('shifts later siblings down by one', () => {
		expect(adjustPathAfterRemoval('[3]', '', 1)).toBe('[2]');
		expect(adjustPathAfterRemoval('[3].children[0]', '', 1)).toBe('[2].children[0]');
	});

	it('leaves earlier siblings and the container alone', () => {
		expect(adjustPathAfterRemoval('[0]', '', 1)).toBe('[0]');
		expect(adjustPathAfterRemoval('[1]', '', 1)).toBe('[1]');
	});

	it('ignores paths in a different container', () => {
		expect(adjustPathAfterRemoval('[5].kids[2]', '[0].kids', 0)).toBe('[5].kids[2]');
	});

	it('no-ops for object keys, which do not shift', () => {
		expect(adjustPathAfterRemoval('.b', '', 'a')).toBe('.b');
	});
});

// ---------------------------------------------------------------------------
// normalizers
// ---------------------------------------------------------------------------

describe('normalizeTreeData / NESTED', () => {
	const data = [
		{ label: 'root0', children: [{ label: 'a' }, { label: 'b', children: [{ label: 'b1' }] }] },
		{ label: 'root1' },
	];

	it('builds real store paths for every depth', () => {
		expect(paths(normalizeTreeData(data, nested))).toEqual([
			'[0]',
			'[0].children[0]',
			'[0].children[1]',
			'[0].children[1].children[0]',
			'[1]',
		]);
	});

	it('records depth, parent path and last-child flags', () => {
		const roots = normalizeTreeData(data, nested);
		const b1 = findTreeNodeByPath(roots, '[0].children[1].children[0]')!;
		expect(b1.depth).toBe(2);
		expect(b1.parentDataPath).toBe('[0].children[1]');
		expect(b1.isLastChild).toBe(true);
		// One entry per ancestor: root0 has a following sibling, b does not.
		expect(b1.parentPath).toEqual([true, false]);
	});

	it('honours a depth-indexed childrenKey', () => {
		const heterogeneous = [{ stages: [{ substages: [{ label: 'deep' }] }] }];
		const roots = normalizeTreeData(heterogeneous, {
			dataShape: 'NESTED',
			childrenKey: ['stages', 'substages'],
		});
		expect(paths(roots)).toEqual(['[0]', '[0].stages[0]', '[0].stages[0].substages[0]']);
	});

	it('marks a lazy node expandable via hasChildrenProperty before children arrive', () => {
		const roots = normalizeTreeData([{ label: 'x', hasKids: true }], {
			dataShape: 'NESTED',
			hasChildrenProperty: 'hasKids',
		});
		expect(roots[0].hasChildren).toBe(true);
		expect(roots[0].children).toHaveLength(0);
	});

	it('returns nothing for non-array data', () => {
		expect(normalizeTreeData({ a: 1 }, nested)).toEqual([]);
		expect(normalizeTreeData(undefined, nested)).toEqual([]);
	});
});

describe('normalizeTreeData / OBJECT_MAP', () => {
	it('walks nested object maps and uses dot segments for keys', () => {
		const data = { a: { label: 'A', children: { b: { label: 'B' } } } };
		expect(paths(normalizeTreeData(data, objectMap))).toEqual(['.a', '.a.children.b']);
	});

	it('bracket-quotes keys that need it', () => {
		const data = { 'my key': { label: 'A' } };
		expect(paths(normalizeTreeData(data, objectMap))).toEqual(['["my key"]']);
	});

	it('accepts an array in a children slot as well as a map', () => {
		const data = { a: { label: 'A', children: [{ label: 'B' }] } };
		expect(paths(normalizeTreeData(data, objectMap))).toEqual(['.a', '.a.children[0]']);
	});

	it('exposes the map key as the node label', () => {
		const roots = normalizeTreeData({ alpha: { label: 'A' } }, objectMap);
		expect(roots[0].label).toBe('alpha');
		expect(roots[0].index).toBe('alpha');
	});
});

describe('normalizeTreeData / FLAT', () => {
	const rows = [
		{ id: 1, parentId: null, label: 'root' },
		{ id: 2, parentId: 1, label: 'child' },
		{ id: 3, parentId: 2, label: 'grandchild' },
		{ id: 4, parentId: null, label: 'root2' },
	];

	it('builds the hierarchy while keeping every node addressable as a top-level row', () => {
		const roots = normalizeTreeData(rows, flat);
		expect(labels(roots)).toEqual(['root', 'child', 'grandchild', 'root2']);
		// Paths stay flat indices — this is what keeps Parent.<field> working.
		expect(paths(roots)).toEqual(['[0]', '[1]', '[2]', '[3]']);
	});

	it('treats a row whose parent is absent from the data as a root, not a dropped node', () => {
		const orphaned = [
			{ id: 1, parentId: 999, label: 'orphan' },
			{ id: 2, parentId: 1, label: 'child of orphan' },
		];
		const roots = normalizeTreeData(orphaned, flat);
		expect(roots).toHaveLength(1);
		expect(labels(roots)).toEqual(['orphan', 'child of orphan']);
	});

	it('survives a parentId cycle instead of recursing forever', () => {
		const cyclic = [
			{ id: 1, parentId: 2, label: 'a' },
			{ id: 2, parentId: 1, label: 'b' },
		];
		expect(() => normalizeTreeData(cyclic, flat)).not.toThrow();
	});

	it('treats a self-referencing row as a root', () => {
		const roots = normalizeTreeData([{ id: 1, parentId: 1, label: 'self' }], flat);
		expect(labels(roots)).toEqual(['self']);
	});

	it('matches parent ids across string/number types', () => {
		const mixed = [
			{ id: 1, parentId: null, label: 'root' },
			{ id: 2, parentId: '1', label: 'child' },
		];
		expect(labels(normalizeTreeData(mixed, flat))).toEqual(['root', 'child']);
	});
});

describe('normalizeTreeData / RAW_JSON', () => {
	it('infers branches from objects and arrays, with keys as labels', () => {
		const data = { config: { host: 'x' }, items: [1, 2] };
		const roots = normalizeTreeData(data, rawJson);
		expect(paths(roots)).toEqual([
			'.config',
			'.config.host',
			'.items',
			'.items[0]',
			'.items[1]',
		]);
		expect(roots[0].label).toBe('config');
		expect(roots[1].children[0].label).toBe('0');
	});

	it('treats primitives as leaves', () => {
		const roots = normalizeTreeData({ n: 42 }, rawJson);
		expect(roots[0].hasChildren).toBe(false);
		expect(roots[0].data).toBe(42);
	});

	it('does not hang on a circular reference', () => {
		const data: any = { name: 'a' };
		data.self = data;
		expect(() => normalizeTreeData(data, rawJson)).not.toThrow();
		const roots = normalizeTreeData(data, rawJson);
		expect(findTreeNodeByPath(roots, '.self')!.hasChildren).toBe(false);
	});

	it('stops at maxDepth', () => {
		let deep: any = { leaf: true };
		for (let i = 0; i < 30; i++) deep = { nest: deep };
		const roots = normalizeTreeData(deep, { dataShape: 'RAW_JSON', maxDepth: 5 });
		let depth = 0;
		let cur = roots;
		while (cur.length) {
			depth++;
			cur = cur[0].children;
		}
		expect(depth).toBe(5);
	});

	it('quotes awkward keys so the path still resolves', () => {
		expect(paths(normalizeTreeData({ 'a.b': 1 }, rawJson))).toEqual(['["a.b"]']);
	});
});

// ---------------------------------------------------------------------------
// traversal / expansion
// ---------------------------------------------------------------------------

describe('flattenVisibleTree', () => {
	const roots = normalizeTreeData(
		[{ label: 'r', children: [{ label: 'a', children: [{ label: 'a1' }] }] }],
		nested,
	);

	it('shows only roots when nothing is expanded', () => {
		expect(flatLabels(flattenVisibleTree(roots, () => false))).toEqual(['r']);
	});

	it('reveals one level per expanded node', () => {
		const open = new Set([makeNodeKey('[0]')]);
		expect(flatLabels(flattenVisibleTree(roots, k => open.has(k)))).toEqual(['r', 'a']);
	});

	it('reveals the whole tree when everything is expanded', () => {
		expect(flatLabels(flattenVisibleTree(roots, () => true))).toEqual(['r', 'a', 'a1']);
	});
});

describe('computeDefaultExpanded', () => {
	const roots = normalizeTreeData(
		[{ label: 'r', children: [{ label: 'a', children: [{ label: 'a1' }] }] }],
		nested,
	);

	it('expands nothing at level 0', () => {
		expect(computeDefaultExpanded(roots, 0).size).toBe(0);
	});

	it('expands the first N levels', () => {
		expect(computeDefaultExpanded(roots, 1)).toEqual(new Set([makeNodeKey('[0]')]));
	});

	it('expands everything with -1', () => {
		// Only the two nodes that actually have children.
		expect(computeDefaultExpanded(roots, -1).size).toBe(2);
	});
});

describe('treeStructureSignature', () => {
	it('is stable for equal structures and differs when the shape changes', () => {
		const a = normalizeTreeData([{ label: 'x', children: [{ label: 'y' }] }], nested);
		const b = normalizeTreeData([{ label: 'x', children: [{ label: 'y' }] }], nested);
		const c = normalizeTreeData([{ label: 'x' }], nested);

		expect(treeStructureSignature(a)).toBe(treeStructureSignature(b));
		expect(treeStructureSignature(a)).not.toBe(treeStructureSignature(c));
	});

	it('ignores changes to node content, so a value edit does not reset expansion', () => {
		const a = normalizeTreeData([{ label: 'x', children: [{ label: 'y' }] }], nested);
		const renamed = normalizeTreeData(
			[{ label: 'CHANGED', children: [{ label: 'y' }] }],
			nested,
		);
		expect(treeStructureSignature(a)).toBe(treeStructureSignature(renamed));
	});
});

// ---------------------------------------------------------------------------
// editing
// ---------------------------------------------------------------------------

describe('deleteTreeNode', () => {
	it('removes a nested node together with its subtree', () => {
		const data = [{ label: 'r', children: [{ label: 'a' }, { label: 'b' }] }];
		const roots = normalizeTreeData(data, nested);
		const next = deleteTreeNode(data, findTreeNodeByPath(roots, '[0].children[0]')!, nested);
		expect(next[0].children).toHaveLength(1);
		expect(next[0].children[0].label).toBe('b');
	});

	it('does not mutate the original data', () => {
		const data = [{ label: 'r', children: [{ label: 'a' }] }];
		const roots = normalizeTreeData(data, nested);
		deleteTreeNode(data, findTreeNodeByPath(roots, '[0].children[0]')!, nested);
		expect(data[0].children).toHaveLength(1);
	});

	it('removes an OBJECT_MAP node by key', () => {
		const data = { a: { label: 'A' }, b: { label: 'B' } };
		const roots = normalizeTreeData(data, objectMap);
		const next = deleteTreeNode(data, findTreeNodeByPath(roots, '.a')!, objectMap);
		expect(Object.keys(next)).toEqual(['b']);
	});

	it('removes FLAT descendants too, so no rows are orphaned', () => {
		const rows = [
			{ id: 1, parentId: null },
			{ id: 2, parentId: 1 },
			{ id: 3, parentId: 2 },
			{ id: 4, parentId: null },
		];
		const roots = normalizeTreeData(rows, flat);
		const next = deleteTreeNode(rows, findTreeNodeByPath(roots, '[0]')!, flat);
		expect(next.map((r: any) => r.id)).toEqual([4]);
	});

	it('refuses to edit RAW_JSON', () => {
		const roots = normalizeTreeData({ a: 1 }, rawJson);
		expect(deleteTreeNode({ a: 1 }, roots[0], rawJson)).toBeUndefined();
	});
});

describe('moveTreeNode', () => {
	it('reorders siblings within one array', () => {
		const data = [{ label: 'a' }, { label: 'b' }, { label: 'c' }];
		const roots = normalizeTreeData(data, nested);
		const next = moveTreeNode(data, roots[2], roots[0], 'BEFORE', nested);
		expect(next.map((n: any) => n.label)).toEqual(['c', 'a', 'b']);
	});

	it('accounts for the index shift when moving a node downwards', () => {
		// Removing index 0 shifts every later sibling down one; a naive implementation
		// inserts in the wrong slot here.
		const data = [{ label: 'a' }, { label: 'b' }, { label: 'c' }];
		const roots = normalizeTreeData(data, nested);
		const next = moveTreeNode(data, roots[0], roots[2], 'AFTER', nested);
		expect(next.map((n: any) => n.label)).toEqual(['b', 'c', 'a']);
	});

	it('reparents a node into another node', () => {
		const data = [{ label: 'a' }, { label: 'b', children: [] as any[] }];
		const roots = normalizeTreeData(data, nested);
		const next = moveTreeNode(data, roots[0], roots[1], 'INSIDE', nested);
		expect(next).toHaveLength(1);
		expect(next[0].label).toBe('b');
		expect(next[0].children[0].label).toBe('a');
	});

	it('creates the children container when reparenting into a leaf', () => {
		const data = [{ label: 'a' }, { label: 'b' }];
		const roots = normalizeTreeData(data, nested);
		const next = moveTreeNode(data, roots[0], roots[1], 'INSIDE', nested);
		expect(next[0].children).toHaveLength(1);
	});

	it('refuses to drop a node into its own subtree', () => {
		const data = [{ label: 'r', children: [{ label: 'a' }] }];
		const roots = normalizeTreeData(data, nested);
		const child = findTreeNodeByPath(roots, '[0].children[0]')!;
		expect(moveTreeNode(data, roots[0], child, 'INSIDE', nested)).toBeUndefined();
	});

	it('refuses to drop a node onto itself', () => {
		const data = [{ label: 'a' }];
		const roots = normalizeTreeData(data, nested);
		expect(moveTreeNode(data, roots[0], roots[0], 'INSIDE', nested)).toBeUndefined();
	});

	it('reparents FLAT rows with a single parentKey write', () => {
		const rows = [
			{ id: 1, parentId: null },
			{ id: 2, parentId: null },
		];
		const roots = normalizeTreeData(rows, flat);
		const next = moveTreeNode(rows, roots[0], roots[1], 'INSIDE', flat);
		expect(next.find((r: any) => r.id === 1).parentId).toBe(2);
	});

	it('reorders FLAT rows and keeps them siblings', () => {
		const rows = [
			{ id: 1, parentId: null },
			{ id: 2, parentId: null },
		];
		const roots = normalizeTreeData(rows, flat);
		const next = moveTreeNode(rows, roots[1], roots[0], 'BEFORE', flat);
		expect(next.map((r: any) => r.id)).toEqual([2, 1]);
		expect(next[0].parentId).toBeNull();
	});

	it('reorders OBJECT_MAP siblings by rebuilding key order', () => {
		const data = { a: { label: 'A' }, b: { label: 'B' }, c: { label: 'C' } };
		const roots = normalizeTreeData(data, objectMap);
		const next = moveTreeNode(data, roots[2], roots[0], 'BEFORE', objectMap);
		expect(Object.keys(next)).toEqual(['c', 'a', 'b']);
	});

	it('refuses to move RAW_JSON nodes', () => {
		const data = { a: 1, b: 2 };
		const roots = normalizeTreeData(data, rawJson);
		expect(moveTreeNode(data, roots[0], roots[1], 'AFTER', rawJson)).toBeUndefined();
	});
});

describe('addTreeNode', () => {
	it('adds a child, creating the container if needed', () => {
		const data = [{ label: 'r' }];
		const roots = normalizeTreeData(data, nested);
		const next = addTreeNode(data, roots[0], 'CHILD', { label: 'new' }, nested);
		expect(next[0].children[0].label).toBe('new');
	});

	it('adds a sibling directly after the anchor', () => {
		const data = [{ label: 'a' }, { label: 'c' }];
		const roots = normalizeTreeData(data, nested);
		const next = addTreeNode(data, roots[0], 'SIBLING', { label: 'b' }, nested);
		expect(next.map((n: any) => n.label)).toEqual(['a', 'b', 'c']);
	});

	it('stamps id and parentKey on a FLAT child row', () => {
		const rows = [{ id: 1, parentId: null }];
		const roots = normalizeTreeData(rows, flat);
		const next = addTreeNode(rows, roots[0], 'CHILD', { label: 'new' }, flat);
		expect(next).toHaveLength(2);
		expect(next[1].parentId).toBe(1);
		expect(next[1].id).toBeDefined();
	});

	it('gives a FLAT sibling the same parent as its anchor', () => {
		const rows = [
			{ id: 1, parentId: null },
			{ id: 2, parentId: 1 },
		];
		const roots = normalizeTreeData(rows, flat);
		const child = findTreeNodeByPath(roots, '[1]')!;
		const next = addTreeNode(rows, child, 'SIBLING', { label: 'new' }, flat);
		expect(next.find((r: any) => r.label === 'new').parentId).toBe(1);
	});

	it('adds an OBJECT_MAP child under a generated key', () => {
		const data = { a: { label: 'A' } };
		const roots = normalizeTreeData(data, objectMap);
		const next = addTreeNode(data, roots[0], 'CHILD', { label: 'new' }, objectMap);
		expect(Object.values(next.a.children)).toHaveLength(1);
	});

	it('tolerates an empty template', () => {
		const data = [{ label: 'r' }];
		const roots = normalizeTreeData(data, nested);
		expect(addTreeNode(data, roots[0], 'CHILD', undefined, nested)[0].children).toEqual([{}]);
	});

	it('refuses to add to RAW_JSON', () => {
		const roots = normalizeTreeData({ a: 1 }, rawJson);
		expect(addTreeNode({ a: 1 }, roots[0], 'CHILD', {}, rawJson)).toBeUndefined();
	});
});

// ---------------------------------------------------------------------------
// depth-key helpers lifted from Table — behaviour must not drift
// ---------------------------------------------------------------------------

describe('depth-indexed key helpers', () => {
	it('reuses the last entry beyond the end of the array', () => {
		expect(getChildrenKeyAtDepth(['a', 'b'], 0)).toBe('a');
		expect(getChildrenKeyAtDepth(['a', 'b'], 1)).toBe('b');
		expect(getChildrenKeyAtDepth(['a', 'b'], 9)).toBe('b');
	});

	it('falls back to "children"', () => {
		expect(getChildrenKeyAtDepth(undefined, 0)).toBe('children');
		expect(getChildrenKeyAtDepth([], 0)).toBe('children');
		expect(getChildrenKeyAtDepth('kids', 3)).toBe('kids');
	});

	it('returns undefined rather than a default for hasChildrenProperty', () => {
		expect(getHasChildrenPropertyAtDepth(undefined, 0)).toBeUndefined();
		expect(getHasChildrenPropertyAtDepth([], 0)).toBeUndefined();
		expect(getHasChildrenPropertyAtDepth('hasKids', 2)).toBe('hasKids');
	});
});
