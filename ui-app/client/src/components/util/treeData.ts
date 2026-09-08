import { duplicate } from '@fincity/kirun-js';
import { LocationHistory } from '../../types/common';
import { cyrb53 } from '../../util/cyrb53';
import { shortUUID } from '../../util/shortUUID';

/**
 * Shared tree plumbing: turning the four supported data shapes into one node model,
 * and reshaping the underlying data for the editing operations.
 *
 * Everything here is pure — no React, no store access — so it can be unit tested directly.
 *
 * `getChildrenKeyAtDepth` and `getHasChildrenPropertyAtDepth` originally lived in
 * TableComponents/Table/Table.tsx and are re-exported from there, so Table's tree mode keeps
 * working off exactly the same depth-key semantics.
 */

export type TreeKeyConfig = string | string[] | undefined;

export type TreeDataShape = 'NESTED' | 'FLAT' | 'OBJECT_MAP' | 'RAW_JSON';

export type DropPosition = 'BEFORE' | 'AFTER' | 'INSIDE';

export interface TreeNodeModel {
	/** Stable identity, derived from dataPath — never from a user id, which may repeat. */
	nodeKey: string;
	/** Suffix appended to the resolved binding path, e.g. `[0].children[2]`. */
	dataPath: string;
	/** The node's own object/value. */
	data: any;
	depth: number;
	/** Position within its parent's children container. */
	index: number | string;
	children: TreeNodeModel[];
	/** True also when only `hasChildrenProperty` says so — a not-yet-loaded lazy node. */
	hasChildren: boolean;
	isLastChild: boolean;
	/** One entry per ancestor: does that ancestor's guide line continue past this row. */
	parentPath: boolean[];
	parentDataPath?: string;
	/** For RAW_JSON, the object key / array index this node was found under. */
	label?: string;
}

export interface TreeShapeOptions {
	dataShape: TreeDataShape;
	childrenKey?: TreeKeyConfig;
	hasChildrenProperty?: TreeKeyConfig;
	/** FLAT only. */
	idKey?: string;
	/** FLAT only. */
	parentKey?: string;
	/** RAW_JSON safety valve. */
	maxDepth?: number;
}

const DEFAULT_MAX_DEPTH = 64;

// ---------------------------------------------------------------------------
// depth-indexed key resolution
// ---------------------------------------------------------------------------

export function getChildrenKeyAtDepth(childrenKey: TreeKeyConfig, depth: number): string {
	if (Array.isArray(childrenKey)) {
		if (childrenKey.length === 0) return 'children';
		return childrenKey[Math.min(depth, childrenKey.length - 1)] || 'children';
	}
	return childrenKey || 'children';
}

export function getHasChildrenPropertyAtDepth(
	hasChildrenProperty: TreeKeyConfig,
	depth: number,
): string | undefined {
	if (Array.isArray(hasChildrenProperty)) {
		if (hasChildrenProperty.length === 0) return undefined;
		return hasChildrenProperty[Math.min(depth, hasChildrenProperty.length - 1)] || undefined;
	}
	return hasChildrenProperty || undefined;
}

// ---------------------------------------------------------------------------
// node keys and data paths
// ---------------------------------------------------------------------------

/**
 * A dataPath contains `[`, `]` and `.`, none of which survive being used as a store key —
 * the path resolver would read `[0]` as an array index and turn an expansion map into a
 * sparse array. So flatten it, and prefix it so a leading digit can never look like an index.
 */
