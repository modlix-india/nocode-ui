import React from 'react';
import Children from '../Children';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { TreeNodeModel } from '../util/treeData';
import { TreeRenderContext } from './treeTypes';

const DROP_SLOT = { BEFORE: 'dropBefore', AFTER: 'dropAfter', INSIDE: 'dropInto' } as const;

function DefaultCaret() {
	return (
		<svg
			className="_toggleIcon"
			width="8"
			height="8"
			viewBox="0 0 8 8"
			fill="none"
			aria-hidden="true"
		>
			<path
				d="M1 2.5L4 5.5L7 2.5"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function NodeToggle({ node, ctx }: Readonly<{ node: TreeNodeModel; ctx: TreeRenderContext }>) {
	const { definition, inlineStyles } = ctx;
	const expanded = ctx.isExpanded(node.nodeKey);

	if (!node.hasChildren)
		return (
			<span className="_leafSpacer" style={inlineStyles.leafSpacer}>
				<SubHelperComponent definition={definition} subComponentName="leafSpacer" />
			</span>
		);

	const iconClass = expanded ? ctx.icons.collapse : ctx.icons.expand;

	return (
		<button
			type="button"
			tabIndex={-1}
			aria-hidden="true"
			className={`_toggle ${expanded ? '_expanded' : '_collapsed'}`}
			style={{
				...inlineStyles.toggle,
				...(expanded ? inlineStyles.toggleExpanded : inlineStyles.toggleCollapsed),
			}}
			onClick={e => {
				// Without stopping here, expanding a node would also select it.
				e.stopPropagation();
				e.preventDefault();
				ctx.toggle(node);
			}}
		>
			<SubHelperComponent
				definition={definition}
				subComponentName={expanded ? 'toggleExpanded' : 'toggleCollapsed'}
			/>
			{iconClass ? <i className={`_toggleIcon ${iconClass}`} /> : <DefaultCaret />}
		</button>
	);
}

function NodeActions({ node, ctx }: Readonly<{ node: TreeNodeModel; ctx: TreeRenderContext }>) {
	const { definition, inlineStyles } = ctx;

	return (
		<span className="_nodeActions" style={inlineStyles.nodeActions}>
			<SubHelperComponent definition={definition} subComponentName="nodeActions" />
			{ctx.allowAdd ? (
				<button
					type="button"
					tabIndex={-1}
					title="Add child"
					className={`_buttonAdd ${ctx.icons.add ?? 'fa-solid fa-circle-plus'}`}
					style={inlineStyles.buttonAdd}
					onClick={e => {
						e.stopPropagation();
						ctx.addNode(node, 'CHILD');
					}}
				>
					<SubHelperComponent definition={definition} subComponentName="buttonAdd" />
				</button>
			) : undefined}
			{ctx.allowDelete ? (
				<button
					type="button"
					tabIndex={-1}
					title="Delete"
					className={`_buttonDelete ${ctx.icons.remove ?? 'fa-solid fa-circle-minus'}`}
					style={inlineStyles.buttonDelete}
					onClick={e => {
						e.stopPropagation();
						ctx.removeNode(node);
					}}
				>
					<SubHelperComponent definition={definition} subComponentName="buttonDelete" />
				</button>
			) : undefined}
		</span>
	);
}

/**
 * The chrome around one node, shared by all four designs.
 *
 * Every design renders this same markup and differs only in the CSS that lays it out. That is
 * what guarantees `Parent.<field>` resolves identically whichever design is selected: the
 * node's locationHistory is built in exactly one place.
 */
export function TreeNodeRow({
	node,
	ctx,
	showToggle = true,
	showChevron = false,
	active = false,
}: Readonly<{
	node: TreeNodeModel;
	ctx: TreeRenderContext;
	showToggle?: boolean;
	showChevron?: boolean;
	/** Columns design: this node's children are shown in the next column. */
	active?: boolean;
}>) {
	const { definition, drag, inlineStyles } = ctx;
	const selected = ctx.isSelected(node);
	const selectable = ctx.isSelectable(node);
	const isDropTarget = drag.overKey === node.nodeKey && !!drag.position;

	const className = [
		'_nodeRow',
		node.hasChildren ? '_hasChildren' : '_leaf',
		selected ? '_selected' : '',
		active ? '_active' : '',
		// Only a node excluded from an *active* selection is disabled. A tree that does not
		// use selection at all must render normally.
		ctx.selectionActive && !selectable ? '_disabled' : '',
		drag.sourceKey === node.nodeKey ? '_dragSource' : '',
		isDropTarget ? '_dragOver' : '',
		isDropTarget && drag.denied ? '_dropDenied' : '',
	]
		.filter(Boolean)
		.join(' ');

	return (
		<span
			className={className}
			style={inlineStyles.nodeRow}
			draggable={ctx.editable && ctx.canDrag(node)}
			onDragStart={ctx.editable ? e => ctx.onDragStart(e, node) : undefined}
			onDragOver={ctx.editable ? e => ctx.onDragOver(e, node) : undefined}
			onDragLeave={ctx.editable ? e => ctx.onDragLeave(e, node) : undefined}
			onDrop={ctx.editable ? e => ctx.onDrop(e, node) : undefined}
			onDragEnd={ctx.editable ? ctx.onDragEnd : undefined}
			onClick={() => ctx.select(node)}
			// The row is chrome, not the widget: `._node` carries role="treeitem", the tab stop
			// and the key handling. A keydown listener here would never fire, since the focused
			// element is the ancestor node and keydown does not propagate downward.
			role="presentation"
		>
			<SubHelperComponent definition={definition} subComponentName="nodeRow" />

			{showToggle ? <NodeToggle node={node} ctx={ctx} /> : undefined}

			{ctx.multiSelect && ctx.showCheckBoxes ? (
				<input
					className="_checkBox"
					style={inlineStyles.checkBox}
					type="checkbox"
					checked={selected}
					tabIndex={-1}
					aria-label={ctx.labelOf(node)}
					onClick={e => e.stopPropagation()}
					onChange={e => {
						e.stopPropagation();
						ctx.select(node);
					}}
				/>
			) : undefined}

			<span className="_nodeContent" style={inlineStyles.nodeContent}>
				<SubHelperComponent definition={definition} subComponentName="nodeContent" />
				{ctx.firstChildTemplate ? (
					<Children
						pageDefinition={ctx.pageDefinition}
						renderableChildren={ctx.firstChildTemplate}
						context={ctx.context}
						locationHistory={ctx.nodeFrames(node)}
					/>
				) : (
					ctx.labelOf(node)
				)}
			</span>

			{showChevron ? (
				<i
					className="_columnChevron"
					aria-hidden="true"
					style={inlineStyles.columnChevronIcon}
				>
					<SubHelperComponent
						definition={definition}
						subComponentName="columnChevronIcon"
					/>
				</i>
			) : undefined}

			{ctx.editable && (ctx.allowAdd || ctx.allowDelete) ? (
				<NodeActions node={node} ctx={ctx} />
			) : undefined}

			{isDropTarget && drag.position ? (
				<span
					className={`_dropIndicator _${drag.position.toLowerCase()}`}
					style={inlineStyles[DROP_SLOT[drag.position]]}
				/>
			) : undefined}
		</span>
	);
}
