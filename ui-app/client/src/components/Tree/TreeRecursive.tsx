import React from 'react';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { TreeNodeModel } from '../util/treeData';
import { TreeNodeRow } from './TreeNodeRow';
import { TreeRenderContext } from './treeTypes';

/**
 * The recursive renderer, shared by the indented, accordion and org-chart designs.
 *
 * All three are the same "row plus children container" nesting; only the CSS differs. A nested
 * DOM is required anyway: the accordion animates its children container open via
 * grid-template-rows, and the org chart hangs its connector pseudo-elements off it.
 *
 * `._node` must contain exactly two in-flow children — the row then the children container —
 * or the accordion's two-track grid animation breaks. Overlays are absolutely positioned, so
 * they do not count.
 */
function TreeSubtree({
	node,
	ctx,
}: Readonly<{ node: TreeNodeModel; ctx: TreeRenderContext }>): React.JSX.Element {
	const expanded = ctx.isExpanded(node.nodeKey);
	const focused = ctx.focusedKey === node.nodeKey;

	// Keeping a collapsed subtree mounted is what lets the accordion animate it open, but on a
	// large indented tree it would render thousands of hidden node templates.
	const renderChildren = node.children.length > 0 && (expanded || ctx.keepCollapsedMounted);

	const className = [
		'_node',
		expanded ? '_expanded' : '_collapsed',
		node.hasChildren ? '_hasChildren' : '_leaf',
	].join(' ');

	return (
		<div
			className={className}
			style={ctx.inlineStyles.nodeContainer}
			role="treeitem"
			aria-expanded={node.hasChildren ? expanded : undefined}
			aria-selected={ctx.isSelected(node)}
			aria-level={node.depth + 1}
			aria-label={ctx.labelOf(node)}
			tabIndex={focused ? 0 : -1}
			data-tree-key={node.nodeKey}
			onKeyDown={e => ctx.onKeyDown(e, node)}
			onFocus={e => {
				if (e.target === e.currentTarget) ctx.setFocusedKey(node.nodeKey);
			}}
		>
			<SubHelperComponent definition={ctx.definition} subComponentName="nodeContainer" />

			<TreeNodeRow node={node} ctx={ctx} />

			{renderChildren ? (
				<div className="_children" role="group" style={ctx.inlineStyles.childrenContainer}>
					<SubHelperComponent
						definition={ctx.definition}
						subComponentName="childrenContainer"
					/>
					{node.children.map(child => (
						<TreeSubtree key={child.nodeKey} node={child} ctx={ctx} />
					))}
				</div>
			) : undefined}
		</div>
	);
}

export function TreeRecursive({
	roots,
	ctx,
}: Readonly<{ roots: TreeNodeModel[]; ctx: TreeRenderContext }>) {
	return (
		<div className="_treeViewport" style={ctx.inlineStyles.viewport}>
			<SubHelperComponent definition={ctx.definition} subComponentName="viewport" />
			{/*
			 * `._nodes` is the depth-0 group and nested groups are `._children`, which is what
			 * lets "no guide line at root level" be expressed as `._nodes > ._node` with no
			 * depth class in the CSS.
			 */}
			<div className="_nodes" role="none">
				{roots.map(node => (
					<TreeSubtree key={node.nodeKey} node={node} ctx={ctx} />
				))}
			</div>
		</div>
	);
}