export function makeNodeKey(dataPath: string): string {
	return 'n_' + dataPath.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const ESCAPED_BACKSLASH = String.raw`\\`;
const ESCAPED_QUOTE = String.raw`\"`;

/**
 * Build one path segment.
 *
 * A key that is not a plain identifier MUST be bracket-quoted. `TokenValueExtractor`'s
 * `splitPathInternal` tracks bracket depth and does not split on dots inside brackets, so
 * `["my.key"]` survives as a single segment while `.my.key` would be read as two — resolving
 * to `undefined` with no error at all. Every dataPath in this module is built through here.
 */
export function seg(key: string | number): string {
	if (typeof key === 'number') return `[${key}]`;
	if (IDENTIFIER.test(key)) return `.${key}`;
	const escaped = key.replaceAll('\\', ESCAPED_BACKSLASH).replaceAll('"', ESCAPED_QUOTE);
	return `["${escaped}"]`;
}

/**
 * `[0].children[2]` -> `[0, 'children', 2]`; also understands `["quoted key"]`.
 *
 * The quoted-key branch uses the unrolled-loop form `[^"\\]*(?:\\.[^"\\]*)*` rather than the
 * naive `(?:[^"\\]|\\.)*`, which backtracks super-linearly on a malformed path.
 */
export function parseDataPath(dataPath: string): Array<string | number> {
	const segments: Array<string | number> = [];
	const re = /\["([^"\\]*(?:\\.[^"\\]*)*)"\]|\[(\d+)\]|\.?([^.[\]]+)/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(dataPath)) !== null) {
		if (m[1] !== undefined)
			segments.push(m[1].replaceAll(ESCAPED_QUOTE, '"').replaceAll(ESCAPED_BACKSLASH, '\\'));
		else if (m[2] !== undefined) segments.push(Number(m[2]));
		else if (m[3] !== undefined) segments.push(m[3]);
	}
	return segments;
}

function joinSegment(path: string, segment: string | number): string {
	return `${path}${seg(segment)}`;
}

/** Everything but the last segment of a dataPath — i.e. the path of the containing array/object. */
export function containerPathOf(dataPath: string): string {
	const segments = parseDataPath(dataPath);
	if (!segments.length) return '';
	return segments.slice(0, -1).reduce<string>((acc, s) => joinSegment(acc, s), '');
}

/** Walk to the container holding `dataPath`'s last segment, and hand back that segment. */
function resolveContainer(
	root: any,
	dataPath: string,
): { container: any; key: string | number } | undefined {
	const segments = parseDataPath(dataPath);
	if (!segments.length) return undefined;

	let cur = root;
	for (let i = 0; i < segments.length - 1; i++) {
		if (cur === null || cur === undefined) return undefined;
		cur = cur[segments[i] as any];
	}
	if (cur === null || cur === undefined) return undefined;
	return { container: cur, key: segments[segments.length - 1] };
}

/** Is `candidate` the same node as `dataPath`, or somewhere beneath it. */
export function isSelfOrDescendantPath(candidate: string, dataPath: string): boolean {
	if (candidate === dataPath) return true;
	if (!candidate.startsWith(dataPath)) return false;
	const next = candidate.charAt(dataPath.length);
	return next === '.' || next === '[';
}

/**
 * Splicing an element out of an array shifts every later sibling down by one, which
 * invalidates any path that runs through one of them. Rewrite such a path so it still points
 * at the same node after the removal. Object-keyed containers don't shift, so they no-op.
 */
export function adjustPathAfterRemoval(
	path: string,
	removedContainerPath: string,
	removedKey: string | number,
): string {
	if (typeof removedKey !== 'number') return path;

	const prefix = `${removedContainerPath}[`;
	if (!path.startsWith(prefix)) return path;

	const close = path.indexOf(']', prefix.length);
	if (close === -1) return path;

	const idx = Number(path.substring(prefix.length, close));
	if (Number.isNaN(idx) || idx <= removedKey) return path;

	return `${removedContainerPath}[${idx - 1}]${path.substring(close + 1)}`;
}

// ---------------------------------------------------------------------------
// normalizers
// ---------------------------------------------------------------------------

export function normalizeTreeData(data: any, options: TreeShapeOptions): TreeNodeModel[] {
	if (data === null || data === undefined) return [];

	switch (options.dataShape) {
		case 'NESTED':
			if (!Array.isArray(data)) return [];
			return buildNested(data, '', 0, [], undefined, options);

		case 'OBJECT_MAP':
			return buildObjectMap(data, '', 0, [], undefined, options);

		case 'FLAT':
			if (!Array.isArray(data)) return [];
			return buildFlat(data, options);

		case 'RAW_JSON':
			return buildRawJson(data, '', 0, [], undefined, options, new Set());

		default:
			return [];
	}
}

