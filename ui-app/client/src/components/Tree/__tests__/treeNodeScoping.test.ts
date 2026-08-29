import { ParentExtractor } from '../../../context/ParentExtractor';
import {
	buildNodeFrames,
	findTreeNodeByPath,
	normalizeTreeData,
	TreeNodeModel,
	TreeShapeOptions,
} from '../../util/treeData';

/**
 * The Tree's whole "one child template at every depth" model rests on how `Parent.` resolves
 * against the frames it pushes, so this asserts that contract against the real
 * `ParentExtractor` rather than trusting the shape by inspection.
 */

const PAGE = 'testPage';
const KEY = 'treeComp';
const BASE = 'Page.data';
const DEAD = 'Store.defaultData.testPage.treeComp_treeRootAnchor';

const nested: TreeShapeOptions = { dataShape: 'NESTED' };
const flatShape: TreeShapeOptions = { dataShape: 'FLAT', idKey: 'id', parentKey: 'parentId' };

const data = [
	{
		label: 'root0',
		children: [{ label: 'a' }, { label: 'b', children: [{ label: 'b1' }] }],
	},
	{ label: 'root1' },
];

const roots = normalizeTreeData(data, nested);
const byPath = new Map<string, TreeNodeModel>();
(function index(nodes: TreeNodeModel[]) {
	for (const n of nodes) {
		byPath.set(n.dataPath, n);
		index(n.children);
	}
})(roots);

const framesFor = (dataPath: string) => {
	const node = findTreeNodeByPath(roots, dataPath)!;
	return buildNodeFrames(
		[],
		BASE,
		node,
		node.parentDataPath ? byPath.get(node.parentDataPath) : undefined,
		PAGE,
		KEY,
		DEAD,
	);
};

const resolve = (dataPath: string, token: string) =>
	new ParentExtractor(framesFor(dataPath)).getPath(token).path;

