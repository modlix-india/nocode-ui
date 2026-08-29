import { CSSProperties } from 'react';
import {
	ComponentDefinition,
	LocationHistory,
	PageDefinition,
	RenderContext,
} from '../../types/common';
import { DropPosition, TreeNodeModel } from '../util/treeData';

export interface TreeDragState {
	sourceKey?: string;
	overKey?: string;
	position?: DropPosition;
	denied?: boolean;
}

/**
 * Everything the renderers need, assembled once per render in LazyTree and passed down as a
 * single prop.
 *
 * Deliberately not carried on `RenderContext`: Table threads its per-row state through
 * `context.table`, which mints a new context identity for every row and so defeats memoisation
 * in every descendant.
 */
export interface TreeRenderContext {
	definition: ComponentDefinition;
	pageDefinition: PageDefinition;
	context: RenderContext;

	/** The single authored child that is re-rendered per node, or undefined for built-in chrome. */
	firstChildTemplate?: { [key: string]: boolean };
	/** Builds the two-frame locationHistory that makes `Parent.<field>` resolve to this node. */
	nodeFrames: (node: TreeNodeModel) => Array<LocationHistory>;

	design: string;
	styleKey: string;
	inlineStyles: { [slot: string]: CSSProperties };

	isExpanded: (nodeKey: string) => boolean;
	toggle: (node: TreeNodeModel) => void;

	isSelected: (node: TreeNodeModel) => boolean;
	isSelectable: (node: TreeNodeModel) => boolean;
	select: (node: TreeNodeModel) => void;
	/**
	 * Whether selection is switched on at all. Distinct from `isSelectable`, which is also
	 * false when selection is off — without this, a tree that simply does not use selection
	 * would render every row in the disabled style.
	 */
	selectionActive: boolean;
	multiSelect: boolean;
	showCheckBoxes: boolean;

	editable: boolean;
	allowAdd: boolean;
	allowDelete: boolean;
	canDrag: (node: TreeNodeModel) => boolean;
	canDrop: (node: TreeNodeModel) => boolean;
	addNode: (node: TreeNodeModel, mode: 'CHILD' | 'SIBLING') => void;
	removeNode: (node: TreeNodeModel) => void;

	drag: TreeDragState;
	onDragStart: (e: React.DragEvent<HTMLElement>, node: TreeNodeModel) => void;
	onDragOver: (e: React.DragEvent<HTMLElement>, node: TreeNodeModel) => void;
	onDragLeave: (e: React.DragEvent<HTMLElement>, node: TreeNodeModel) => void;
	onDrop: (e: React.DragEvent<HTMLElement>, node: TreeNodeModel) => void;
	onDragEnd: () => void;

	focusedKey?: string;
	setFocusedKey: (nodeKey: string) => void;
	onKeyDown: (e: React.KeyboardEvent<HTMLElement>, node: TreeNodeModel) => void;

	icons: {
		expand?: string;
		collapse?: string;
		add?: string;
		remove?: string;
		drag?: string;
	};

	labelOf: (node: TreeNodeModel) => string;
	/** Keep collapsed children mounted, so the accordion can animate them open. */
	keepCollapsedMounted: boolean;
}