function buildNested(
	container: any[],
	containerPath: string,
	depth: number,
	parentPath: boolean[],
	parentDataPath: string | undefined,
	options: TreeShapeOptions,
): TreeNodeModel[] {
	const ck = getChildrenKeyAtDepth(options.childrenKey, depth);
	const hcp = getHasChildrenPropertyAtDepth(options.hasChildrenProperty, depth);
	const out: TreeNodeModel[] = [];

	for (let i = 0; i < container.length; i++) {
		const data = container[i];
		const dataPath = `${containerPath}[${i}]`;
		const isLastChild = i === container.length - 1;

		const rawChildren = data?.[ck];
		const hasArrayChildren = Array.isArray(rawChildren) && rawChildren.length > 0;

		const node: TreeNodeModel = {
			nodeKey: makeNodeKey(dataPath),
			dataPath,
			data,
			depth,
			index: i,
			children: [],
			hasChildren: hasArrayChildren || (hcp ? !!data?.[hcp] : false),
			isLastChild,
			parentPath,
			parentDataPath,
		};

		if (hasArrayChildren)
			node.children = buildNested(
				rawChildren,
				`${dataPath}${seg(ck)}`,
				depth + 1,
				[...parentPath, !isLastChild],
				dataPath,
				options,
			);

		out.push(node);
	}

	return out;
}

function buildObjectMap(
	container: any,
	containerPath: string,
	depth: number,
	parentPath: boolean[],
	parentDataPath: string | undefined,
	options: TreeShapeOptions,
): TreeNodeModel[] {
	if (container === null || typeof container !== 'object') return [];

	// A children slot may itself be an array of objects rather than another map; both are
	// common in hand-written data, so handle each entry by what it actually is.
	if (Array.isArray(container))
		return buildNested(container, containerPath, depth, parentPath, parentDataPath, options);

	const ck = getChildrenKeyAtDepth(options.childrenKey, depth);
	const hcp = getHasChildrenPropertyAtDepth(options.hasChildrenProperty, depth);
	const entries = Object.entries(container);
	const out: TreeNodeModel[] = [];

	for (let i = 0; i < entries.length; i++) {
		const [key, data] = entries[i];
		const dataPath = `${containerPath}${seg(key)}`;
		const isLastChild = i === entries.length - 1;

		const rawChildren = (data as any)?.[ck];
		const hasChildContainer = Array.isArray(rawChildren)
			? rawChildren.length > 0
			: !!rawChildren &&
				typeof rawChildren === 'object' &&
				Object.keys(rawChildren).length > 0;

		const node: TreeNodeModel = {
			nodeKey: makeNodeKey(dataPath),
			dataPath,
			data,
			depth,
			index: key,
			children: [],
			hasChildren: hasChildContainer || (hcp ? !!(data as any)?.[hcp] : false),
			isLastChild,
			parentPath,
			parentDataPath,
			label: key,
		};

		if (hasChildContainer)
			node.children = buildObjectMap(
				rawChildren,
				`${dataPath}${seg(ck)}`,
				depth + 1,
				[...parentPath, !isLastChild],
				dataPath,
				options,
			);

		out.push(node);
	}

	return out;
}

/**
 * FLAT rows form a hierarchy only through `parentKey`. Every node is still a row of the bound
 * array, so its dataPath stays a simple top-level index and `Parent.<field>` keeps working.
 *
 * Rows whose parent id is absent from the data are treated as roots rather than dropped, and
 * a `parentKey` cycle is broken by refusing to revisit an id already on the current branch.
 */
