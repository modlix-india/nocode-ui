import { deepEqual, duplicate, ExpressionEvaluator, isNullValue } from '@fincity/kirun-js';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	addListenerAndCallImmediately,
	addListenerAndCallImmediatelyWithChildrenActivity,
	getPathFromLocation,
	PageStoreExtractor,
	setData as setStoreData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { ComponentProps, LocationHistory } from '../../types/common';
import {
	processComponentStylePseudoClasses,
	processStyleObjectToCSS,
} from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { getExtractionMap } from '../util/getRenderData';
import { runEvent } from '../util/runEvent';
import {
	addTreeNode,
	buildNodeFrames,
	computeDefaultExpanded,
	deleteTreeNode,
	DropPosition,
	flattenVisibleTree,
	forEachTreeNode,
	moveTreeNode,
	normalizeTreeData,
	supportsTreeEditing,
	TreeDataShape,
	TreeNodeModel,
	TreeShapeOptions,
	treeStructureSignature,
} from '../util/treeData';
import useDefinition from '../util/useDefinition';
import { flattenUUID } from '../util/uuid';
import { propertiesDefinition, stylePropertiesDefinition } from './treeProperties';
import { TreeColumns } from './TreeColumns';
import { TreeRecursive } from './TreeRecursive';
import { TreeDragState, TreeRenderContext } from './treeTypes';

const DRAG_KEY = '_tree_drag';

/** Slots whose styling must be compiled to CSS because they carry state variants. */
const STATEFUL_SLOTS: Array<[string, string]> = [
	['nodeContainer', '._node'],
	['nodeRow', '._nodeRow'],
	['nodeContent', '._nodeContent'],
	['nodeActions', '._nodeActions'],
	['toggle', '._toggle'],
	['toggleExpanded', '._toggle._expanded'],
	['toggleCollapsed', '._toggle._collapsed'],
	['leafSpacer', '._leafSpacer'],
	['childrenContainer', '._children'],
	['checkBox', '._checkBox'],
	['dragHandle', '._dragHandle'],
	['buttonAdd', '._buttonAdd'],
	['buttonDelete', '._buttonDelete'],
	['dropBefore', '._dropIndicator._before'],
	['dropAfter', '._dropIndicator._after'],
	['dropInto', '._dropIndicator._into'],
	['columnChevronIcon', '._columnChevron'],
	['columnDividerLine', '._columnDivider'],
];

/** Slots that appear once (or once per column) and have no state variants. */
const INLINE_SLOTS = ['comp', 'viewport', 'column', 'columnHeaderPart', 'emptyState'];