describe('two-frame node scoping', () => {
	it('pushes exactly two frames per node', () => {
		expect(framesFor('[0].children[1].children[0]')).toHaveLength(2);
	});

	it('uses string locations, not DataLocation objects', () => {
		// useDefinition keys its listener rebuild on `location + '_' + index`; an object
		// collapses to "[object Object]" and the template never re-subscribes.
		for (const frame of framesFor('[0].children[1]'))
			expect(typeof frame.location).toBe('string');
	});

	it('resolves Parent.<field> to the node at depth 0', () => {
		expect(resolve('[0]', 'Parent.label')).toBe('Page.data[0].label');
	});

	it('resolves Parent.<field> to the node at depth 2', () => {
		expect(resolve('[0].children[1].children[0]', 'Parent.label')).toBe(
			'Page.data[0].children[1].children[0].label',
		);
	});

	it('resolves Parent.Parent.<field> to the parent node', () => {
		expect(resolve('[0].children[1].children[0]', 'Parent.Parent.label')).toBe(
			'Page.data[0].children[1].label',
		);
	});

	it('keeps the hop count depth-independent', () => {
		// The same expression must mean "the parent" at every depth. This is the property that
		// one-frame-per-ancestor would break.
		expect(resolve('[0].children[0]', 'Parent.Parent.label')).toBe('Page.data[0].label');
		expect(resolve('[0].children[1].children[0]', 'Parent.Parent.label')).toBe(
			'Page.data[0].children[1].label',
		);
	});

	it('sends Parent.Parent at root depth to a dead path, not the binding root', () => {
		// One template renders at every depth, so a template using Parent.Parent also runs on
		// root nodes. Resolving to the binding root ('Page.data.label') is NOT safe: for
		// array-rooted data the expression evaluator throws "label is not a number" on the
		// non-numeric key and the error boundary takes down the page. Verified in the browser
		// before this was changed. A dead scratch path reads as undefined instead.
		expect(() => resolve('[0]', 'Parent.Parent.label')).not.toThrow();
		expect(resolve('[0]', 'Parent.Parent.label')).toBe(`${DEAD}.label`);
		expect(resolve('[0]', 'Parent.Parent.label')).not.toContain(BASE);
	});

	it('still resolves Parent.Parent through a real parent at depth', () => {
		expect(resolve('[0].children[0]', 'Parent.Parent.label')).toBe('Page.data[0].label');
	});

	it('never emits a resolved path containing the word Parent', () => {
		/*
		 * useDefinition decides whether to re-resolve a listener path with
		 * `path.indexOf('Parent') !== -1`. A resolved path that merely contains that word is
		 * handed back to ParentExtractor.getPath, which finds no leading `Parent.` segment,
		 * computes pNum = 0 and reads locationHistory[length] — one past the end — then
		 * dereferences it. Naming the root anchor `_noParent` crashed the page in the browser.
		 */
		for (const dataPath of ['[0]', '[0].children[0]', '[0].children[1].children[0]'])
			for (const token of ['Parent.label', 'Parent.Parent.label'])
				expect(resolve(dataPath, token)).not.toContain('Parent');
	});

	it('reaches past the tree with a constant hop count at any depth', () => {
		const outer = [
			{ location: 'Page.outer[3]', index: 3, pageName: PAGE, componentKey: 'repeater' },
		];
		const node = findTreeNodeByPath(roots, '[0].children[1].children[0]')!;
		const deep = new ParentExtractor(
			buildNodeFrames(outer, BASE, node, byPath.get(node.parentDataPath!), PAGE, KEY, DEAD),
		);
		expect(deep.getPath('Parent.Parent.Parent.name').path).toBe('Page.outer[3].name');

		const shallowNode = findTreeNodeByPath(roots, '[1]')!;
		const shallow = new ParentExtractor(
			buildNodeFrames(outer, BASE, shallowNode, undefined, PAGE, KEY, DEAD),
		);
		expect(shallow.getPath('Parent.Parent.Parent.name').path).toBe('Page.outer[3].name');
	});

	it('exposes the node index through Parent.__index', () => {
		const frames = framesFor('[0].children[1]');
		expect(frames[frames.length - 1].index).toBe(1);
		expect(new ParentExtractor(frames).getValue('Parent.__index')).toBe(1);
	});

	it('sends a primitive leaf to the dead path instead of indexing the primitive', () => {
		/*
		 * A primitive has no fields. Pointing the frame at it makes `Parent.label` resolve to
		 * `<path>.label`, and indexing a string with a non-numeric key makes the expression
		 * evaluator throw and the error boundary blank the page. Reproduced in the browser with
		 * a RAW_JSON object holding a string value.
		 */
		const rawRoots = normalizeTreeData(
			{ name: 'raw', items: [1, 2] },
			{ dataShape: 'RAW_JSON' },
		);

		const stringLeaf = findTreeNodeByPath(rawRoots, '.name')!;
		expect(typeof stringLeaf.data).toBe('string');
		const leafFrames = buildNodeFrames([], BASE, stringLeaf, undefined, PAGE, KEY, DEAD);
		expect(leafFrames[1].location).toBe(DEAD);
		expect(new ParentExtractor(leafFrames).getPath('Parent.label').path).toBe(`${DEAD}.label`);

		// A numeric element inside an array is a primitive too.
		const numberLeaf = findTreeNodeByPath(rawRoots, '.items[0]')!;
		const arrayParent = findTreeNodeByPath(rawRoots, '.items')!;
		const numFrames = buildNodeFrames([], BASE, numberLeaf, arrayParent, PAGE, KEY, DEAD);
		expect(numFrames[1].location).toBe(DEAD);
		// An array parent is not addressable either: `Parent.Parent.label` against an array
		// throws "label is not a number" exactly like a string does.
		expect(numFrames[0].location).toBe(DEAD);
	});

	it('sends an array node to the dead path too', () => {
		const rawRoots = normalizeTreeData({ items: [1, 2] }, { dataShape: 'RAW_JSON' });
		const arrayNode = findTreeNodeByPath(rawRoots, '.items')!;
		expect(Array.isArray(arrayNode.data)).toBe(true);
		const frames = buildNodeFrames([], BASE, arrayNode, undefined, PAGE, KEY, DEAD);
		expect(frames[1].location).toBe(DEAD);
		expect(new ParentExtractor(frames).getPath('Parent.label').path).not.toContain(BASE);
	});

	it('keeps object nodes addressable', () => {
		const objRoots = normalizeTreeData({ cfg: { host: 'x' } }, { dataShape: 'RAW_JSON' });
		const frames = buildNodeFrames([], BASE, objRoots[0], undefined, PAGE, KEY, DEAD);
		expect(frames[1].location).toBe(`${BASE}.cfg`);
		expect(new ParentExtractor(frames).getPath('Parent.host').path).toBe(`${BASE}.cfg.host`);
	});

	it('resolves Parent for FLAT rows, whose paths are not hierarchically nested', () => {
		const rows = [
			{ id: 1, parentId: null, label: 'root' },
			{ id: 2, parentId: 1, label: 'child' },
		];
		const flatRoots = normalizeTreeData(rows, flatShape);
		const child = flatRoots[0].children[0];

		const frames = buildNodeFrames([], BASE, child, flatRoots[0], PAGE, KEY, DEAD);
		const pe = new ParentExtractor(frames);

		// The child is row 1 of the flat array, and its parent is row 0 — both real paths.
		expect(pe.getPath('Parent.label').path).toBe('Page.data[1].label');
		expect(pe.getPath('Parent.Parent.label').path).toBe('Page.data[0].label');
	});
});