function buildFlat(rows: any[], options: TreeShapeOptions): TreeNodeModel[] {
	const idKey = options.idKey || 'id';
	const parentKey = options.parentKey || 'parentId';

	const indexById = new Map<string, number>();
	for (let i = 0; i < rows.length; i++) {
		const id = rows[i]?.[idKey];
		if (id === null || id === undefined) continue;
		const sid = String(id);
		if (!indexById.has(sid)) indexById.set(sid, i);
	}

	const childIndexesByParent = new Map<string, number[]>();
	const rootIndexes: number[] = [];

	for (let i = 0; i < rows.length; i++) {
		const row = rows[i];
		if (row === null || row === undefined) continue;

		const parentId = row[parentKey];
		const sPid = parentId === null || parentId === undefined ? '' : String(parentId);

		// No parent, or a parent that isn't in the data at all, or a self-reference: a root.
		if (!sPid || !indexById.has(sPid) || indexById.get(sPid) === i) {
			rootIndexes.push(i);
			continue;
		}

		const bucket = childIndexesByParent.get(sPid);
		if (bucket) bucket.push(i);
		else childIndexesByParent.set(sPid, [i]);
	}

	const build = (
		indexes: number[],
		depth: number,
		parentPath: boolean[],
		parentDataPath: string | undefined,
		branchIds: Set<string>,
	): TreeNodeModel[] => {
		const out: TreeNodeModel[] = [];

		for (let i = 0; i < indexes.length; i++) {
			const rowIndex = indexes[i];
			const data = rows[rowIndex];
			const dataPath = `[${rowIndex}]`;
			const isLastChild = i === indexes.length - 1;

			const id = data?.[idKey];
			const sid = id === null || id === undefined ? '' : String(id);

			// A parentKey cycle would otherwise recurse forever.
			if (sid && branchIds.has(sid)) continue;

			const childIndexes = sid ? (childIndexesByParent.get(sid) ?? []) : [];

			const node: TreeNodeModel = {
				nodeKey: makeNodeKey(dataPath),
				dataPath,
				data,
				depth,
				index: rowIndex,
				children: [],
				hasChildren: childIndexes.length > 0,
				isLastChild,
				parentPath,
				parentDataPath,
			};

			if (childIndexes.length) {
				const nextBranch = new Set(branchIds);
				if (sid) nextBranch.add(sid);
				node.children = build(
					childIndexes,
					depth + 1,
					[...parentPath, !isLastChild],
					dataPath,
					nextBranch,
				);
			}

			out.push(node);
		}

		return out;
	};

	return build(rootIndexes, 0, [], undefined, new Set());
}

function isContainerValue(v: any): boolean {
	return v !== null && typeof v === 'object';
}

/**
 * RAW_JSON infers structure: objects and arrays become branches, primitives become leaves,
 * and the key or index a value sits under becomes its label. A depth cap and a per-branch
 * visited set keep circular or pathologically deep data from hanging the render.
 */
function buildRawJson(
	container: any,
	containerPath: string,
	depth: number,
	parentPath: boolean[],
	parentDataPath: string | undefined,
	options: TreeShapeOptions,
	seen: Set<any>,
): TreeNodeModel[] {
	if (!isContainerValue(container)) return [];

	const maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;
	if (depth >= maxDepth) return [];
	if (seen.has(container)) return [];

	const nextSeen = new Set(seen);
	nextSeen.add(container);

	const entries: Array<[string | number, any]> = Array.isArray(container)
		? container.map((v, i) => [i, v])
		: Object.entries(container);

	const out: TreeNodeModel[] = [];

	for (let i = 0; i < entries.length; i++) {
		const [key, data] = entries[i];
		const dataPath = joinSegment(containerPath, key);
		const isLastChild = i === entries.length - 1;

		const hasChildren =
			isContainerValue(data) && !nextSeen.has(data) && Object.keys(data).length > 0;

		const node: TreeNodeModel = {
			nodeKey: makeNodeKey(dataPath),
			dataPath,
			data,
			depth,
			index: key,
			children: [],
			hasChildren,
			isLastChild,
			parentPath,
			parentDataPath,
			label: String(key),
		};

		if (hasChildren)
			node.children = buildRawJson(
				data,
				dataPath,
				depth + 1,
				[...parentPath, !isLastChild],
				dataPath,
				options,
				nextSeen,
			);

		out.push(node);
	}

	return out;
}