export default function TreeComponent(props: Readonly<ComponentProps>) {
	const {
		definition: { children, bindingPath, bindingPath2, bindingPath3, bindingPath4, key },
		pageDefinition,
		locationHistory = [],
		context,
		definition,
	} = props;

	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);

	const {
		properties: {
			dataShape,
			childrenKey,
			hasChildrenProperty,
			idKey,
			parentKey,
			maxDepth,
			labelPath,
			defaultData,
			defaultExpandLevel,
			expandToSelection,
			singleExpand,
			expandIcon,
			collapseIcon,
			unmountCollapsedChildren,
			onExpand,
			onCollapse,
			selectionType,
			selectionKey,
			multiSelect,
			showCheckBoxes,
			multiSelectNoSelectionValue,
			clearOnSelectingSameValue,
			removeKeyWhenEmpty,
			selectionBehaviour,
			onSelect,
			onNodeClick,
			editable,
			allowReorder,
			allowReparent,
			allowAdd,
			allowDelete,
			newNodeTemplate,
			canDragCondition,
			canDropCondition,
			dropAutoExpandDelay,
			addIcon,
			deleteIcon,
			dragHandleIcon,
			onNodeMove,
			onNodeAdd,
			onNodeDelete,
			treeDesign,
			treeOrientation,
			showGuides,
			toggleStyle,
			showColumnHeaders,
			emptyStateText,
			colorScheme,
			readOnly,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);

	// ------------------------------------------------------------------ paths
	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: `Store.defaultData.${pageExtractor?.getPageName() ?? '_global'}.${flattenUUID(key)}`;
	const selectionPath = bindingPath2
		? getPathFromLocation(bindingPath2, locationHistory, pageExtractor)
		: undefined;
	const expandedPath = bindingPath3
		? getPathFromLocation(bindingPath3, locationHistory, pageExtractor)
		: undefined;
	const activePathPath = bindingPath4
		? getPathFromLocation(bindingPath4, locationHistory, pageExtractor)
		: undefined;

	// ------------------------------------------------------------------ data
	// Seeds the binding on mount, mirroring ArrayRepeater's defaultData.
	useEffect(() => {
		if (defaultData === undefined || defaultData === null) return;
		setStoreData(bindingPathPath, defaultData, context.pageName);
	}, [defaultData, bindingPathPath, context.pageName]);

	const [rawData, setRawData] = useState<any>();
	useEffect(
		() =>
			addListenerAndCallImmediatelyWithChildrenActivity(
				context.pageName,
				(_, v) => setRawData(v),
				bindingPathPath,
			),
		[bindingPathPath, context.pageName],
	);

	const shapeOptions = useMemo<TreeShapeOptions>(
		() => ({
			dataShape: (dataShape ?? 'NESTED') as TreeDataShape,
			childrenKey,
			hasChildrenProperty,
			idKey,
			parentKey,
			maxDepth,
		}),
		[dataShape, childrenKey, hasChildrenProperty, idKey, parentKey, maxDepth],
	);

	const roots = useMemo(() => normalizeTreeData(rawData, shapeOptions), [rawData, shapeOptions]);
	const signature = useMemo(() => treeStructureSignature(roots), [roots]);

	const byPath = useMemo(() => {
		const m = new Map<string, TreeNodeModel>();
		forEachTreeNode(roots, n => m.set(n.dataPath, n));
		return m;
	}, [roots]);

	/*
	 * Selection is read here, above expansion, because Expand To Selection makes expansion
	 * depend on it: `isExpanded` has to be able to ask which nodes are ancestors of the
	 * selected one. The write side of selection stays below, next to the other handlers.
	 */
	// ------------------------------------------------------------------ selection (read)
	const [selection, setSelection] = useState<any>();
	useEffect(() => {
		if (!selectionPath) return undefined;
		return addListenerAndCallImmediately(
			context.pageName,
			(_, v) => setSelection(v),
			selectionPath,
		);
	}, [selectionPath, context.pageName]);

	const selectionValueOf = useCallback(
		(node: TreeNodeModel): any => {
			switch (selectionType) {
				case 'PATH':
					return `${bindingPathPath}${node.dataPath}`;
				case 'OBJECT':
					return duplicate(node.data);
				case 'KEY': {
					if (!selectionKey) return undefined;
					return new ExpressionEvaluator(`Data.${selectionKey}`).evaluate(
						getExtractionMap(node.data),
					);
				}
				case 'TREE_KEY':
					return node.nodeKey;
				default:
					return undefined;
			}
		},
		[selectionType, selectionKey, bindingPathPath],
	);

	const isSelectable = useCallback(
		(node: TreeNodeModel): boolean => {
			if (selectionType === 'NONE' || !selectionPath || readOnly) return false;
			if (selectionBehaviour === 'LEAF_ONLY') return !node.hasChildren;
			if (selectionBehaviour === 'BRANCH_ONLY') return node.hasChildren;
			return true;
		},
		[selectionType, selectionPath, selectionBehaviour, readOnly],
	);

	const isSelected = useCallback(
		(node: TreeNodeModel): boolean => {
			if (selectionType === 'NONE' || !selectionPath) return false;
			const value = selectionValueOf(node);
			if (value === undefined) return false;
			if (multiSelect)
				return Array.isArray(selection)
					? selection.some((e: any) => deepEqual(e, value))
					: false;
			return deepEqual(selection, value);
		},
		[selectionType, selectionPath, selectionValueOf, multiSelect, selection],
	);

	// ------------------------------------------------------------------ expansion
	/*
	 * Every ancestor of a selected node, so a deep link into a collapsed branch reveals
	 * itself rather than looking like the tree ignored it. Recomputed from the data, never
	 * written to the expansion binding: nothing here is a user action, so nothing here
	 * should survive as one.
	 */
	const selectionAncestors = useMemo(() => {
		const keys = new Set<string>();
		if (!expandToSelection || selectionType === 'NONE' || !selectionPath) return keys;

		const walk = (nodes: TreeNodeModel[], chain: string[]) => {
			for (const node of nodes) {
				if (isSelected(node)) for (const k of chain) keys.add(k);
				if (node.children.length) walk(node.children, [...chain, node.nodeKey]);
			}
		};
		walk(roots, []);

		return keys;
	}, [roots, isSelected, expandToSelection, selectionType, selectionPath]);

	const [openedByUser, setOpenedByUser] = useState<Set<string>>(() => new Set());
	const [closedByUser, setClosedByUser] = useState<Set<string>>(() => new Set());
	const [boundExpanded, setBoundExpanded] = useState<any>();

	/*
	 * The listener is handed the expansion map itself, and the store mutates that object in
	 * place, so the reference never changes after the map first appears. Passing it straight
	 * to setState means React compares it against itself and skips the render: the very first
	 * toggle works, because it creates the map, and every toggle after it is silently ignored.
	 * Copy on the way in so each change carries a new identity.
	 */
	useEffect(() => {
		if (!expandedPath) return undefined;
		return addListenerAndCallImmediatelyWithChildrenActivity(
			context.pageName,
			(_, v) => setBoundExpanded(v && typeof v === 'object' ? { ...v } : v),
			expandedPath,
		);
	}, [expandedPath, context.pageName]);

	const defaults = useMemo(
		() => computeDefaultExpanded(roots, defaultExpandLevel ?? 0),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[signature, defaultExpandLevel],
	);

	/*
	 * Prune toggles for nodes that no longer exist. Without this the sets grow without bound
	 * across refetches, and a recycled path could inherit a stale open/closed state.
	 */
	useEffect(() => {
		const live = new Set<string>();
		forEachTreeNode(roots, n => live.add(n.nodeKey));
		const keep = (s: Set<string>) => {
			const next = new Set([...s].filter(k => live.has(k)));
			return next.size === s.size ? s : next;
		};
		setOpenedByUser(keep);
		setClosedByUser(keep);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [signature]);

	/*
	 * Expansion is derived, never latched. `defaults` recomputes whenever the tree's shape
	 * changes, so a refetch re-applies Default Expand Level, while a node the user has
	 * explicitly toggled keeps its state. Table's equivalent sets an "initialised" ref that
	 * never resets, which is why its defaults go stale after the first load.
	 */
	const isExpanded = useCallback(
		(nodeKey: string): boolean => {
			if (expandedPath) {
				const v = boundExpanded?.[nodeKey];
				if (v !== undefined) return !!v;
				return defaults.has(nodeKey) || selectionAncestors.has(nodeKey);
			}
			if (closedByUser.has(nodeKey)) return false;
			if (openedByUser.has(nodeKey)) return true;
			return defaults.has(nodeKey) || selectionAncestors.has(nodeKey);
		},
		[expandedPath, boundExpanded, defaults, openedByUser, closedByUser, selectionAncestors],
	);

	const visibleNodes = useMemo(() => flattenVisibleTree(roots, isExpanded), [roots, isExpanded]);

	// ------------------------------------------------------------------ node scoping
	/*
	 * Two frames per node: the parent, then the node itself.
	 *
	 * This keeps the hop count depth-independent, which matters because one authored template
	 * renders at every depth. `Parent.x` is the node, `Parent.Parent.x` is its parent, and
	 * `Parent.Parent.Parent.x` reaches outside the tree from any depth. One frame per ancestor
	 * would make that last expression mean something different at every level.
	 *
	 * `location` is a plain string, not a DataLocation. useDefinition rebuilds a template's
	 * store listeners off `locationHistory.map(e => e.location + '_' + e.index)`, so an object
	 * collapses to "[object Object]" and a node whose path changed but whose index did not
	 * would keep listening to the old path.
	 */
	/*
	 * Never-written scratch path standing in for a root node's absent parent. See
	 * buildNodeFrames: pointing it at the binding root instead makes `Parent.Parent.<field>`
	 * throw on array-rooted data.
	 *
	 * The name must not contain the substring "Parent". useDefinition decides whether to
	 * re-resolve a listener path with `path.indexOf('Parent') !== -1`, so a path merely
	 * containing that word is handed to ParentExtractor.getPath, which finds no leading
	 * `Parent.` segment, computes pNum = 0, and reads locationHistory[length] — one past the
	 * end — then dereferences it. Naming this `_noParent` crashed the page.
	 */
	const rootAnchorPath = `Store.defaultData.${
		pageExtractor?.getPageName() ?? '_global'
	}.${flattenUUID(key)}_treeRootAnchor`;

	const nodeFrames = useCallback(
		(node: TreeNodeModel): Array<LocationHistory> =>
			buildNodeFrames(
				locationHistory,
				bindingPathPath,
				node,
				node.parentDataPath ? byPath.get(node.parentDataPath) : undefined,
				context.pageName,
				key,
				rootAnchorPath,
			),
		[locationHistory, bindingPathPath, context.pageName, key, byPath, rootAnchorPath],
	);

	const fire = useCallback(
		(eventName: string | undefined, node?: TreeNodeModel) => {
			if (!eventName) return;
			const fn = pageDefinition.eventFunctions?.[eventName];
			if (!fn) return;
			(async () =>
				runEvent(
					fn,
					eventName,
					context.pageName,
					node ? nodeFrames(node) : locationHistory,
					pageDefinition,
				))();
		},
		[pageDefinition, context.pageName, nodeFrames, locationHistory],
	);

	const siblingsOf = useCallback(
		(node: TreeNodeModel): TreeNodeModel[] => {
			if (!node.parentDataPath) return roots;
			return byPath.get(node.parentDataPath)?.children ?? [];
		},
		[roots, byPath],
	);

	const toggle = useCallback(
		(node: TreeNodeModel) => {
			const wasExpanded = isExpanded(node.nodeKey);
			const siblingKeys =
				singleExpand && !wasExpanded
					? siblingsOf(node)
							.map(s => s.nodeKey)
							.filter(k => k !== node.nodeKey)
					: [];

			if (expandedPath) {
				// One key at a time, so a page function can flip a single node without
				// rewriting the whole map. nodeKey is store-safe by construction.
				setStoreData(`${expandedPath}.${node.nodeKey}`, !wasExpanded, context.pageName);
				siblingKeys.forEach(k =>
					setStoreData(`${expandedPath}.${k}`, false, context.pageName),
				);
			} else {
				setOpenedByUser(prev => {
					const next = new Set(prev);
					if (wasExpanded) next.delete(node.nodeKey);
					else next.add(node.nodeKey);
					siblingKeys.forEach(k => next.delete(k));
					return next;
				});
				setClosedByUser(prev => {
					const next = new Set(prev);
					if (wasExpanded) next.add(node.nodeKey);
					else next.delete(node.nodeKey);
					siblingKeys.forEach(k => next.add(k));
					return next;
				});
			}

			fire(wasExpanded ? onCollapse : onExpand, node);
		},
		[
			isExpanded,
			expandedPath,
			context.pageName,
			singleExpand,
			siblingsOf,
			fire,
			onExpand,
			onCollapse,
		],
	);

	const select = useCallback(
		(node: TreeNodeModel) => {
			fire(onNodeClick, node);
			if (!isSelectable(node) || !selectionPath) return;

			const value = selectionValueOf(node);
			if (value === undefined) return;

			if (multiSelect) {
				const current = Array.isArray(selection)
					? selection
					: isNullValue(selection)
						? []
						: [selection];
				const at = current.findIndex((e: any) => deepEqual(e, value));
				let next: any =
					at === -1
						? [...current, value]
						: current.filter((_: any, i: number) => i !== at);

				if (!next.length && multiSelectNoSelectionValue !== 'EMPTY_ARRAY')
					next = multiSelectNoSelectionValue === 'NULL' ? null : undefined;

				setStoreData(selectionPath, next, context.pageName, removeKeyWhenEmpty);
			} else {
				const clear = deepEqual(selection, value) && clearOnSelectingSameValue;
				setStoreData(
					selectionPath,
					clear ? undefined : value,
					context.pageName,
					removeKeyWhenEmpty,
				);
			}

			fire(onSelect, node);
		},
		[
			fire,
			onNodeClick,
			onSelect,
			isSelectable,
			selectionPath,
			selectionValueOf,
			multiSelect,
			selection,
			multiSelectNoSelectionValue,
			clearOnSelectingSameValue,
			removeKeyWhenEmpty,
			context.pageName,
		],
	);

	// ------------------------------------------------------------------ editing
	const shape = (dataShape ?? 'NESTED') as TreeDataShape;
	const canEdit = !!editable && !readOnly && supportsTreeEditing(shape);

	const evalPerNode = useCallback((condition: any, node: TreeNodeModel): boolean => {
		if (condition === undefined || condition === null) return true;
		if (typeof condition === 'boolean') return condition;
		try {
			return !!new ExpressionEvaluator(String(condition)).evaluate(
				getExtractionMap(node.data),
			);
		} catch {
			return true;
		}
	}, []);

	const commit = useCallback(
		(next: any, eventName: string | undefined, node: TreeNodeModel) => {
			if (next === undefined) return;
			setStoreData(bindingPathPath, next, context.pageName);
			fire(eventName, node);
		},
		[bindingPathPath, context.pageName, fire],
	);

	const addNode = useCallback(
		(node: TreeNodeModel, mode: 'CHILD' | 'SIBLING') => {
			if (!canEdit || !allowAdd) return;
			commit(
				addTreeNode(rawData, node, mode, newNodeTemplate, shapeOptions),
				onNodeAdd,
				node,
			);
		},
		[canEdit, allowAdd, rawData, newNodeTemplate, shapeOptions, commit, onNodeAdd],
	);

	const removeNode = useCallback(
		(node: TreeNodeModel) => {
			if (!canEdit || !allowDelete) return;
			commit(deleteTreeNode(rawData, node, shapeOptions), onNodeDelete, node);
		},
		[canEdit, allowDelete, rawData, shapeOptions, commit, onNodeDelete],
	);

	// ------------------------------------------------------------------ drag and drop
	const [drag, setDrag] = useState<TreeDragState>({});
	const hoverTimer = useRef<any>(undefined);

	/** Rejects a drag started in another tree, or in another repetition of this one. */
	const dragScope = useMemo(
		() => `${locationHistory.map(e => `${e.componentKey}_${e.index}`).join('_')}_${key}`,
		[locationHistory, key],
	);

	const clearHoverTimer = () => {
		if (hoverTimer.current) {
			clearTimeout(hoverTimer.current);
			hoverTimer.current = undefined;
		}
	};

	const onDragStart = useCallback(
		(e: React.DragEvent<HTMLElement>, node: TreeNodeModel) => {
			e.stopPropagation();
			e.dataTransfer.setData(DRAG_KEY, `${dragScope}::${node.dataPath}`);
			// Handy side effect: an ArrayRepeater with dropDataType application/json can
			// receive a dragged tree node as-is.
			e.dataTransfer.setData('text/plain', labelOfRef.current(node));
			try {
				e.dataTransfer.setData('application/json', JSON.stringify(node.data));
			} catch {
				/* circular node data is not worth failing a drag over */
			}
			setDrag({ sourceKey: node.nodeKey });
		},
		[dragScope],
	);

	const positionFor = useCallback(
		(e: React.DragEvent<HTMLElement>): DropPosition => {
			const rect = e.currentTarget.getBoundingClientRect();
			const offset = (e.clientY - rect.top) / (rect.height || 1);
			if (!allowReparent) return offset < 0.5 ? 'BEFORE' : 'AFTER';
			if (!allowReorder) return 'INSIDE';
			if (offset < 0.25) return 'BEFORE';
			if (offset > 0.75) return 'AFTER';
			return 'INSIDE';
		},
		[allowReorder, allowReparent],
	);

	const onDragOver = useCallback(
		(e: React.DragEvent<HTMLElement>, node: TreeNodeModel) => {
			if (!canEdit) return;
			e.preventDefault();
			e.stopPropagation();

			const position = positionFor(e);
			const source = drag.sourceKey ? findByNodeKey(roots, drag.sourceKey) : undefined;
			// Dropping a node into its own subtree would detach the subtree from the data.
			const denied =
				!evalPerNode(canDropCondition, node) ||
				(!!source && isAncestorOrSelf(source, node)) ||
				(position === 'INSIDE' && !allowReparent) ||
				(position !== 'INSIDE' && !allowReorder);

			setDrag(prev =>
				prev.overKey === node.nodeKey &&
				prev.position === position &&
				prev.denied === denied
					? prev
					: { ...prev, overKey: node.nodeKey, position, denied },
			);

			// Hovering a collapsed node opens it, so a node can be dropped deep in the tree.
			if (
				position === 'INSIDE' &&
				!denied &&
				node.hasChildren &&
				!isExpanded(node.nodeKey) &&
				(dropAutoExpandDelay ?? 0) > 0 &&
				!hoverTimer.current
			) {
				hoverTimer.current = setTimeout(() => {
					hoverTimer.current = undefined;
					toggle(node);
				}, dropAutoExpandDelay);
			}
		},
		[
			canEdit,
			positionFor,
			drag.sourceKey,
			roots,
			evalPerNode,
			canDropCondition,
			allowReparent,
			allowReorder,
			isExpanded,
			dropAutoExpandDelay,
			toggle,
		],
	);

	const onDragLeave = useCallback((e: React.DragEvent<HTMLElement>) => {
		e.preventDefault();
		clearHoverTimer();
		setDrag(prev =>
			prev.overKey ? { ...prev, overKey: undefined, position: undefined } : prev,
		);
	}, []);

	const onDragEnd = useCallback(() => {
		clearHoverTimer();
		setDrag({});
	}, []);

	useEffect(() => clearHoverTimer, []);

	const onDrop = useCallback(
		(e: React.DragEvent<HTMLElement>, target: TreeNodeModel) => {
			e.preventDefault();
			e.stopPropagation();
			clearHoverTimer();

			const payload = e.dataTransfer.getData(DRAG_KEY);
			setDrag({});
			if (!payload || !canEdit) return;

			const separator = payload.indexOf('::');
			if (separator === -1) return;
			// Split on '::' rather than the last underscore: a dataPath legitimately contains
			// underscores, which is what breaks ArrayRepeater's lastIndexOf('_') parse.
			if (payload.substring(0, separator) !== dragScope) return;

			const sourcePath = payload.substring(separator + 2);
			const source = byPath.get(sourcePath);
			if (!source || source.nodeKey === target.nodeKey) return;
			if (isAncestorOrSelf(source, target)) return;
			if (!evalPerNode(canDropCondition, target)) return;

			const position = positionFor(e);
			if (position === 'INSIDE' && !allowReparent) return;
			if (position !== 'INSIDE' && !allowReorder) return;

			commit(
				moveTreeNode(rawData, source, target, position, shapeOptions),
				onNodeMove,
				source,
			);
		},
		[
			canEdit,
			dragScope,
			byPath,
			evalPerNode,
			canDropCondition,
			positionFor,
			allowReparent,
			allowReorder,
			rawData,
			shapeOptions,
			commit,
			onNodeMove,
		],
	);

	// ------------------------------------------------------------------ labels
	const labelOf = useCallback(
		(node: TreeNodeModel): string => {
			if (labelPath) {
				const v = node.data?.[labelPath];
				if (v !== undefined && v !== null) return String(v);
			}
			if (node.label !== undefined) return node.label;
			if (node.data !== null && typeof node.data !== 'object') return String(node.data);
			return '';
		},
		[labelPath],
	);
	const labelOfRef = useRef(labelOf);
	labelOfRef.current = labelOf;

	// ------------------------------------------------------------------ keyboard
	const [focusedKey, setFocusedKey] = useState<string | undefined>();

	useEffect(() => {
		if (focusedKey && visibleNodes.some(n => n.nodeKey === focusedKey)) return;
		setFocusedKey(visibleNodes[0]?.nodeKey);
	}, [visibleNodes, focusedKey]);

	const moveFocus = useCallback((nodeKey: string | undefined) => {
		if (!nodeKey) return;
		setFocusedKey(nodeKey);
		const el = document.querySelector<HTMLElement>(`[data-tree-key="${cssEscape(nodeKey)}"]`);
		el?.focus();
		el?.scrollIntoView({ block: 'nearest' });
	}, []);

	const onKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLElement>, node: TreeNodeModel) => {
			// The authored template may hold inputs; never steal their keys.
			const target = e.target as HTMLElement;
			if (
				target !== e.currentTarget &&
				target.closest('input,textarea,select,[contenteditable]')
			)
				return;

			const at = visibleNodes.findIndex(n => n.nodeKey === node.nodeKey);
			const expanded = isExpanded(node.nodeKey);

			switch (e.key) {
				case 'ArrowDown':
					e.preventDefault();
					moveFocus(visibleNodes[at + 1]?.nodeKey);
					break;
				case 'ArrowUp':
					e.preventDefault();
					moveFocus(visibleNodes[at - 1]?.nodeKey);
					break;
				case 'ArrowRight':
					e.preventDefault();
					if (node.hasChildren && !expanded) toggle(node);
					else if (node.children.length) moveFocus(node.children[0].nodeKey);
					break;
				case 'ArrowLeft':
					e.preventDefault();
					if (node.hasChildren && expanded) toggle(node);
					else if (node.parentDataPath)
						moveFocus(byPath.get(node.parentDataPath)?.nodeKey);
					break;
				case 'Home':
					e.preventDefault();
					moveFocus(visibleNodes[0]?.nodeKey);
					break;
				case 'End':
					e.preventDefault();
					moveFocus(visibleNodes[visibleNodes.length - 1]?.nodeKey);
					break;
				case 'Enter':
				case ' ':
					e.preventDefault();
					select(node);
					break;
				default:
					break;
			}
		},
		[visibleNodes, isExpanded, toggle, moveFocus, byPath, select],
	);

	// ------------------------------------------------------------------ columns active path
	const [boundActivePath, setBoundActivePath] = useState<any>();
	useEffect(() => {
		if (!activePathPath) return undefined;
		return addListenerAndCallImmediately(
			context.pageName,
			(_, v) => setBoundActivePath(v),
			activePathPath,
		);
	}, [activePathPath, context.pageName]);

	const [localActivePath, setLocalActivePath] = useState<string[]>([]);
	const activePath: string[] = useMemo(() => {
		if (activePathPath) return Array.isArray(boundActivePath) ? boundActivePath : [];
		return localActivePath;
	}, [activePathPath, boundActivePath, localActivePath]);

	const onDrillDown = useCallback(
		(node: TreeNodeModel, level: number) => {
			const next = [...activePath.slice(0, level), node.nodeKey];
			if (activePathPath) setStoreData(activePathPath, next, context.pageName);
			else setLocalActivePath(next);
			select(node);
		},
		[activePath, activePathPath, context.pageName, select],
	);

	// ------------------------------------------------------------------ styles
	const normal = processComponentStylePseudoClasses(
		pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);
	const hover = processComponentStylePseudoClasses(
		pageDefinition,
		{ hover: true },
		stylePropertiesWithPseudoStates,
	);
	const selectedStyles = processComponentStylePseudoClasses(
		pageDefinition,
		{ selected: true },
		stylePropertiesWithPseudoStates,
	);
	const disabledStyles = processComponentStylePseudoClasses(
		pageDefinition,
		{ disabled: true },
		stylePropertiesWithPseudoStates,
	);
	const dragOverStyles = processComponentStylePseudoClasses(
		pageDefinition,
		{ dragover: true },
		stylePropertiesWithPseudoStates,
	);

	const styleKey = `tree_${flattenUUID(key)}${
		locationHistory.length ? `_${locationHistory.map(e => e.index).join('_')}` : ''
	}`;

	/*
	 * Node-level slots are compiled into an instance-scoped stylesheet rather than applied
	 * inline. Inline styles win over any stylesheet, so a slot with an inline background could
	 * never show a hover or selected variant. Pseudo-elements (the guide lines) are
	 * unreachable from inline styles at all.
	 */
	const instanceCSS = useMemo(() => {
		const S = `.comp.compTree#${styleKey}`;
		let css = '';

		for (const [slot, sub] of STATEFUL_SLOTS) {
			css += processStyleObjectToCSS(normal[slot], `${S} ${sub}`);
			css += processStyleObjectToCSS(hover[slot], `${S} ._nodeRow:hover ${sub}`);
			css += processStyleObjectToCSS(selectedStyles[slot], `${S} ._nodeRow._selected ${sub}`);
			css += processStyleObjectToCSS(disabledStyles[slot], `${S} ._nodeRow._disabled ${sub}`);
			css += processStyleObjectToCSS(dragOverStyles[slot], `${S} ._nodeRow._dragOver ${sub}`);
		}

		// The descendant selectors above cannot reach the row itself.
		css += processStyleObjectToCSS(hover.nodeRow, `${S} ._nodeRow:hover`);
		css += processStyleObjectToCSS(selectedStyles.nodeRow, `${S} ._nodeRow._selected`);
		css += processStyleObjectToCSS(disabledStyles.nodeRow, `${S} ._nodeRow._disabled`);
		css += processStyleObjectToCSS(dragOverStyles.nodeRow, `${S} ._nodeRow._dragOver`);
		css += processStyleObjectToCSS(normal.nodeRow, `${S} ._nodeRow`);

		for (const sel of [
			`${S}._indented._showGuides ._children > ._node::before`,
			`${S}._indented._showGuides ._children > ._node > ._nodeRow::before`,
			`${S}._orgChart._showGuides ._children > ._node::before`,
			`${S}._orgChart._showGuides ._children > ._node::after`,
			`${S}._orgChart._showGuides ._node._expanded > ._children::before`,
		])
			css += processStyleObjectToCSS(normal.guideLine, sel);

		return css;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [styleKey, stylePropertiesWithPseudoStates]);

	const inlineStyles = useMemo(() => {
		const out: { [slot: string]: any } = {};
		for (const slot of INLINE_SLOTS) if (normal[slot]) out[slot] = normal[slot];
		return out;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [stylePropertiesWithPseudoStates]);

	// ------------------------------------------------------------------ render
	const firstChildEntry = Object.entries(children ?? {}).find(([, v]) => v);
	const firstChildTemplate = firstChildEntry ? { [firstChildEntry[0]]: true } : undefined;

	const design = treeDesign ?? '_indented';

	const renderCtx = useMemo<TreeRenderContext>(
		() => ({
			definition,
			pageDefinition,
			context,
			firstChildTemplate,
			nodeFrames,
			design,
			styleKey,
			inlineStyles,
			isExpanded,
			toggle,
			isSelected,
			isSelectable,
			select,
			selectionActive: selectionType !== 'NONE' && !!selectionPath && !readOnly,
			multiSelect: !!multiSelect,
			showCheckBoxes: !!showCheckBoxes,
			editable: canEdit,
			allowAdd: !!allowAdd,
			allowDelete: !!allowDelete,
			canDrag: (node: TreeNodeModel) =>
				canEdit &&
				(!!allowReorder || !!allowReparent) &&
				evalPerNode(canDragCondition, node),
			canDrop: (node: TreeNodeModel) => evalPerNode(canDropCondition, node),
			addNode,
			removeNode,
			drag,
			onDragStart,
			onDragOver,
			onDragLeave,
			onDrop,
			onDragEnd,
			focusedKey,
			setFocusedKey,
			onKeyDown,
			icons: {
				expand: expandIcon,
				collapse: collapseIcon,
				add: addIcon,
				remove: deleteIcon,
				drag: dragHandleIcon,
			},
			labelOf,
			keepCollapsedMounted:
				unmountCollapsedChildren === '_never' ||
				(unmountCollapsedChildren !== '_always' && design === '_accordion'),
		}),
		[
			definition,
			pageDefinition,
			context,
			firstChildTemplate,
			nodeFrames,
			design,
			styleKey,
			inlineStyles,
			isExpanded,
			toggle,
			isSelected,
			isSelectable,
			select,
			selectionType,
			selectionPath,
			readOnly,
			multiSelect,
			showCheckBoxes,
			canEdit,
			allowAdd,
			allowDelete,
			allowReorder,
			allowReparent,
			evalPerNode,
			canDragCondition,
			canDropCondition,
			addNode,
			removeNode,
			drag,
			onDragStart,
			onDragOver,
			onDragLeave,
			onDrop,
			onDragEnd,
			focusedKey,
			onKeyDown,
			expandIcon,
			collapseIcon,
			addIcon,
			deleteIcon,
			dragHandleIcon,
			labelOf,
			unmountCollapsedChildren,
		],
	);

	const className = [
		'comp compTree',
		design,
		colorScheme ?? '',
		design === '_orgChart' && treeOrientation === '_horizontal' ? '_horizontal' : '',
		showGuides !== false ? '_showGuides' : '',
		toggleStyle === '_plusMinus' ? '_plusMinus' : '',
		readOnly ? '_readOnly' : '',
		drag.sourceKey ? '_dragging' : '',
	]
		.filter(Boolean)
		.join(' ');

	let body: React.JSX.Element;
	if (!roots.length) {
		body = (
			<div className="_treeEmpty" style={inlineStyles.emptyState}>
				<SubHelperComponent definition={definition} subComponentName="emptyState" />
				{emptyStateText ?? ''}
			</div>
		);
	} else if (design === '_columns') {
		body = (
			<TreeColumns
				roots={roots}
				activePath={activePath}
				onDrillDown={onDrillDown}
				showColumnHeaders={!!showColumnHeaders}
				ctx={renderCtx}
			/>
		);
	} else {
		body = <TreeRecursive roots={roots} ctx={renderCtx} />;
	}

	return (
		<div
			className={className}
			id={styleKey}
			style={inlineStyles.comp}
			role={design === '_columns' ? 'group' : 'tree'}
			aria-multiselectable={design === '_columns' ? undefined : !!multiSelect}
		>
			<HelperComponent context={context} definition={definition} />
			{instanceCSS ? <style>{instanceCSS}</style> : undefined}
			{body}
		</div>
	);
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function findByNodeKey(roots: TreeNodeModel[], nodeKey: string): TreeNodeModel | undefined {
	for (const node of roots) {
		if (node.nodeKey === nodeKey) return node;
		const found = findByNodeKey(node.children, nodeKey);
		if (found) return found;
	}
	return undefined;
}

/** Walks parent links rather than comparing paths, so it is correct for every data shape. */
function isAncestorOrSelf(source: TreeNodeModel, target: TreeNodeModel): boolean {
	if (source.nodeKey === target.nodeKey) return true;
	return !!findByNodeKey(source.children, target.nodeKey);
}

function cssEscape(value: string): string {
	return value.replace(/["\\]/g, '\\$&');
}
