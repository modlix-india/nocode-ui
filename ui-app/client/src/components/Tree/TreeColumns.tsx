import React from 'react';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { TreeNodeModel } from '../util/treeData';
import { TreeNodeRow } from './TreeNodeRow';
import { TreeRenderContext } from './treeTypes';

/**
 * The Finder-style columns design.
 *
 * Structurally unlike the other three: this is not a render of the tree but a render of one
 * path through it. Column 0 holds the roots, and column n holds the children of the node
 * chosen in column n-1, so it is driven by the active path rather than an expansion set.
 *
 * Modelled as linked listboxes rather than a tree, because ARIA requires a treeitem's group to
 * be nested inside it and these columns are siblings. A series of single-select lists is what
 * this control actually is.
 */
export function TreeColumns({
	roots,
	activePath,
	onDrillDown,
	showColumnHeaders,
	ctx,
}: Readonly<{
	roots: TreeNodeModel[];
	/** One node key per level, deepest last. */
	activePath: string[];
	onDrillDown: (node: TreeNodeModel, level: number) => void;
	showColumnHeaders: boolean;
	ctx: TreeRenderContext;
}>) {
	// Walk the active path to collect the node list for each column.
	const columns: Array<{ nodes: TreeNodeModel[]; activeKey?: string }> = [];
	let level: TreeNodeModel[] = roots;

	for (let i = 0; i <= activePath.length; i++) {
		if (!level.length) break;

		const activeKey = activePath[i];
		columns.push({ nodes: level, activeKey });

		if (!activeKey) break;
		const chosen = level.find(n => n.nodeKey === activeKey);
		if (!chosen?.children.length) break;
		level = chosen.children;
	}

	return (
		<div className="_treeViewport _columnsViewport" style={ctx.inlineStyles.viewport}>
			<SubHelperComponent definition={ctx.definition} subComponentName="viewport" />
			{columns.map((col, i) => (
				<React.Fragment key={`col_${i}_${col.nodes[0]?.nodeKey ?? ''}`}>
					{i > 0 ? (
						<span
							className="_columnDivider"
							aria-hidden="true"
							style={ctx.inlineStyles.columnDividerLine}
						>
							<SubHelperComponent
								definition={ctx.definition}
								subComponentName="columnDividerLine"
							/>
						</span>
					) : undefined}
					<div
						className="_column"
						data-level={i}
						role="listbox"
						aria-label={`Level ${i + 1}`}
						style={ctx.inlineStyles.column}
					>
						<SubHelperComponent definition={ctx.definition} subComponentName="column" />
						{showColumnHeaders ? (
							<div
								className="_columnHeader"
								style={ctx.inlineStyles.columnHeaderPart}
							>
								<SubHelperComponent
									definition={ctx.definition}
									subComponentName="columnHeaderPart"
								/>
								{`Level ${i + 1}`}
							</div>
						) : undefined}
						<div className="_columnList">
							{col.nodes.map(node => (
								<div
									key={node.nodeKey}
									role="option"
									aria-selected={ctx.isSelected(node)}
									tabIndex={ctx.focusedKey === node.nodeKey ? 0 : -1}
									data-tree-key={node.nodeKey}
									onKeyDown={e => ctx.onKeyDown(e, node)}
									onFocus={e => {
										if (e.target === e.currentTarget)
											ctx.setFocusedKey(node.nodeKey);
									}}
									onClick={() => onDrillDown(node, i)}
								>
									<TreeNodeRow
										node={node}
										ctx={ctx}
										showToggle={false}
										showChevron={node.hasChildren}
										active={col.activeKey === node.nodeKey}
									/>
								</div>
							))}
						</div>
					</div>
				</React.Fragment>
			))}
		</div>
	);
}