// ---------------------------------------------------------------------------
// traversal helpers
// ---------------------------------------------------------------------------

/** Depth-first list of the rows that are actually visible, honouring the expansion set. */
export function flattenVisibleTree(
	roots: TreeNodeModel[],
	isExpanded: (nodeKey: string) => boolean,
): TreeNodeModel[] {
	const out: TreeNodeModel[] = [];

	const walk = (nodes: TreeNodeModel[]) => {
		for (const node of nodes) {
			out.push(node);
			if (node.children.length && isExpanded(node.nodeKey)) walk(node.children);
		}
	};

	walk(roots);
	return out;
}

export function forEachTreeNode(roots: TreeNodeModel[], fn: (node: TreeNodeModel) => void): void {
	for (const node of roots) {
		fn(node);
		if (node.children.length) forEachTreeNode(node.children, fn);
	}
}

export function findTreeNodeByKey(
	roots: TreeNodeModel[],
	nodeKey: string,
): TreeNodeModel | undefined {
	for (const node of roots) {
		if (node.nodeKey === nodeKey) return node;
		if (node.children.length) {
			const found = findTreeNodeByKey(node.children, nodeKey);
			if (found) return found;
		}
	}
	return undefined;
}

/**
 * Note this recurses unconditionally rather than pruning branches whose path is not a prefix
 * of the target. That pruning only holds for the shapes whose hierarchy mirrors the storage
 * nesting; in FLAT every node is a top-level `[i]`, so a child's path is not prefixed by its
 * parent's and prefix-pruning would never find it.
 */
export function findTreeNodeByPath(
	roots: TreeNodeModel[],
	dataPath: string,
): TreeNodeModel | undefined {
	for (const node of roots) {
		if (node.dataPath === dataPath) return node;
		if (node.children.length) {
			const found = findTreeNodeByPath(node.children, dataPath);
			if (found) return found;
		}
	}
	return undefined;
}

/**
 * Expansion defaults. `0` collapses everything, `-1` expands everything, `N` expands the
 * first N levels.
 */
export function computeDefaultExpanded(roots: TreeNodeModel[], level: number): Set<string> {
	const keys = new Set<string>();
	if (!level) return keys;

	forEachTreeNode(roots, node => {
		if (!node.hasChildren) return;
		if (level === -1 || node.depth < level) keys.add(node.nodeKey);
	});

	return keys;
}

/**
 * A cheap fingerprint of the tree's shape. Comparing it lets expansion defaults be re-applied
 * when the data genuinely changes, instead of latching after the first render the way Table's
 * `treeExpandInitialized` ref does.
 */
export function treeStructureSignature(roots: TreeNodeModel[]): string {
	const parts: string[] = [];
	forEachTreeNode(roots, node => parts.push(node.nodeKey, node.hasChildren ? '1' : '0'));
	return cyrb53(parts.join('|'));
}

// ---------------------------------------------------------------------------
// editing
// ---------------------------------------------------------------------------

/** Which editing operations a given shape can actually express. */
export function supportsTreeEditing(dataShape: TreeDataShape): boolean {
	return dataShape !== 'RAW_JSON';
}

export function supportsTreeReorder(dataShape: TreeDataShape): boolean {
	return dataShape !== 'RAW_JSON';
}

function removeFromContainer(container: any, key: string | number): void {
	if (Array.isArray(container) && typeof key === 'number') container.splice(key, 1);
	else delete container[key];
}

/**
 * Insert `value` under `key` into an object, positioned relative to `beforeKey`.
 *
 * Object key order is insertion order for string keys, so sibling order in an OBJECT_MAP can
 * be expressed by rebuilding the object. The exception is integer-like keys, which engines
 * always iterate in numeric order — for those, ordering silently cannot be controlled.
 */
function insertIntoObjectAt(
	container: any,
	key: string,
	value: any,
	anchorKey: string | undefined,
	after: boolean,
): any {
	const rebuilt: any = {};
	let placed = false;

	for (const [k, v] of Object.entries(container)) {
		if (k === key) continue;
		if (!after && k === anchorKey) {
			rebuilt[key] = value;
			placed = true;
		}
		rebuilt[k] = v;
		if (after && k === anchorKey) {
			rebuilt[key] = value;
			placed = true;
		}
	}

	if (!placed) rebuilt[key] = value;
	return rebuilt;
}

function childrenKeyForDepth(options: TreeShapeOptions, depth: number): string {
	return getChildrenKeyAtDepth(options.childrenKey, depth);
}

/**
 * Move a node next to, or inside, another node.
 *
 * Returns the whole reshaped bound value, or `undefined` when the move is not expressible —
 * the caller then leaves the data alone. Dropping a node onto itself or into its own subtree
 * is refused, since that would detach the subtree from the data entirely.
 */
export function moveTreeNode(
	rawValue: any,
	source: TreeNodeModel,
	target: TreeNodeModel,
	position: DropPosition,
	options: TreeShapeOptions,
): any | undefined {
	if (!supportsTreeEditing(options.dataShape)) return undefined;
	if (isSelfOrDescendantPath(target.dataPath, source.dataPath)) return undefined;

	if (options.dataShape === 'FLAT')
		return moveFlatNode(rawValue, source, target, position, options);

	const next = duplicate(rawValue);

	const sourceResolved = resolveContainer(next, source.dataPath);
	if (!sourceResolved) return undefined;

	const moved = sourceResolved.container[sourceResolved.key as any];
	if (moved === undefined) return undefined;

	const sourceContainerPath = containerPathOf(source.dataPath);
	removeFromContainer(sourceResolved.container, sourceResolved.key);

	// The removal may have shifted the target if it sat after the source in the same array.
	const adjustedTargetPath = adjustPathAfterRemoval(
		target.dataPath,
		sourceContainerPath,
		sourceResolved.key,
	);

	if (position === 'INSIDE') {
		const targetResolved = resolveContainer(next, adjustedTargetPath);
		if (!targetResolved) return undefined;

		const targetNode = targetResolved.container[targetResolved.key as any];
		if (targetNode === null || typeof targetNode !== 'object') return undefined;

		const ck = childrenKeyForDepth(options, target.depth);
		const existing = targetNode[ck];

		if (options.dataShape === 'OBJECT_MAP' && !Array.isArray(existing)) {
			const key = typeof source.index === 'string' ? source.index : shortUUID();
			targetNode[ck] = insertIntoObjectAt(existing ?? {}, key, moved, undefined, true);
		} else {
			if (!Array.isArray(existing)) targetNode[ck] = [];
			targetNode[ck].push(moved);
		}

		return next;
	}

	const targetContainerResolved = resolveContainer(next, adjustedTargetPath);
	if (!targetContainerResolved) return undefined;

	const { container, key } = targetContainerResolved;

	if (Array.isArray(container) && typeof key === 'number') {
		container.splice(position === 'AFTER' ? key + 1 : key, 0, moved);
		return next;
	}

	// Object-keyed sibling container: rebuild it with the node in the requested position.
	const newKey = typeof source.index === 'string' ? source.index : shortUUID();
	const rebuilt = insertIntoObjectAt(container, newKey, moved, String(key), position === 'AFTER');

	const parentOfContainer = resolveContainer(next, containerPathOf(adjustedTargetPath));
	if (!parentOfContainer) return rebuilt;

	parentOfContainer.container[parentOfContainer.key as any] = rebuilt;
	return next;
}

/**
 * FLAT is the cheap case: reparenting is just a `parentKey` write. Sibling order comes from
 * array order, so BEFORE/AFTER additionally moves the row next to its new sibling.
 */
function moveFlatNode(
	rawValue: any,
	source: TreeNodeModel,
	target: TreeNodeModel,
	position: DropPosition,
	options: TreeShapeOptions,
): any | undefined {
	if (!Array.isArray(rawValue)) return undefined;

	const idKey = options.idKey || 'id';
	const parentKey = options.parentKey || 'parentId';

	const next: any[] = duplicate(rawValue);

	const sourceIndex = typeof source.index === 'number' ? source.index : -1;
	const targetIndex = typeof target.index === 'number' ? target.index : -1;
	if (sourceIndex < 0 || targetIndex < 0) return undefined;

	const row = next[sourceIndex];
	if (!row) return undefined;

	if (position === 'INSIDE') {
		row[parentKey] = next[targetIndex]?.[idKey];
		return next;
	}

	row[parentKey] = next[targetIndex]?.[parentKey] ?? null;

	const [lifted] = next.splice(sourceIndex, 1);
	// Removing the row shifts anything after it down one.
	const anchor = targetIndex > sourceIndex ? targetIndex - 1 : targetIndex;
	next.splice(position === 'AFTER' ? anchor + 1 : anchor, 0, lifted);

	return next;
}

/**
 * Delete a node and everything under it. In NESTED / OBJECT_MAP the subtree leaves with its
 * parent; in FLAT the descendants are separate rows and have to be collected explicitly.
 */
export function deleteTreeNode(
	rawValue: any,
	node: TreeNodeModel,
	options: TreeShapeOptions,
): any | undefined {
	if (!supportsTreeEditing(options.dataShape)) return undefined;

	if (options.dataShape === 'FLAT') {
		if (!Array.isArray(rawValue)) return undefined;

		const doomed = new Set<number>();
		const collect = (n: TreeNodeModel) => {
			if (typeof n.index === 'number') doomed.add(n.index);
			n.children.forEach(collect);
		};
		collect(node);

		return duplicate(rawValue).filter((_: any, i: number) => !doomed.has(i));
	}

	const next = duplicate(rawValue);
	const resolved = resolveContainer(next, node.dataPath);
	if (!resolved) return undefined;

	removeFromContainer(resolved.container, resolved.key);
	return next;
}

/**
 * Add a node as a child of, or a sibling to, an existing node. `newNode` is the template
 * object the author configured; a fresh id is stamped on for the shapes that need one.
 */
export function addTreeNode(
	rawValue: any,
	node: TreeNodeModel,
	mode: 'CHILD' | 'SIBLING',
	newNode: any,
	options: TreeShapeOptions,
): any | undefined {
	if (!supportsTreeEditing(options.dataShape)) return undefined;

	const template = newNode === null || newNode === undefined ? {} : duplicate(newNode);

	if (options.dataShape === 'FLAT') {
		if (!Array.isArray(rawValue)) return undefined;

		const idKey = options.idKey || 'id';
		const parentKey = options.parentKey || 'parentId';
		const next: any[] = duplicate(rawValue);

		template[idKey] ??= shortUUID();

		// A child hangs off the anchor; a sibling inherits the anchor's own parent.
		template[parentKey] =
			mode === 'CHILD' ? (node.data?.[idKey] ?? null) : (node.data?.[parentKey] ?? null);

		const anchor = typeof node.index === 'number' ? node.index : next.length - 1;
		next.splice(anchor + 1, 0, template);
		return next;
	}

	const next = duplicate(rawValue);

	if (mode === 'CHILD') {
		const resolved = resolveContainer(next, node.dataPath);
		if (!resolved) return undefined;

		const targetNode = resolved.container[resolved.key as any];
		if (targetNode === null || typeof targetNode !== 'object') return undefined;

		const ck = childrenKeyForDepth(options, node.depth);
		const existing = targetNode[ck];

		if (options.dataShape === 'OBJECT_MAP' && !Array.isArray(existing)) {
			targetNode[ck] = { ...(existing ?? {}), [shortUUID()]: template };
		} else {
			if (!Array.isArray(existing)) targetNode[ck] = [];
			targetNode[ck].push(template);
		}

		return next;
	}

	const resolved = resolveContainer(next, node.dataPath);
	if (!resolved) return undefined;

	const { container, key } = resolved;

	if (Array.isArray(container) && typeof key === 'number') {
		container.splice(key + 1, 0, template);
		return next;
	}

	const rebuilt = insertIntoObjectAt(container, shortUUID(), template, String(key), true);
	const parentOfContainer = resolveContainer(next, containerPathOf(node.dataPath));
	if (!parentOfContainer) return rebuilt;

	parentOfContainer.container[parentOfContainer.key as any] = rebuilt;
	return next;
}

// ---------------------------------------------------------------------------
// node scoping
// ---------------------------------------------------------------------------

/**
 * Build the `locationHistory` frames that make `Parent.<field>` resolve to a node.
 *
 * Two frames per node — the parent, then the node — which keeps the hop count
 * depth-independent. That matters because one authored template is re-rendered at every depth:
 *
 *   Parent.x                 the node
 *   Parent.Parent.x          its parent, or undefined for a root node
 *   Parent.Parent.Parent.x   whatever encloses the tree — the same expression at any depth
 *
 * One frame per ancestor would instead make that last expression mean something different at
 * every level, so no template could reliably reach outside the tree.
 *
 * `location` is a plain string rather than a DataLocation because `useDefinition` rebuilds a
 * template's store listeners from `locationHistory.map(e => e.location + '_' + e.index)`. An
 * object stringifies to "[object Object]", so a node whose path changed while its index did
 * not would keep listening to its old path.
 *
 * A root node's parent frame points at `deadPath`, not at the binding root. Pointing it at the
 * binding root looks harmless but is not: for the array-rooted shapes `Parent.Parent.label`
 * then resolves to `<binding>.label`, and indexing an array with a non-numeric key makes the
 * expression evaluator throw ("label is not a number"), which takes the whole page down
 * through the error boundary. Since one template renders at every depth, any template using
 * `Parent.Parent` would hit this on every root node. An unwritten scratch path yields
 * undefined instead, which is what a root node's parent should read as.
 */
export function buildNodeFrames(
	baseHistory: Array<LocationHistory>,
	bindingPathPath: string,
	node: TreeNodeModel,
	parentNode: TreeNodeModel | undefined,
	pageName: string,
	componentKey: string,
	deadPath: string,
): Array<LocationHistory> {
	return [
		...baseHistory,
		{
			location: hasAddressableFields(parentNode?.data)
				? `${bindingPathPath}${node.parentDataPath}`
				: deadPath,
			index: parentNode?.index ?? '',
			pageName,
			componentKey,
		},
		{
			location: hasAddressableFields(node.data)
				? `${bindingPathPath}${node.dataPath}`
				: deadPath,
			index: node.index,
			pageName,
			componentKey,
		},
	];
}

/**
 * Whether `Parent.<field>` can legally be read off this node's data.
 *
 * Only a plain object qualifies. Pointing a frame at anything else is not merely useless but
 * fatal: `Parent.label` against the string "raw" resolves to `<path>.label`, and indexing a
 * string or an array with a non-numeric key makes the expression evaluator throw, which the
 * error boundary turns into a blank page. Since one template renders at every node, a single
 * such node would take down a tree that renders fine otherwise. Both cases were reproduced in
 * the browser with RAW_JSON data holding a string and an array.
 *
 * Arrays are excluded deliberately, not by oversight. `Parent.0` is not valid path syntax, and
 * the bracket form `Parent[0]` never worked either — ParentExtractor counts leading `Parent`
 * segments by splitting on dots, so `Parent[0]` is one segment that does not equal `Parent`,
 * which leaves its index one past the end of the history. So nothing addressable is lost.
 */
function hasAddressableFields(data: any): boolean {
	return data !== null && data !== undefined && typeof data === 'object' && !Array.isArray(data);
}
